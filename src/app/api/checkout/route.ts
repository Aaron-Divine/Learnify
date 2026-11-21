import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth';
import { getCourseById, isUserEnrolled, createPayment, createEnrollment } from '@/lib/db';
import { getPaymentProvider } from '@/lib/payment';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Student
    const student = await getStudentSession(req);
    if (!student) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in or create an account to purchase.' },
        { status: 401 }
      );
    }

    // 2. Check Rate Limit (Lockout after 5 failed attempts)
    const rateLimit = checkRateLimit(student.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed payment attempts. Your account is temporarily locked from checkout for ${Math.ceil(
            (rateLimit.retryAfterSeconds || 600) / 60
          )} minutes.`,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
          status: 'rate_limited',
        },
        { status: 429 }
      );
    }

    // 3. Parse and Validate Request
    const body = await req.json();
    const { course_id, veylo_account_number, account_number, wallet_address, pin } = body;

    if (!course_id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

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

    // 4. Fetch Course
    const course = await getCourseById(course_id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // 5. Check if already enrolled (Idempotent Guard)
    const alreadyEnrolled = await isUserEnrolled(student.id, course.id);
    if (alreadyEnrolled) {
      return NextResponse.json({
        success: true,
        status: 'already_enrolled',
        message: 'You are already enrolled in this course! You have full access.',
        course_id: course.id,
      });
    }

    // 6. Generate Unique Reference for this payment attempt
    const reference = `lrf_pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 7. Execute Charge via Payment Provider (Mock or Real Wallet API)
    // NOTE: Veylo credentials exist in memory only during this request and are NEVER logged or saved.
    const provider = getPaymentProvider();
    const chargeResult = await provider.charge({
      veylo_account_number: cleanAccount,
      wallet_address: wallet_address?.trim(),
      pin: cleanPin,
      amount: course.price,
      currency: course.currency_code,
      reference,
      description: `Course purchase: ${course.title.slice(0, 50)}`,
      receiver_wallet_address: course.wallet_address,
    });

    // 8. Handle Failure Response
    if (chargeResult.status === 'failed') {
      recordFailedAttempt(student.id);

      // Save audit payment record (without any sensitive card data)
      await createPayment({
        user_id: student.id,
        course_id: course.id,
        reference,
        amount: course.price,
        currency: course.currency_code,
        status: 'failed',
        failure_code: chargeResult.code,
      });

      const updatedLimit = checkRateLimit(student.id);

      return NextResponse.json({
        success: false,
        status: 'failed',
        code: chargeResult.code,
        message: chargeResult.message,
        remainingAttempts: updatedLimit.remainingAttempts,
        reference,
      });
    }

    // 9. Handle Success Response
    resetRateLimit(student.id);

    // Record verified payment
    const payment = await createPayment({
      user_id: student.id,
      course_id: course.id,
      reference,
      wallet_transaction_id: chargeResult.transaction_id,
      amount: course.price,
      currency: course.currency_code,
      status: 'success',
    });

    // Grant enrollment access
    const enrollment = await createEnrollment({
      user_id: student.id,
      course_id: course.id,
      payment_id: payment.id,
    });

    return NextResponse.json({
      success: true,
      status: 'success',
      transaction_id: chargeResult.transaction_id,
      reference,
      course_id: course.id,
      enrollment_id: enrollment.id,
      amount: course.price,
      currency: course.currency_code,
      debited_amount_ngn: (chargeResult as any).debited_amount_ngn,
      debited_currency: (chargeResult as any).debited_currency || 'NGN',
      exchange_rate: (chargeResult as any).exchange_rate,
      protocol: (chargeResult as any).protocol || 'Interledger Rafiki',
      message: 'Payment verified! You are now enrolled in this course.',
    });
  } catch (err: any) {
    console.error('[Checkout API Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Unexpected payment processing error.' },
      { status: 500 }
    );
  }
}
