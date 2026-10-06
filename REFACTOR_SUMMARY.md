# SuperPay Refactor Summary

## Implemented

- Added Socket.IO to the existing Node.js HTTP server.
- JWT-authenticated private Socket.IO rooms per user.
- Real-time `transaction:updated` events.
- Real-time `notification:new` events.
- Optional Redis Socket.IO adapter through `REDIS_URL` for horizontal API scaling.
- Persistent MongoDB notifications with unread count and read/read-all APIs.
- Mobile notification centre with unread badge and transaction deep links.
- React Query cache updates from real-time transaction events.
- Automatic demo pending-payment settlement and real-time status update.
- Demo peer transfers now credit another registered SuperPay demo user when the recipient is known.
- Added phone OTP endpoints and mobile OTP onboarding.
- Twilio Verify integration without storing OTP values when Twilio credentials are configured.
- Non-production fallback OTP for local development only.
- Production blocks the legacy demo session endpoint.
- Expanded API error mapping and kept database/internal errors away from client-facing messages.
- Preserved the existing theme/components and used the existing code/comment conventions instead of introducing a new UI system.

## Dependencies added

### Server
- `socket.io`
- `redis`
- `@socket.io/redis-adapter`

### Mobile
- `socket.io-client`

Run `npm install` once in both `server/` and `mobile/` to update the lockfiles with these dependencies.

## Environment

Server `.env` can optionally contain:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VERIFY_SERVICE_SID`
- `REDIS_URL`

Without Twilio in development/test, the server returns a temporary development OTP so the flow can still be tested. Do not expose that fallback in production.

## Important limitation

Payments are still simulated. Socket.IO makes the demo transaction state real-time between clients, but this is not a real UPI/bank payment integration. A real gateway/PSP should replace the existing `PaymentGateway` implementation before any real-money use.
