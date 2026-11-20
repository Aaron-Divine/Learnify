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
  | 'ACCOUNT_NOT_FOUND'
  | 'INCORRECT_PIN'
  | 'INSUFFICIENT_FUNDS'
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
  // Veylo Wallet fields (replaces old card_number/cvv/pin)
  veylo_account_number: string;  // e.g. "482 193 7604"
  pin: string;                    // 4-6 digit Veylo PIN
  amount: number;
  currency: string;
  reference: string;
  description: string;
  receiver_wallet_address?: string; // kept for future use
}

export interface WalletChargeSuccessResponse {
  status: 'success';
  transaction_id: string;
  amount: number;
  currency: string;
  debited_amount_ngn?: number;
  debited_currency?: string;
  exchange_rate?: number;
  protocol?: string;
}

export interface WalletChargeFailureResponse {
  status: 'failed';
  code: PaymentFailureCode | string;
  message: string;
}

export type WalletChargeResponse = WalletChargeSuccessResponse | WalletChargeFailureResponse;
