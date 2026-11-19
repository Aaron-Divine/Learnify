import { getCourses } from '@/lib/db';
import { HomePageClient } from '@/components/HomePageClient';

export const revalidate = 0;

export default async function HomePage() {
  const courses = await getCourses();
  return <HomePageClient initialCourses={courses} />;
}
