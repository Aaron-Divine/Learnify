export interface Course {
  id: string;
  title: string;
  summary: string;
  thumbnail_url: string;
  video_url: string;
  currency_code: string;
  price: number;
  wallet_address: string; // Interledger payment pointer format: $ilp.interledger-test.dev/(username)
  created_at: string;
  updated_at: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  symbolPosition?: 'prefix' | 'suffix';
}

export type CourseFormData = Omit<Course, 'id' | 'created_at' | 'updated_at'>;

export interface UploadProgress {
  percentage: number;
  status: 'idle' | 'uploading' | 'processing' | 'done' | 'error';
  errorMessage?: string;
}

// ==========================================
// PHASE 2: USERS, ENROLLMENTS & PAYMENTS
// ==========================================

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'student' | 'admin';
  created_at: string;
}

export type SafeUser = Omit<User, 'password_hash'>;

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  payment_id: string;
  created_at: string;
}

export type PaymentStatus = 'pending' | 'success' | 'failed';

export type PaymentFailureCode =
  | 'INVALID_CARD'
  | 'INCORRECT_PIN'
  | 'INSUFFICIENT_FUNDS'
  | 'CURRENCY_NOT_SUPPORTED'
  | 'SERVER_ERROR';

export interface Payment {
  id: string;
  user_id: string;
  course_id: string;
  reference: string;
  wallet_transaction_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  failure_code?: PaymentFailureCode | string;
  created_at: string;
}

// Payment enriched for admin reporting
export interface EnrichedPayment extends Payment {
  student_name?: string;
  student_email?: string;
  course_title?: string;
}

// ==========================================
// WALLET API CONTRACT (Swappable Provider)
// ==========================================

export interface WalletChargeRequest {
  card_number: string;
  cvv: string;
  pin: string;
  expiry?: string;
  amount: number;
  currency: string;
  reference: string;
  description: string;
  // Rafiki / Open Payments parameters
  receiver_wallet_address?: string; // Course instructor's wallet address e.g. $ilp.interledger-test.dev/alice
}

export interface WalletChargeSuccessResponse {
  status: 'success';
  transaction_id: string;
  amount: number;
  currency: string;
}

export interface WalletChargeFailureResponse {
  status: 'failed';
  code: PaymentFailureCode | string;
  message: string;
}

export type WalletChargeResponse = WalletChargeSuccessResponse | WalletChargeFailureResponse;
