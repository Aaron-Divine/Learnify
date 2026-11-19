import { WalletChargeRequest, WalletChargeResponse } from '@/types';
import { PaymentProvider } from './types';

/**
 * MockPaymentProvider
 * -------------------
 * Simulates the external wallet API for local development and testing.
 * 
 * Test Scenarios:
 * - Card ending in '0000' (or all zeros) => INVALID_CARD
 * - PIN === '9999'                       => INCORRECT_PIN
 * - Card ending in '4002'                => INSUFFICIENT_FUNDS
 * - Card ending in '4003'                => CURRENCY_NOT_SUPPORTED
 * - Card ending in '5000'                => SERVER_ERROR
 * - Any other valid input                => SUCCESS
 */
export class MockPaymentProvider implements PaymentProvider {
  public readonly name = 'Mock Wallet Provider (Development)';
  public readonly isMock = true;

  async charge(request: WalletChargeRequest): Promise<WalletChargeResponse> {
    // Simulate realistic network delay (600ms - 900ms)
    await new Promise((resolve) => setTimeout(resolve, 750));

    const cleanCard = (request.card_number || '').replace(/\s+/g, '');
    const cleanPin = (request.pin || '').trim();

    // 1. Simulate INVALID_CARD
    if (cleanCard.endsWith('0000') || cleanCard.length < 13) {
      return {
        status: 'failed',
        code: 'INVALID_CARD',
        message: 'The card number or CVV provided is invalid. Please verify your card details in your wallet app.',
      };
    }

    // 2. Simulate INCORRECT_PIN
    if (cleanPin === '9999') {
      return {
        status: 'failed',
        code: 'INCORRECT_PIN',
        message: 'The PIN entered for this card is incorrect. Please verify your wallet card PIN.',
      };
    }

    // 3. Simulate INSUFFICIENT_FUNDS
    if (cleanCard.endsWith('4002') || request.amount >= 1_000_000) {
      return {
        status: 'failed',
        code: 'INSUFFICIENT_FUNDS',
        message: `Insufficient balance in your wallet to cover ${request.amount} ${request.currency}.`,
      };
    }

    // 4. Simulate CURRENCY_NOT_SUPPORTED
    if (cleanCard.endsWith('4003') || request.currency === 'XXX') {
      return {
        status: 'failed',
        code: 'CURRENCY_NOT_SUPPORTED',
        message: `Your wallet card account does not currently support transactions in ${request.currency}.`,
      };
    }

    // 5. Simulate SERVER_ERROR
    if (cleanCard.endsWith('5000')) {
      return {
        status: 'failed',
        code: 'SERVER_ERROR',
        message: 'The wallet service encountered a temporary error while processing the transaction. Please try again shortly.',
      };
    }

    // Default: SUCCESS
    const randomHex = Math.random().toString(36).substring(2, 9).toUpperCase();
    const transactionId = `WTX-${Date.now().toString().slice(-6)}-${randomHex}`;

    return {
      status: 'success',
      transaction_id: transactionId,
      amount: request.amount,
      currency: request.currency,
    };
  }
}
