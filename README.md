# 靠近 Closer

A React Native / Expo app for long-distance couples. This source snapshot comes from the latest uploaded Expo Go project (September 2026).

## Run on your phone

Install Node.js and an Expo Go version compatible with this project's Expo SDK 57. The submitted development environment used Node 24.19.0. Keep the committed package versions and lockfile when first testing.

```bash
git clone https://github.com/shankao1008-ui/closer-app.git
cd closer-app
npm ci
npx expo start --go --tunnel
```

Scan the QR code printed by **this running terminal** with your phone. Leave the terminal running and the computer awake. A GitHub repository URL is source code, not an app launch link. A tunnel lets your partner connect from another network, including another country. If the tunnel fails, there is no working QR code yet; resolve that error first. See [Expo CLI networking documentation](https://docs.expo.dev/more/expo-cli/#tunneling).

For a phone on the same Wi-Fi as its computer, use `npx expo start --go --lan` instead. Each partner can also clone this repository and run their own server.

## Sign in and pair

1. Open Closer through the current QR code.
2. The terminal prints `[Closer] Supabase Redirect URL:` followed by the actual callback URL. The project owner must add that exact URL under Supabase **Authentication → URL Configuration → Redirect URLs**. Each separately running server may have a different URL.
3. Request a fresh email sign-in link after the redirect is configured. Open it on the phone running Closer. Keep the server running. Do not share that email link with your partner.
4. Complete your name, birthday and profile photo if requested. Existing completed accounts can skip onboarding and edit their profile in Settings.
5. Use separate email accounts: one partner creates a pairing code; the other joins with that code.

The app currently points at the existing shared Supabase backend in `lib/supabase.ts` using a client publishable key. Joining this test project does not require a service-role key or database administrator credentials. Do not replace it with an administrative key. See [Supabase setup](SUPABASE_SETUP.md) before changing backends.

## Source features

- Home: time zones, next meeting, quick reactions, hearts, wishes, Our Moment / Our Overlap and wallet entry.
- Chat: Supabase-backed text messaging.
- Live Photo: photo upload and paired partner photo retrieval.
- Us / Settings: profiles, relationship settings, themes and nine language dictionaries.
- Wishes: add ideas, filter all / to do / completed, mark completed and move back to to do.
- Our Moment: choose your photo and send it; Our Overlap: save availability.

These are features present in the source; this upload preparation did not perform a two-phone end-to-end test against the live backend.

## Current limits

- `components/CallPreview.tsx` is a call preview. This snapshot does **not** place voice/video calls or notify your partner of an incoming call.
- Sending a Live Photo to the partner's in-app page does not install a native home-screen widget.
- Wallet actions are separate from actual transfer confirmation in the wallet.
- The SQL files included here are follow-up scripts, not a complete fresh-database bootstrap. The existing shared backend must have the feature tables and functions installed.
- Old Expo update/APK links from the earlier README have been removed because they do not establish that this snapshot is installed.

## Project

Expo SDK 57 / React Native 0.86.3 / React 19.2.3 / TypeScript / Supabase / Expo Router.

Screens are in `app/`, shared state in `context/`, reusable UI in `components/`, and API helpers / translations in `lib/`.

This project was designed and iterated by its creator with AI assistance.
