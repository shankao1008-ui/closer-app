# Supabase configuration for this snapshot

This version uses Email Magic Link authentication, not anonymous sign-in. `lib/supabase.ts` currently connects to the owner's existing backend. Partners testing together should use that same backend and separate email accounts.

## Existing project: login redirect

Open the app through the current Expo Go QR code. Copy the URL printed after `[Closer] Supabase Redirect URL:` in Metro into **Authentication → URL Configuration → Redirect URLs** and save. Request a new email after this change. If your server address changes, update the allowlist for the new address. Open the email on the phone running the app.

Client code supplies `emailRedirectTo`. The configured email template must preserve the Supabase verification flow and its redirect. See [Supabase redirect documentation](https://supabase.com/docs/guides/auth/redirect-urls).

## Database coverage

Do not run database setup again just to connect a friend's phone.

`supabase-followup.sql` and `supabase-email-onboarding.sql` are follow-up scripts for an existing schema. They are not sufficient to recreate the entire application backend in an empty project.

The uploaded source also refers to `closer_hearts`, `closer_wishes`, `closer_moments`, `closer_moment_photos`, `closer_availability` and their RPC functions. Their complete migrations were not included in this uploaded ZIP. Obtain the full schema and RLS policies from the project owner before setting up a different backend.

Storage includes private avatar, partner-photo and moment-photo access. Preserve row-level security and authenticated membership checks. Never put a service-role key into the mobile app.
