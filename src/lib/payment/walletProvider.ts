import { WalletChargeRequest, WalletChargeResponse } from '@/types';
import { PaymentProvider } from './types';

/**
 * WalletPaymentProvider
 * ---------------------
 * Real implementation connecting to the external Wallet API.
 * 
 * Required Environment Variables:
 * - WALLET_API_URL: e.g. "https://api.yourwallet.com/v1"
 * - WALLET_API_KEY: e.g. "wlt_live_secret_key_..."
 * 
 * Endpoint: POST {WALLET_API_URL}/charge
 */
export class WalletPaymentProvider implements PaymentProvider {
  public readonly name = 'Live External Wallet API';
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

    const endpoint = `${this.apiUrl}/charge`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify({
          card_number: request.card_number,
          cvv: request.cvv,
          pin: request.pin,
          amount: request.amount,
          currency: request.currency,
          reference: request.reference,
          description: request.description,
          receiver_wallet_address: request.receiver_wallet_address,
          ...(request.expiry ? { expiry: request.expiry } : {}),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        return {
          status: 'failed',
          code: data?.code || 'SERVER_ERROR',
          message: data?.message || `Wallet API returned HTTP ${response.status} ${response.statusText}`,
        };
      }

      // Check success contract
      if (data.status === 'success') {
        return {
          status: 'success',
          transaction_id: data.transaction_id || data.id || `WTX-${Date.now()}`,
          amount: data.amount ?? request.amount,
          currency: data.currency ?? request.currency,
        };
      }

      // Failure response from wallet
      return {
        status: 'failed',
        code: data.code || 'SERVER_ERROR',
        message: data.message || 'Payment was declined by the wallet provider.',
      };
    } catch (err: any) {
      console.error('[WalletPaymentProvider] Network or server error:', err?.message || err);
      return {
        status: 'failed',
        code: 'SERVER_ERROR',
        message: 'Could not connect to the wallet service. Please check network connectivity.',
      };
    }
  }
}
