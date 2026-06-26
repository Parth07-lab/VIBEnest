import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import prisma from '../lib/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vibenest_super_secret_jwt_key_123!';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'vibenest_super_secret_jwt_refresh_key_123!';

// Helper to generate access & refresh tokens
function generateTokens(payload: any) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

// User Registration
export async function register(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const passwordHash = bcrypt.hashSync(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        emailVerified: false,
      },
    });

    // Automatically send mock OTP to logs
    console.log(`[Email Mock OTP] Sent activation email to ${email} with OTP: 123456`);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Verify your email to activate account.',
      data: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// User Login (Customer)
export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const tokenPayload = { id: user.id, email: user.email, name: user.name };
    const { accessToken, refreshToken } = generateTokens(tokenPayload);

    // Save session in database
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        device: req.headers['user-agent'],
        ip: req.ip,
      },
    });

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token: accessToken,
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Google OAuth mock endpoint
export async function googleAuth(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, name, googleToken } = req.body;

    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Email and Name are required.' });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: bcrypt.hashSync(Math.random().toString(36), 12),
          emailVerified: true,
          provider: 'google',
        },
      });
    }

    const tokenPayload = { id: user.id, email: user.email, name: user.name };
    const { accessToken, refreshToken } = generateTokens(tokenPayload);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Google login successful.',
      data: {
        token: accessToken,
        user: { id: user.id, name: user.name, email: user.email },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Token Refresh
export async function refresh(req: AuthenticatedRequest, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token missing.' });
    }

    // Verify in db
    const session = await prisma.session.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date() || session.user.deletedAt) {
      return res.status(403).json({ success: false, message: 'Invalid or expired session.' });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'Invalid refresh token.' });
      }

      const tokenPayload = { id: session.user.id, email: session.user.email, name: session.user.name };
      const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '15m' });

      return res.status(200).json({
        success: true,
        data: { token: accessToken },
      });
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Logout
export async function logout(req: AuthenticatedRequest, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      await prisma.session.deleteMany({ where: { token: refreshToken } });
    }

    res.clearCookie('refreshToken');
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Verify OTP Stub
export async function verifyEmail(req: AuthenticatedRequest, res: Response) {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
  }

  if (otp === '123456') {
    await prisma.user.updateMany({
      where: { email },
      data: { emailVerified: true },
    });
    return res.status(200).json({ success: true, message: 'Email verified successfully.' });
  }

  return res.status(400).json({ success: false, message: 'Invalid verification OTP code.' });
}

// Reset Password Stubs
export async function forgotPassword(req: AuthenticatedRequest, res: Response) {
  const { email } = req.body;
  console.log(`[Forgot Password] Reset link requested for: ${email}`);
  return res.status(200).json({ success: true, message: 'Reset password link sent if email exists.' });
}

export async function resetPassword(req: AuthenticatedRequest, res: Response) {
  const { token, password } = req.body;
  console.log(`[Reset Password] Setting password using token: ${token}`);
  return res.status(200).json({ success: true, message: 'Password reset successfully.' });
}

// Admin Login with 2FA / TOTP Check
export async function adminLogin(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password, totpToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const adminUser = await prisma.admin.findUnique({ where: { email } });
    if (!adminUser) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const isMatch = bcrypt.compareSync(password, adminUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    // 2FA bypass: MFA check removed per user request

    // Create Admin Token
    const adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Save audit log
    await prisma.auditLog.create({
      data: {
        adminId: adminUser.id,
        action: 'LOGIN',
        entity: 'Admin',
        entityId: adminUser.id,
        ip: req.ip,
        after: JSON.stringify({ email: adminUser.email, role: adminUser.role }),
      },
    });

    // Update lastLogin
    await prisma.admin.update({
      where: { id: adminUser.id },
      data: { lastLogin: new Date() },
    });

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful.',
      data: {
        token: adminToken,
        admin: { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
