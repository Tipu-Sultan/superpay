# SuperPay

An Android-first digital wallet **prototype**: React Native (Expo SDK 57, TypeScript, Expo Router) + a Node/Express/Mongoose API.

> **Nothing here moves real money.** Every payment goes through a simulated gateway. The app never collects a UPI PIN, card PIN, CVV or banking password. Phone OTP can use Twilio Verify when configured; development falls back to a clearly labelled local demo OTP.

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
- After this refactor, run `npm install` once in both `server/` and `mobile/` so the new Socket.IO/Redis dependencies are written into the lockfiles before using `npm ci` in CI.

## Features

Home dashboard, real-time Socket.IO updates and notifications, wallet balance (hide/show), Add money, Send money (contact / mobile / UPI ID -> amount -> confirm -> result), Receive & Request money (generated QR, copy, share), Scan & Pay (camera, permission UI, demo QR), Transactions (search, type + status filters, date grouping, pagination, detail with refresh for pending), Mobile recharge (operator, circle, plans), Bill payments (7 categories, provider, account, fetched bill), Profile (edit, reset demo data, server address, sign out).

## Architecture

**Mobile** — screens only describe intent. Flow: `PaymentFlowContext` (draft) -> one `pay/confirm` screen -> `paymentService.execute(draft)` -> `pay/result`.
- `src/services/*` is the only code that talks HTTP (`api/client.ts`). Swap the backend without touching a screen.
- `src/hooks/useApi*.ts` wrap React Query; payments invalidate wallet + transactions.
- `src/theme/*` design tokens (colors, typography, spacing, radius, shadows); `src/components/ui/*` reusable kit.
- Session token lives in `expo-secure-store`. A 401 anywhere signs the user out.
- Socket.IO authenticates with the same JWT and joins a private user room. Transaction and notification events update the React Query cache without a refresh.
- Notifications are persisted in MongoDB and exposed through a notification centre; transaction notifications are deduplicated by transaction/status.
- Idempotency key per confirmation, renewed after a failed attempt, so a double tap never pays twice.

**Server** — `routes -> controllers -> services -> models`.
- Socket.IO is attached to the same HTTP server and authenticates every connection with the JWT. The API remains the source of truth; sockets only push events. Set `REDIS_URL` on every API instance to enable the Redis adapter for horizontal Socket.IO scaling.
- `services/otp.service.ts` uses Twilio Verify when `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` and `TWILIO_VERIFY_SERVICE_SID` are configured. In non-production, a temporary demo OTP is returned only for local testing.
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

## Before a real launch

Real identity (licensed phone-OTP provider), a regulated PSP / UPI integration behind `PaymentGateway`, KYC and RBI/NPCI compliance, a replica-set MongoDB with multi-document transactions or a ledger service, HTTPS, secrets management, audit logging, device binding, and an EAS build/signing setup.
