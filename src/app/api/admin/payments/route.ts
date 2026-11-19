import { NextRequest, NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/auth';
import { getEnrichedPayments } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const payments = await getEnrichedPayments();
    return NextResponse.json({ success: true, payments });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch payment records' },
      { status: 500 }
    );
  }
}
