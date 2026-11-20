import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth';
import { getCommunitySubscription } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const student = await getStudentSession(req);
    if (!student) {
      return NextResponse.json({ active: false, subscription: null });
    }

    const subscription = await getCommunitySubscription(student.id);

    return NextResponse.json({
      active: Boolean(subscription && subscription.status === 'active'),
      subscription,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to retrieve subscription status' },
      { status: 500 }
    );
  }
}
