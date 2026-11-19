import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@learnify.com';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'learnify2026!';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password } = body;

    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Signed out successfully' });
      response.cookies.delete('learnify_admin_session');
      return response;
    }

    const adminEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (email.toLowerCase().trim() === adminEmail && password === adminPassword) {
      const sessionData = {
        email: adminEmail,
        role: 'admin',
        authenticatedAt: new Date().toISOString(),
      };

      const response = NextResponse.json({
        success: true,
        user: {
          email: adminEmail,
          role: 'admin',
        },
      });

      // Set cookie for 7 days
      response.cookies.set('learnify_admin_session', JSON.stringify(sessionData), {
        httpOnly: false, // Accessible to client-side auth state
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid admin email or password' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Authentication error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('learnify_admin_session');
  if (!cookie?.value) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  try {
    const data = JSON.parse(cookie.value);
    if (data?.role === 'admin') {
      return NextResponse.json({
        authenticated: true,
        user: { email: data.email, role: 'admin' },
      });
    }
  } catch {}

  return NextResponse.json({ authenticated: false }, { status: 200 });
}
