import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '@/lib/db';
import { hashPassword, verifyPassword, signStudentSession, getStudentSession, STUDENT_COOKIE_NAME } from '@/lib/auth';

// GET /api/auth/student -> Get current student profile
export async function GET(req: NextRequest) {
  try {
    const student = await getStudentSession(req);
    if (!student) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }
    return NextResponse.json({ authenticated: true, user: student }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err?.message }, { status: 500 });
  }
}

// POST /api/auth/student -> login, signup, logout
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, name, email, password } = body;

    // 1. LOGOUT
    if (action === 'logout') {
      const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
      res.cookies.set(STUDENT_COOKIE_NAME, '', {
        maxAge: 0,
        path: '/',
      });
      return res;
    }

    // 2. SIGN UP
    if (action === 'signup') {
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
      }
      if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
      }
      if (!password || password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }

      const existing = await getUserByEmail(email);
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists. Please log in.' }, { status: 409 });
      }

      const passwordHash = hashPassword(password);
      const newUser = await createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password_hash: passwordHash,
        role: 'student',
      });

      const safeUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at,
      };

      const token = signStudentSession(safeUser);
      const res = NextResponse.json({ success: true, user: safeUser });

      res.cookies.set(STUDENT_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return res;
    }

    // 3. LOGIN
    if (action === 'login' || !action) {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const user = await getUserByEmail(email);
      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const valid = verifyPassword(password, user.password_hash);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      };

      const token = signStudentSession(safeUser);
      const res = NextResponse.json({ success: true, user: safeUser });

      res.cookies.set(STUDENT_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return res;
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Authentication error' }, { status: 500 });
  }
}
