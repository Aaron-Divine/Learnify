import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth';
import { getUserEnrolledCourses } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const student = await getStudentSession(req);
    if (!student) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in as a student.' },
        { status: 401 }
      );
    }

    const courses = await getUserEnrolledCourses(student.id);
    return NextResponse.json({
      success: true,
      courses,
      student: { id: student.id, name: student.name, email: student.email },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch enrolled courses' },
      { status: 500 }
    );
  }
}
