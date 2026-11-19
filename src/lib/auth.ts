import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { SafeUser } from '@/types';

const SECRET_KEY = process.env.SESSION_SECRET || 'learnify_session_secret_key_phase2_2026!';
const STUDENT_COOKIE_NAME = 'learnify_student_session';
const ADMIN_COOKIE_NAME = 'learnify_admin_session';

// ==========================================
// PASSWORD HASHING (PBKDF2 SHA-512)
// ==========================================

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const currentHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(currentHash, 'hex'));
}

// ==========================================
// SESSION TOKEN SIGNING & VERIFICATION (HMAC)
// ==========================================

interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: 'student';
  exp: number; // timestamp in ms
}

export function signStudentSession(user: SafeUser): string {
  const payload: SessionPayload = {
    userId: user.id,
    name: user.name,
    email: user.email.toLowerCase(),
    role: 'student',
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

export function verifyStudentSession(token: string | undefined): SafeUser | null {
  if (!token || !token.includes('.')) return null;

  try {
    const [payloadB64, signature] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(payloadB64).digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (Date.now() > payload.exp) {
      return null; // Expired
    }

    return {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      role: 'student',
      created_at: '',
    };
  } catch {
    return null;
  }
}

// ==========================================
// SESSION RETRIEVAL HELPERS
// ==========================================

export async function getStudentSession(req?: NextRequest): Promise<SafeUser | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(STUDENT_COOKIE_NAME)?.value;
  } else {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(STUDENT_COOKIE_NAME)?.value;
    } catch {
      return null;
    }
  }

  return verifyStudentSession(token);
}

export async function isAdminSession(req?: NextRequest): Promise<boolean> {
  let cookieVal: string | undefined;

  if (req) {
    cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  } else {
    try {
      const cookieStore = cookies();
      cookieVal = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    } catch {
      return false;
    }
  }

  if (!cookieVal) return false;

  try {
    const data = JSON.parse(cookieVal);
    return data?.role === 'admin';
  } catch {
    return false;
  }
}

export { STUDENT_COOKIE_NAME, ADMIN_COOKIE_NAME };
