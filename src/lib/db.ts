import fs from 'fs';
import path from 'path';
import { Course, CourseFormData, User, Enrollment, Payment, EnrichedPayment } from '@/types';
import { formatWalletAddress } from './currencies';
import { hashPassword } from './auth';

const DATA_DIR = path.join(process.cwd(), 'data');
const COURSES_FILE_PATH = path.join(DATA_DIR, 'courses.json');
const USERS_FILE_PATH = path.join(DATA_DIR, 'users.json');
const ENROLLMENTS_FILE_PATH = path.join(DATA_DIR, 'enrollments.json');
const PAYMENTS_FILE_PATH = path.join(DATA_DIR, 'payments.json');

// Generic helper to read/write JSON files safely
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || 'null') ?? defaultValue;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Helper to generate unique IDs
function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

// Check if Supabase is configured
const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

// ==========================================
// 1. COURSES REPOSITORY
// ==========================================

export async function getCourses(searchQuery?: string, currencyFilter?: string): Promise<Course[]> {
  if (hasSupabase) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      let query = supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`);
      }
      if (currencyFilter && currencyFilter !== 'ALL') {
        query = query.eq('currency_code', currencyFilter);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as Course[];
      }
    } catch (e) {
      console.warn('Supabase courses query failed, falling back to local storage:', e);
    }
  }

  // Local repository
  let list = readJsonFile<Course[]>(COURSES_FILE_PATH, []);

  if (currencyFilter && currencyFilter !== 'ALL') {
    list = list.filter((c) => c.currency_code === currencyFilter);
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q)
    );
  }

  return list.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getCourseById(id: string): Promise<Course | null> {
  if (hasSupabase) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) {
        return data as Course;
      }
    } catch (e) {
      console.warn('Supabase fetch course failed, falling back to local:', e);
    }
  }

  const list = readJsonFile<Course[]>(COURSES_FILE_PATH, []);
  const match = list.find((c) => c.id === id);
  return match || null;
}

export async function createCourse(data: CourseFormData): Promise<Course> {
  const newCourse: Course = {
    id: generateId('course'),
    title: data.title.trim(),
    summary: data.summary.trim(),
    thumbnail_url: data.thumbnail_url.trim(),
    video_url: data.video_url.trim(),
    currency_code: data.currency_code,
    price: Number(data.price),
    wallet_address: formatWalletAddress(data.wallet_address || 'instructor'),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (hasSupabase) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: inserted, error } = await supabase
        .from('courses')
        .insert([newCourse])
        .select()
        .single();
      if (!error && inserted) {
        return inserted as Course;
      }
    } catch (e) {
      console.warn('Supabase insert failed, saving locally:', e);
    }
  }

  const list = readJsonFile<Course[]>(COURSES_FILE_PATH, []);
  list.unshift(newCourse);
  writeJsonFile(COURSES_FILE_PATH, list);
  return newCourse;
}

export async function updateCourse(id: string, data: Partial<CourseFormData>): Promise<Course | null> {
  const updatedAt = new Date().toISOString();

  if (hasSupabase) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: updated, error } = await supabase
        .from('courses')
        .update({ ...data, updated_at: updatedAt })
        .eq('id', id)
        .select()
        .single();
      if (!error && updated) {
        return updated as Course;
      }
    } catch (e) {
      console.warn('Supabase update failed, updating locally:', e);
    }
  }

  const list = readJsonFile<Course[]>(COURSES_FILE_PATH, []);
  const index = list.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const updatedCourse: Course = {
    ...list[index],
    ...data,
    price: data.price !== undefined ? Number(data.price) : list[index].price,
    wallet_address: data.wallet_address ? formatWalletAddress(data.wallet_address) : list[index].wallet_address,
    updated_at: updatedAt,
  };

  list[index] = updatedCourse;
  writeJsonFile(COURSES_FILE_PATH, list);
  return updatedCourse;
}

export async function deleteCourse(id: string): Promise<boolean> {
  if (hasSupabase) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase delete failed, deleting locally:', e);
    }
  }

  const list = readJsonFile<Course[]>(COURSES_FILE_PATH, []);
  const nextList = list.filter((c) => c.id !== id);
  if (nextList.length === list.length) return false;
  writeJsonFile(COURSES_FILE_PATH, nextList);
  return true;
}

// ==========================================
// 2. USERS REPOSITORY (STUDENTS & ADMINS)
// ==========================================

function seedDefaultUsers(): User[] {
  const defaultStudent: User = {
    id: 'user_student_demo',
    name: 'Alex Johnson',
    email: 'student@learnify.com',
    password_hash: hashPassword('student123!'),
    role: 'student',
    created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
  };
  return [defaultStudent];
}

export async function getUsers(): Promise<User[]> {
  let users = readJsonFile<User[]>(USERS_FILE_PATH, []);
  if (users.length === 0) {
    users = seedDefaultUsers();
    writeJsonFile(USERS_FILE_PATH, users);
  }
  return users;
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  const cleanEmail = email.toLowerCase().trim();
  return users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
}

export async function createUser(data: {
  name: string;
  email: string;
  password_hash: string;
  role?: 'student' | 'admin';
}): Promise<User> {
  const users = await getUsers();
  const cleanEmail = data.email.toLowerCase().trim();

  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error('A user with this email address already exists.');
  }

  const newUser: User = {
    id: generateId('user'),
    name: data.name.trim(),
    email: cleanEmail,
    password_hash: data.password_hash,
    role: data.role || 'student',
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  writeJsonFile(USERS_FILE_PATH, users);
  return newUser;
}

// ==========================================
// 3. ENROLLMENTS REPOSITORY
// ==========================================

export async function getEnrollments(): Promise<Enrollment[]> {
  return readJsonFile<Enrollment[]>(ENROLLMENTS_FILE_PATH, []);
}

export async function getUserEnrollments(userId: string): Promise<Enrollment[]> {
  const enrollments = await getEnrollments();
  return enrollments.filter((e) => e.user_id === userId);
}

export async function isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
  const enrollments = await getEnrollments();
  return enrollments.some((e) => e.user_id === userId && e.course_id === courseId);
}

export async function createEnrollment(data: {
  user_id: string;
  course_id: string;
  payment_id: string;
}): Promise<Enrollment> {
  const enrollments = await getEnrollments();

  // Enforce unique on (user_id + course_id)
  const existing = enrollments.find(
    (e) => e.user_id === data.user_id && e.course_id === data.course_id
  );
  if (existing) {
    return existing; // Idempotent return
  }

  const newEnrollment: Enrollment = {
    id: generateId('enr'),
    user_id: data.user_id,
    course_id: data.course_id,
    payment_id: data.payment_id,
    created_at: new Date().toISOString(),
  };

  enrollments.push(newEnrollment);
  writeJsonFile(ENROLLMENTS_FILE_PATH, enrollments);
  return newEnrollment;
}

export async function getUserEnrolledCourses(userId: string): Promise<Course[]> {
  const enrollments = await getUserEnrollments(userId);
  if (enrollments.length === 0) return [];

  const courses = await getCourses();
  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));
  return courses.filter((c) => enrolledCourseIds.has(c.id));
}

// ==========================================
// 4. PAYMENTS REPOSITORY
// ==========================================

export async function getPayments(): Promise<Payment[]> {
  const payments = readJsonFile<Payment[]>(PAYMENTS_FILE_PATH, []);
  return payments.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getPaymentByReference(reference: string): Promise<Payment | null> {
  const payments = await getPayments();
  return payments.find((p) => p.reference === reference) || null;
}

export async function createPayment(data: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
  const payments = await getPayments();

  // Check unique reference (idempotency)
  const existing = payments.find((p) => p.reference === data.reference);
  if (existing) {
    return existing;
  }

  const newPayment: Payment = {
    ...data,
    id: generateId('pay'),
    created_at: new Date().toISOString(),
  };

  payments.unshift(newPayment);
  writeJsonFile(PAYMENTS_FILE_PATH, payments);
  return newPayment;
}

export async function getEnrichedPayments(): Promise<EnrichedPayment[]> {
  const [payments, users, courses] = await Promise.all([
    getPayments(),
    getUsers(),
    getCourses(),
  ]);

  const userMap = new Map(users.map((u) => [u.id, u]));
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  return payments.map((p) => {
    const user = userMap.get(p.user_id);
    const course = courseMap.get(p.course_id);

    return {
      ...p,
      student_name: user?.name || 'Unknown Student',
      student_email: user?.email || 'N/A',
      course_title: course?.title || 'Unknown Course',
    };
  });
}
