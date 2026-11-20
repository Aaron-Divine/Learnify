import { WalletChargeRequest, WalletChargeResponse } from '@/types';
import { PaymentProvider } from './types';

/**
 * WalletPaymentProvider
 * ---------------------
 * Real implementation connecting to the Veylo Wallet API.
 *
 * Required Environment Variables:
 * - WALLET_API_URL: e.g. "https://veylo-gold.vercel.app"
 * - WALLET_API_KEY: Veylo API key (Bearer token)
 *
 * Endpoint: POST {WALLET_API_URL}/api/charge
 */
export class WalletPaymentProvider implements PaymentProvider {
  public readonly name = 'Veylo Live Wallet API';
  public readonly isMock = false;

  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = (process.env.WALLET_API_URL || '').replace(/\/+$/, '');
    this.apiKey = process.env.WALLET_API_KEY || '';
  }

  async charge(request: WalletChargeRequest): Promise<WalletChargeResponse> {
    if (!this.apiUrl) {
      return {
        status: 'failed',
        code: 'SERVER_ERROR',
        message: 'WALLET_API_URL environment variable is not configured on the Learnify server.',
      };
    }

    const endpoint = `${this.apiUrl}/api/charge`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          veylo_account_number: request.veylo_account_number,
          pin: request.pin,
          amount: request.amount,
          currency: request.currency,
          reference: request.reference,
          description: request.description,
          receiver_account: request.receiver_wallet_address,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        return {
          status: 'failed',
          code: data?.code || 'SERVER_ERROR',
          message: data?.message || `Veylo API returned HTTP ${response.status} ${response.statusText}`,
        };
      }

      // Check success contract
      if (data.status === 'success') {
        return {
          status: 'success',
          transaction_id: data.transaction_id || `VYL-TXN-${Date.now()}`,
          amount: data.amount ?? request.amount,
          currency: data.currency ?? request.currency,
          debited_amount_ngn: data.debited_amount_ngn,
          debited_currency: data.debited_currency || 'NGN',
          exchange_rate: data.exchange_rate,
          protocol: data.protocol || 'Interledger Rafiki',
        };
      }

      // Map Veylo failure codes to Learnify internal codes
      const knownCodes = ['ACCOUNT_NOT_FOUND', 'INCORRECT_PIN', 'INSUFFICIENT_FUNDS'];
      const code = knownCodes.includes(data.code) ? data.code : 'SERVER_ERROR';

      return {
        status: 'failed',
        code,
        message: data.message || 'Payment was declined by the Veylo wallet.',
      };
    } catch (err: any) {
      console.error('[WalletPaymentProvider] Network or server error:', err?.message || err);
      return {
        status: 'failed',
        code: 'SERVER_ERROR',
        message: 'Could not connect to the Veylo wallet service. Please check network connectivity.',
      };
    }
  }
}
