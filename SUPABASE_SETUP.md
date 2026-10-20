# Supabase setup — no-email device sessions

## Required owner setting

Open the existing project in Supabase Dashboard → **Authentication → Sign In / Providers** and enable **Anonymous Sign-ins**. Depending on the dashboard version this may be under Authentication configuration. Save the setting before testing a fresh device. This repository cannot toggle that hosted setting by itself.

The app uses `signInAnonymously()` only when no saved session exists. Existing guest and email sessions remain intact. Anonymous users still have individual UUIDs and the `authenticated` database role. Do not disable RLS or grant public access to make pairing work.

Run `supabase-device-access.sql` in the SQL Editor if own-profile insert/update policies are missing. It adds only policies scoped to `auth.uid() = id`; it does not delete users, couples or photos. Any existing restrictive policies that explicitly reject anonymous users must be reviewed separately.

No email template, SMTP, or callback allowlist is needed for the new entry flow. Legacy email callback routes no longer consume tokens or change identities.

## Two-device acceptance check

- Fresh device opens Home without email; reloading keeps the same identity.
- An existing signed-in device keeps its profile and pairing.
- Device A creates a code; B joins. Both show paired within a few seconds.
- Save a name and optionally birthday/photo, restart, and confirm the values persist.
- Exchange a chat message and photo, then unpair and confirm both lose shared access.
- Network failure shows a retry action. Retry must reuse any session already created.

Automated session tests do not replace this live-backend/device check. Clearing app storage loses guest access; the pairing code is not an account recovery secret.

## Database coverage

Do not run database setup again just to connect a friend's phone.

`supabase-followup.sql` and `supabase-email-onboarding.sql` are follow-up scripts for an existing schema. They are not sufficient to recreate the entire application backend in an empty project.

The uploaded source also refers to `closer_hearts`, `closer_wishes`, `closer_moments`, `closer_moment_photos`, `closer_availability` and their RPC functions. Their complete migrations were not included in this uploaded ZIP. Obtain the full schema and RLS policies from the project owner before setting up a different backend.

Storage includes private avatar, partner-photo and moment-photo access. Preserve row-level security and authenticated membership checks. Never put a service-role key into the mobile app.
