# Rafiki / Interledger & Learnify Wallet Integration Guide

This document outlines how Learnify aligns with **Interledger (ILP)**, **Rafiki**, and **Open Payments** standards when communicating with your external wallet application.

---

## 1. Architecture Overview

```
[ Student / Buyer ]
       │
       ▼ (1. Inputs Card Number, CVV, PIN)
[ Learnify Checkout (Merchant) ]
       │
       ▼ (2. POST {WALLET_API_URL}/charge)
[ Your External Wallet Backend (Rafiki Client / ASE) ]
       │
       ├─► Validates Card, PIN, Balance
       ├─► (Optional Open Payments Flow via Rafiki):
       │     a. Resolve Instructor Wallet Address ($ilp.interledger-test.dev/...)
       │     b. Create Incoming Payment at Receiver's Wallet
       │     c. Create Quote for (amount, currency)
       │     d. Create Outgoing Payment (Transfer on Interledger)
       ▼
[ Learnify Server ] <── Returns { status: "success", transaction_id, ... }
       │
       ▼ (3. Unlocks video & enrolls student)
```

---

## 2. API Contract with Your Wallet Application

### Endpoint
`POST {WALLET_API_URL}/charge`

### Headers Sent by Learnify
- `Content-Type: application/json`
- `Authorization: Bearer <WALLET_API_KEY>`
- `X-Api-Key: <WALLET_API_KEY>`

### Request Body Sent by Learnify
```json
{
  "card_number": "4111222233334001",
  "cvv": "123",
  "pin": "1234",
  "expiry": "12/28",
  "amount": 29.99,
  "currency": "USD",
  "reference": "lrf_pay_1700000000_abc123",
  "description": "Course purchase: Next.js Fullstack Mastery",
  "receiver_wallet_address": "https://ilp.interledger-test.dev/instructor1"
}
```

> **Rafiki Note**: The `receiver_wallet_address` corresponds to the instructor's Interledger Wallet Address / Payment Pointer format configured when the course was created (e.g. `$ilp.interledger-test.dev/username` or `https://ilp.interledger-test.dev/username`). Your wallet backend uses this directly to query Open Payments and create the `incoming-payment`.

### Success Response Expected by Learnify (HTTP 200)
```json
{
  "status": "success",
  "transaction_id": "rafiki_tx_987654321",
  "amount": 29.99,
  "currency": "USD"
}
```

### Failure Response Expected by Learnify (HTTP 200 or 4xx)
```json
{
  "status": "failed",
  "code": "INSUFFICIENT_FUNDS",
  "message": "The wallet card does not have sufficient funds for this transaction."
}
```

#### Standard Error Codes Supported:
- `INVALID_CARD`: Card number or details do not exist or are invalid.
- `INCORRECT_PIN`: Wallet PIN check failed.
- `INSUFFICIENT_FUNDS`: Not enough balance in the wallet.
- `CURRENCY_NOT_SUPPORTED`: Wallet cannot settle the course currency.
- `SERVER_ERROR`: Rafiki or wallet backend failure.

---

## 3. How to Connect Your Wallet in Production

In `.env.local` (or your production hosting environment):

```env
# Switch from 'mock' to 'wallet'
PAYMENT_PROVIDER=wallet

# Your Wallet API endpoint & secret
WALLET_API_URL=https://your-wallet-backend.com/api/v1
WALLET_API_KEY=your_secret_api_key_here
```

To customize or adjust the request payload, edit:
`src/lib/payment/walletProvider.ts`
