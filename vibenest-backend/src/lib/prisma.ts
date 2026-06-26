import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const isVercel = !!process.env.VERCEL;
let dbUrl: string | undefined = undefined;

if (isVercel) {
  const srcPath = path.join(process.cwd(), 'prisma/dev.db');
  const destPath = '/tmp/dev.db';
  
  try {
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log('Database successfully copied to /tmp');
    }
    dbUrl = `file:${destPath}`;
  } catch (error) {
    console.error('Failed to copy database to /tmp:', error);
  }
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {})
});

export default prisma;
