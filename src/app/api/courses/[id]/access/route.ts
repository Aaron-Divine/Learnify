import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession, isAdminSession } from '@/lib/auth';
import { getCourseById, isUserEnrolled } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const course = await getCourseById(courseId);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // 1. Check if Admin
    const isAdmin = await isAdminSession(req);
    if (isAdmin) {
      return NextResponse.json({
        unlocked: true,
        role: 'admin',
        video_url: course.video_url,
      });
    }

    // 2. Check if Enrolled Student
    const student = await getStudentSession(req);
    if (student) {
      const enrolled = await isUserEnrolled(student.id, courseId);
      if (enrolled) {
        return NextResponse.json({
          unlocked: true,
          role: 'student',
          video_url: course.video_url,
        });
      }
    }

    // 3. Locked for visitors and un-enrolled students
    return NextResponse.json(
      {
        unlocked: false,
        message: 'Course video is locked. Please purchase to gain full streaming access.',
      },
      { status: 403 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to check course access permissions' },
      { status: 500 }
    );
  }
}
