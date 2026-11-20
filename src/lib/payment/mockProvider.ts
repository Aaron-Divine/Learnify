import { WalletChargeRequest, WalletChargeResponse } from '@/types';
import { PaymentProvider } from './types';

/**
 * MockPaymentProvider
 * -------------------
 * Simulates the Veylo Wallet API for local development and testing.
 *
 * Test Scenarios:
 * - Account "4821937604" with pin "1234" => SUCCESS
 * - Account "9999999999"                 => ACCOUNT_NOT_FOUND
 * - Any account with pin "9999"          => INCORRECT_PIN
 * - Account "1111111111"                 => INSUFFICIENT_FUNDS
 * - Any other valid input                => SUCCESS
 */
export class MockPaymentProvider implements PaymentProvider {
  public readonly name = 'Mock Veylo Wallet Provider (Development)';
  public readonly isMock = true;

  async charge(request: WalletChargeRequest): Promise<WalletChargeResponse> {
    // Simulate realistic network delay (600ms - 900ms)
    await new Promise((resolve) => setTimeout(resolve, 750));

    const cleanAccount = (request.veylo_account_number || '').replace(/\s+/g, '');
    const cleanPin = (request.pin || '').trim();

    // 1. Simulate ACCOUNT_NOT_FOUND
    if (cleanAccount === '9999999999') {
      return {
        status: 'failed',
        code: 'ACCOUNT_NOT_FOUND',
        message: 'No Veylo account found with this account number. Please verify and try again.',
      };
    }

    // 2. Simulate INCORRECT_PIN
    if (cleanPin === '9999') {
      return {
        status: 'failed',
        code: 'INCORRECT_PIN',
        message: 'The PIN entered for this Veylo account is incorrect. Please verify your wallet PIN.',
      };
    }

    // 3. Simulate INSUFFICIENT_FUNDS
    if (cleanAccount === '1111111111' || request.amount >= 1_000_000) {
      return {
        status: 'failed',
        code: 'INSUFFICIENT_FUNDS',
        message: `Insufficient balance in your Veylo wallet to cover ${request.amount} ${request.currency}.`,
      };
    }

    // Default: SUCCESS
    const randomHex = Math.random().toString(36).substring(2, 9).toUpperCase();
    const transactionId = `VYL-TXN-${Date.now().toString().slice(-6)}-${randomHex}`;

    return {
      status: 'success',
      transaction_id: transactionId,
      amount: request.amount,
      currency: request.currency,
    };
  }
}
