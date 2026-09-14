# 靠近 Closer

**A little closer, even when you're far apart.**

Closer is a mobile app I'm building for long-distance couples. It brings everyday conversations, shared photos, important dates and future plans into one space designed for two people.

I wanted to make something that reflects the small things that matter in a long-distance relationship: knowing what time it is where your partner lives, counting down to your next visit, sharing a photo from your day, or simply saying “I miss you.”

The project has grown from an early interface with local data into an Expo app with Supabase authentication, partner pairing, messaging and photo-sharing code. I'm continuing to test it on real devices and improve the experience based on what happens when people use it.

## Inside Closer

### 🏠 Home — your relationship at a glance

See both cities and time zones, count down to your next meeting, and send quick emoji reactions. Home also brings together shared activities and a one-tap **“I miss you”** heart for your partner to see in the app.

### 💬 Chat — everyday conversations

A dedicated conversation with your paired partner, backed by Supabase. Voice and video buttons have been added to the interface; connecting actual calls is still on the roadmap.

### 📷 Live Photo — share a piece of your day

Choose or take a photo, add a caption, and send it to your partner. The Live Photo page includes both the sending area and a place to see the latest photo received from your partner.

Here, “Live Photo” means the app's photo-sharing feature, rather than Apple's animated Live Photos format.

### 🖼️ Our Moment — two photos, one shared moment

Tap your photo area to choose an image, then use the send button below. The idea is to bring a photo from each partner into the same shared moment, even when you're in different places.

### 🕒 Our Overlap — make time for each other

Save your availability with your time zone so you can share when you're free to chat. This feature is being developed around a simple question: “When do we both have time for us?”

### 💌 Shared wishes — things to look forward to

Collect places you want to visit, date ideas and things you want to do together. View all wishes, see what's still to do, mark a wish completed, or move it back to your to-do list.

### 👩‍❤️‍👨 Us & Settings — make it yours

Set your name, birthday and profile photo, manage your pairing, and personalize your relationship dates, cities and appearance.

The app includes translation dictionaries for Traditional Chinese, Simplified Chinese, English, Japanese, Korean, Spanish, French, German and Thai. Language consistency across screens is an ongoing part of testing.

### 👛 Cake Wallet shortcut

Open Cake Wallet from Home, with Bitcoin and Monero as the initial focus. The shortcut opens the wallet; it does not automatically fill in your partner's address or complete a transfer. Transaction details and confirmation stay in the wallet app.

## How the project has developed

I've been working on both the product design and the details needed to make it usable:

- Moving from the earlier Firebase approach to Supabase.
- Adding Email Magic Link sign-in, profile setup and partner pairing.
- Working through login callbacks, loading loops and profile-saving permissions.
- Connecting messaging and photo-sharing flows to the backend.
- Improving how names and avatars map to each partner.
- Expanding translations and refining buttons, spacing, loading states and error messages.
- Adding shared moments, availability, hearts and a clearer wish-list workflow.
- Moving the project to Expo SDK 57 and testing through Expo Go on a physical phone.

I lead the product direction, visual choices and testing, and use AI tools to help implement and debug the code. Closer is an ongoing personal project, and this repository documents that progress.

## Development status

The features above describe the current source. Full two-device testing is still ongoing; their presence in the code is not a guarantee that every flow is finished.

Next priorities:

- [ ] Finish testing sign-in, pairing, messaging and photo delivery between two accounts.
- [ ] Connect real voice and video calls. The current call screen is a preview only.
- [ ] Build a native home-screen photo widget. Photos currently appear inside Closer.
- [ ] Add reliable background notifications.
- [ ] Continue improving translations, accessibility and error recovery.
- [ ] Bring the complete database migrations into the repository for reproducible setup.

## Try it on your phone

Use Node.js and an Expo Go version compatible with Expo SDK 57. My development environment used Node 24.19.0. Start with the committed dependency versions and lockfile.

```bash
git clone https://github.com/shankao1008-ui/closer-app.git
cd closer-app
npm ci
npx expo start --go --tunnel
```

Scan the QR code in the terminal with your phone. Keep the terminal running and your computer awake while testing. The tunnel allows a partner on another network to connect too.

For a phone on the same Wi-Fi as your computer:

```bash
npx expo start --go --lan
```

If the tunnel fails, resolve that error before sharing the QR code. The GitHub link contains the source; it is not a hosted version of the app.

### Sign in and pair

1. Open Closer using the current QR code.
2. Find `[Closer] Supabase Redirect URL:` in the terminal. The Supabase project owner needs to add that exact URL to **Authentication → URL Configuration → Redirect URLs**.
3. Request a fresh sign-in email and open the link on the phone running Closer.
4. Complete your profile if prompted. Returning users with completed profiles can go straight into the app.
5. Use separate email accounts: one person creates a pairing code and the other joins with it.

A new server address may require a new allowed redirect URL. Don't share your personal email sign-in link with your partner.

### Backend setup

This version points to the existing shared Supabase project in `lib/supabase.ts` using a client publishable key. The included SQL files are follow-up scripts, not a complete setup for an empty database. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) before connecting a different backend.

## Built with

- **React Native 0.86.3** and **React 19.2.3**
- **Expo SDK 57** and **Expo Router**
- **TypeScript**
- **Supabase** for authentication, database, Realtime and photo storage
- **AsyncStorage** for local persistence
- **Expo Image Picker**, **Image Manipulator** and **File System** for photo workflows

## Project structure

| Folder | Purpose |
| --- | --- |
| `app/` | Screens and navigation routes |
| `components/` | Reusable interface components |
| `context/` | Shared app and account state |
| `lib/` | Backend helpers, translations and feature logic |
| `assets/` | App icons and images |

---

Built by **Sara Kao 高珮珊** — a personal project about staying connected across distance.
