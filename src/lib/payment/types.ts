import { WalletChargeRequest, WalletChargeResponse } from '@/types';

export interface PaymentProvider {
  readonly name: string;
  readonly isMock: boolean;
  charge(request: WalletChargeRequest): Promise<WalletChargeResponse>;
}
