import { PaymentProvider } from './types';
import { MockPaymentProvider } from './mockProvider';
import { WalletPaymentProvider } from './walletProvider';

export * from './types';
export * from './mockProvider';
export * from './walletProvider';

/**
 * Returns the configured payment provider.
 * Switch between mock and real wallet via:
 * PAYMENT_PROVIDER=mock (default)
 * PAYMENT_PROVIDER=wallet
 */
export function getPaymentProvider(): PaymentProvider {
  const providerType = (process.env.PAYMENT_PROVIDER || 'mock').toLowerCase().trim();

  if (providerType === 'wallet') {
    return new WalletPaymentProvider();
  }

  return new MockPaymentProvider();
}
