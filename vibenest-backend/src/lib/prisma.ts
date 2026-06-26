import { PrismaClient } from '@prisma/client';
import path from 'path';

const isVercel = !!process.env.VERCEL;
const dbUrl = isVercel
  ? `file:${path.join(process.cwd(), 'prisma/dev.db')}`
  : undefined;

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {})
});

export default prisma;
