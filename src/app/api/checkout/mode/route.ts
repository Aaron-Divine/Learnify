import { NextResponse } from 'next/server';

/**
 * GET /api/checkout/mode
 * Returns whether the payment provider is in mock (dev) mode.
 * The client uses this to show/hide the mock test presets in the checkout UI.
 * Never exposes WALLET_API_KEY or any sensitive config — only the boolean.
 */
export async function GET() {
  const isMock =
    (process.env.PAYMENT_PROVIDER || 'mock').toLowerCase().trim() !== 'wallet';

  return NextResponse.json({ mock: isMock });
}
