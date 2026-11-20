import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth';
import { getCommunitySubscription, cancelCommunitySubscription } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const student = await getStudentSession(req);
    if (!student) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const subscription = await getCommunitySubscription(student.id);
    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found for this user.' },
        { status: 400 }
      );
    }

    const walletApiUrl = (process.env.WALLET_API_URL || 'https://veylo-beta.vercel.app').replace(/\/+$/, '');
    const reference = `renew_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Call Veylo Wallet API to execute recurring mandate deduction
    const res = await fetch(`${walletApiUrl}/api/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WALLET_API_KEY || ''}`,
      },
      body: JSON.stringify({
        veylo_account_number: subscription.veylo_account_number,
        amount: subscription.amount_usd || 19.0,
        currency: 'USD',
        reference,
        mandate_reference: subscription.mandate_reference,
        is_recurring: true,
        description: `Monthly Renewal (30s Cycle): Premium Learning Community ($19.00 USD)`,
      }),
    });

    const data = await res.json().catch(() => null);

    // ── CASE 1: MANDATE WAS REVOKED IN VEYLO ──────────────────────────────────
    if (data?.code === 'MANDATE_REVOKED') {
      // Mark subscription cancelled in Learnify as well
      await cancelCommunitySubscription(student.id);

      return NextResponse.json({
        success: false,
        status: 'blocked',
        code: 'MANDATE_REVOKED',
        message: data.message || 'Recurring transfer blocked! Open Payments mandate was revoked in your Veylo wallet.',
        mandate_reference: subscription.mandate_reference,
      });
    }

    // ── CASE 2: PAYMENT FAILURE (INSUFFICIENT FUNDS, ETC) ─────────────────────
    if (!res.ok || data?.status !== 'success') {
      return NextResponse.json({
        success: false,
        status: 'failed',
        code: data?.code || 'CHARGE_FAILED',
        message: data?.message || 'Recurring deduction failed.',
      });
    }

    // ── CASE 3: SUCCESSFUL RECURRING DEBIT ────────────────────────────────────
    return NextResponse.json({
      success: true,
      status: 'success',
      message: 'Monthly recurring deduction processed successfully via Open Payments mandate.',
      transaction_id: data.transaction_id,
      debited_amount_ngn: data.debited_amount_ngn,
      exchange_rate: data.exchange_rate,
      mandate_reference: subscription.mandate_reference,
      timestamp: new Date().toLocaleTimeString(),
    });
  } catch (err: any) {
    console.error('Recurring charge error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to process recurring charge.' },
      { status: 500 }
    );
  }
}
