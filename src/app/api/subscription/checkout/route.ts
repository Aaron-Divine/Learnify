import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth';
import { saveCommunitySubscription, getCommunitySubscription } from '@/lib/db';
import { getPaymentProvider } from '@/lib/payment';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Student
    const student = await getStudentSession(req);
    if (!student) {
      return NextResponse.json(
        { error: 'Please sign in or create an account to join the community.' },
        { status: 401 }
      );
    }

    // 2. Check if already subscribed
    const existing = await getCommunitySubscription(student.id);
    if (existing) {
      return NextResponse.json({
        success: true,
        status: 'already_active',
        message: 'You already have an active Premium Learning Community membership!',
        subscription: existing,
      });
    }

    // 3. Parse input
    const body = await req.json();
    const { veylo_account_number, account_number, wallet_address, pin, price_usd = 19.0 } = body;

    const cleanAccount = (veylo_account_number || account_number || '').replace(/\s+/g, '');
    const cleanPin = (pin || '').trim();

    if (!cleanAccount || cleanAccount.length !== 10) {
      return NextResponse.json(
        { error: 'A valid 10-digit Veylo account number is required.' },
        { status: 400 }
      );
    }

    if (!cleanPin || cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
      return NextResponse.json(
        { error: 'A valid 4-digit Veylo PIN is required.' },
        { status: 400 }
      );
    }

    // 4. Charge first month via Veylo Wallet API (converts USD to NGN via Rafiki)
    const reference = `lrf_sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const provider = getPaymentProvider();

    const chargeResult = await provider.charge({
      veylo_account_number: cleanAccount,
      wallet_address: wallet_address?.trim(),
      pin: cleanPin,
      amount: price_usd,
      currency: 'USD',
      reference,
      description: 'Subscription: Premium Learning Community (Monthly)',
    });

    if (chargeResult.status === 'failed') {
      return NextResponse.json(
        {
          error: chargeResult.message || 'Payment was declined by Veylo wallet.',
          code: chargeResult.code,
        },
        { status: 400 }
      );
    }

    // 5. Register recurring Open Payments mandate on Veylo
    const mandateReference = `MAN-LRN-${Date.now().toString(36).toUpperCase()}`;
    const walletApiUrl = (process.env.WALLET_API_URL || 'https://veylo-beta.vercel.app').replace(/\/+$/, '');

    try {
      await fetch(`${walletApiUrl}/api/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WALLET_API_KEY || ''}`,
        },
        body: JSON.stringify({
          account_number: cleanAccount,
          merchant_name: 'Learnify',
          plan_name: 'Premium Learning Community',
          amount_ngn: chargeResult.debited_amount_ngn || 25705.67,
          foreign_amount: price_usd,
          foreign_currency: 'USD',
          frequency: 'monthly',
          mandate_reference: mandateReference,
        }),
      });
    } catch (err) {
      console.warn('Failed to register mandate on Veylo server:', err);
    }

    // 6. Save subscription in Learnify DB
    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    const subscription = await saveCommunitySubscription({
      user_id: student.id,
      student_email: student.email,
      student_name: student.name,
      veylo_account_number: cleanAccount,
      mandate_reference: mandateReference,
      plan_name: 'Premium Learning Community',
      amount_usd: price_usd,
      amount_ngn: chargeResult.debited_amount_ngn || 25705.67,
      exchange_rate: chargeResult.exchange_rate || 1352.93,
      status: 'active',
      next_billing_date: nextBilling.toISOString().split('T')[0],
    });

    return NextResponse.json({
      success: true,
      status: 'success',
      message: 'Welcome to the Premium Learning Community! Your recurring subscription is active.',
      subscription,
      debited_amount_ngn: chargeResult.debited_amount_ngn,
      exchange_rate: chargeResult.exchange_rate,
      transaction_id: chargeResult.transaction_id,
      mandate_reference: mandateReference,
      manage_url: 'https://veylo-beta.vercel.app/app/subscriptions',
    });
  } catch (err: any) {
    console.error('Subscription checkout error:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred during subscription checkout.' },
      { status: 500 }
    );
  }
}
