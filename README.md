# SuperPay

An Android-first digital wallet **prototype**: React Native (Expo SDK 57, TypeScript, Expo Router) + a Node/Express/Mongoose API.

> **Nothing here moves real money.** Every payment goes through a simulated gateway. The app never collects a UPI PIN, card PIN, CVV, OTP or banking password, and has no fake bank login. "Sign in" creates a demo profile from a name and mobile number.

```
superpay/
  mobile/   Expo SDK 57 app (Expo Router, React Query, TypeScript)
  server/   Express 5 + Mongoose 9 API, Zod validation, JWT
  docker-compose.yml   local MongoDB
```

## Run it

**1. Database + API**
```bash
docker compose up -d            # or use your own MongoDB / Atlas URI
cd server
cp .env.example .env            # set JWT_SECRET (>= 16 chars) and MONGODB_URI
npm install
npm run dev                     # seeds billers, recharge plans, announcements on boot
```

**2. Mobile app**
```bash
cd mobile
npm install
cp .env.example .env            # EXPO_PUBLIC_API_URL
npx expo start --android
```
- Android emulator: `http://10.0.2.2:4000/api` (default).
- Physical phone: use your computer's LAN IP, e.g. `http://192.168.1.20:4000/api`, either in `.env` or at runtime under **Onboarding / Profile > Server settings**.
- Cleartext `http://` is enabled only when the API URL is `http` (dev). Use an `https` URL for real builds and it is switched off automatically (`mobile/app.config.ts`).

## Features

Home dashboard, wallet balance (hide/show), Add money, Send money (contact / mobile / UPI ID -> amount -> confirm -> result), Receive & Request money (generated QR, copy, share), Scan & Pay (camera, permission UI, demo QR), Transactions (search, type + status filters, date grouping, pagination, detail with refresh for pending), Mobile recharge (operator, circle, plans), Bill payments (7 categories, provider, account, fetched bill), Profile (edit, reset demo data, server address, sign out).

## Architecture

**Mobile** — screens only describe intent. Flow: `PaymentFlowContext` (draft) -> one `pay/confirm` screen -> `paymentService.execute(draft)` -> `pay/result`.
- `src/services/*` is the only code that talks HTTP (`api/client.ts`). Swap the backend without touching a screen.
- `src/hooks/useApi*.ts` wrap React Query; payments invalidate wallet + transactions.
- `src/theme/*` design tokens (colors, typography, spacing, radius, shadows); `src/components/ui/*` reusable kit.
- Session token lives in `expo-secure-store`. A 401 anywhere signs the user out.
- Idempotency key per confirmation, renewed after a failed attempt, so a double tap never pays twice.

**Server** — `routes -> controllers -> services -> models`.
- `services/payment/gateway.ts` is the **PaymentGateway interface**. `mockGateway.ts` is the only implementation. To go live, implement the interface for a licensed PSP and return it from `services/payment/index.ts`.
- All amounts are integer **paise**. Wallet debits use an atomic conditional update (`balance >= amount`), so balances cannot go negative or be double-spent, and no replica set is required.
- Bill amounts are recomputed server-side; the client never decides what is owed.
- Zod validation, Helmet, CORS, rate limits, a uniform `{ success, data | error }` envelope.

## Test every state

| To get...            | Do this |
|----------------------|---------|
| Success              | Pay any contact |
| Pending              | Pay UPI `pending@superpay`, or a mobile ending `1111`. Tap **Check status** after ~10s |
| Failed               | Pay UPI `fail@superpay`, or a mobile ending `0000` |
| Insufficient balance | Send more than your balance |
| No pending bill      | Enter a bill account number ending `000` |
| Limit exceeded       | Over `TXN_LIMIT_RUPEES` (default 1,00,000) |
| Start over           | Profile > Reset demo data |

Demo contacts use obviously patterned numbers (`9000000101`...). Billers are fictional on purpose; replace with a BBPS catalogue when integrating.

## Quality checks

```bash
cd server && npm run typecheck && npm test && npm run build
cd mobile && npm run typecheck && npm run lint && npm test
```

## Before a real launch (not done here, on purpose)

Real identity (licensed phone-OTP provider), a regulated PSP / UPI integration behind `PaymentGateway`, KYC and RBI/NPCI compliance, a replica-set MongoDB with multi-document transactions or a ledger service, HTTPS, secrets management, audit logging, device binding, and an EAS build/signing setup.
