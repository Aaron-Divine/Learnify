import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCourseById, isUserEnrolled } from '@/lib/db';
import { getStudentSession, isAdminSession } from '@/lib/auth';
import { CourseDetailsClient } from '@/components/CourseDetailsClient';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourseById(params.id);
  if (!course) {
    return {
      title: 'Course Not Found | Learnify',
    };
  }

  return {
    title: `${course.title} | Learnify`,
    description: course.summary.slice(0, 160),
    openGraph: {
      title: course.title,
      description: course.summary.slice(0, 160),
      images: course.thumbnail_url ? [course.thumbnail_url] : [],
    },
  };
}

export default async function CoursePage({ params }: Props) {
  const course = await getCourseById(params.id);

  if (!course) {
    notFound();
  }

  // Server-side access check:
  // Only students who bought the course (and admin) get the video URL
  const [isAdmin, student] = await Promise.all([
    isAdminSession(),
    getStudentSession(),
  ]);

  const isEnrolled = student ? await isUserEnrolled(student.id, course.id) : false;
  const hasAccess = isAdmin || isEnrolled;

  // Mask video_url for non-enrolled visitors so it is never exposed in initial HTML
  const sanitizedCourse = {
    ...course,
    video_url: hasAccess ? course.video_url : '',
  };

  return (
    <CourseDetailsClient
      course={sanitizedCourse}
      initialHasAccess={hasAccess}
    />
  );
}
