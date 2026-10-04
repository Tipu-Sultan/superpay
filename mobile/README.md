# SuperPay mobile (Expo SDK 57)

Android-first React Native app. See the repository root `README.md` for full setup.

```bash
npm install
cp .env.example .env        # set EXPO_PUBLIC_API_URL
npx expo start --android
```

Scripts: `npm run typecheck`, `npm run lint`, `npm test`.

Camera scanning needs a **development build** or Expo Go on a device; emulators have no QR camera, so the scanner screen has a "Use a demo QR" button.
