import dotenv from 'dotenv';
import path from 'path';

// Load env files from execution path
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config(); // fallback local

import app from './app.js';

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[VibeNest Core API] Server successfully booted on port ${PORT}`);
  });
}

export default app;
