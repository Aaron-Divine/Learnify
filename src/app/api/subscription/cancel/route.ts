import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth';
import { getCommunitySubscription, cancelCommunitySubscription } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const student = await getStudentSession(req);
    if (!student) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const currentSub = await getCommunitySubscription(student.id);
    if (!currentSub) {
      return NextResponse.json(
        { error: 'No active subscription found to cancel.' },
        { status: 400 }
      );
    }

    // 1. Cancel in Learnify database
    await cancelCommunitySubscription(student.id);

    // 2. Notify Veylo to revoke the mandate and stop future debits
    const walletApiUrl = (process.env.WALLET_API_URL || 'https://veylo-beta.vercel.app').replace(/\/+$/, '');
    try {
      await fetch(`${walletApiUrl}/api/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WALLET_API_KEY || ''}`,
        },
        body: JSON.stringify({
          action: 'revoke',
          mandate_id: currentSub.mandate_reference,
          account_number: currentSub.veylo_account_number,
        }),
      });
    } catch (err) {
      console.warn('Failed to notify Veylo of mandate revocation:', err);
    }

    return NextResponse.json({
      success: true,
      status: 'cancelled',
      message: 'Your Premium Learning Community subscription has been cancelled and recurring transfers have been stopped in your Veylo wallet.',
      mandate_reference: currentSub.mandate_reference,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
