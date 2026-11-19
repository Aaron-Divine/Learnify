import { CurrencyConfig } from '@/types';

// The designated available currencies specified for Learnify
export const CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', symbolPosition: 'prefix' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', symbolPosition: 'prefix' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', symbolPosition: 'prefix' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦', symbolPosition: 'prefix' },
  { code: 'SGD', symbol: 'SG$', name: 'Singapore Dollar', flag: '🇸🇬', symbolPosition: 'prefix' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', flag: '🇲🇽', symbolPosition: 'prefix' },
  { code: 'COP', symbol: 'COP$', name: 'Colombian Peso', flag: '🇨🇴', symbolPosition: 'prefix' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦', symbolPosition: 'prefix' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', flag: '🇵🇰', symbolPosition: 'prefix' },
  { code: 'PEB', symbol: 'PEB', name: 'PEB Currency', flag: '🇵🇪', symbolPosition: 'prefix' },
  { code: 'EGG', symbol: 'EGG', name: 'EGG Currency', flag: '🪙', symbolPosition: 'prefix' },
];

// Extended mapping for backwards compatibility
export const EXTENDED_CURRENCIES: CurrencyConfig[] = [
  ...CURRENCIES,
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬', symbolPosition: 'prefix' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', symbolPosition: 'prefix' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', flag: '🇬🇭', symbolPosition: 'prefix' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪', symbolPosition: 'prefix' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', flag: '🇦🇺', symbolPosition: 'prefix' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', symbolPosition: 'prefix' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', symbolPosition: 'prefix' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪', symbolPosition: 'prefix' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷', symbolPosition: 'prefix' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', symbolPosition: 'prefix' },
];

export const CURRENCY_MAP: Record<string, CurrencyConfig> = EXTENDED_CURRENCIES.reduce(
  (acc, curr) => {
    acc[curr.code] = curr;
    return acc;
  },
  {} as Record<string, CurrencyConfig>
);

export function formatPrice(price: number, currencyCode: string): string {
  const currency = CURRENCY_MAP[currencyCode] || {
    code: currencyCode,
    symbol: currencyCode,
    name: currencyCode,
    flag: '🌐',
    symbolPosition: 'prefix',
  };

  const formattedNumber = Number(price).toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
  });

  if (currency.symbolPosition === 'suffix') {
    return `${formattedNumber} ${currency.symbol}`;
  }
  return `${currency.symbol}${formattedNumber}`;
}

// Interledger test wallet helper
export const ILP_TEST_WALLET_PREFIX = '$ilp.interledger-test.dev/';

export function formatWalletAddress(input: string): string {
  if (!input) return '';
  const clean = input.trim().replace(/^\$+/, '');
  if (clean.startsWith('ilp.interledger-test.dev/')) {
    return '$' + clean;
  }
  // Strip any leading slashes
  const username = clean.replace(/^\/+/, '');
  return `${ILP_TEST_WALLET_PREFIX}${username}`;
}
