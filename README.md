# 靠近 Closer

A mobile app I built for long-distance couples, using React Native (Expo) and TypeScript.

I made this because I kept thinking about how annoying it is to be in a relationship across time zones — you never know if it's a good time to text, you forget your partner's local time, and there's no easy way to just say "hey, thinking of you" without opening a whole chat. So I built Closer: it shows both time zones at a glance, has a one-tap "For Habibi" button to send quick reactions, counts down to your next visit, and lets you send a photo with text overlay straight to your partner (currently simulated — see the roadmap below for what's still missing).

This was a personal side project. I used Claude to help write the code, but I designed the product, made the UI decisions, and iterated on it screen by screen based on what actually felt right to use.

---

## Try it

| Platform | How |
|---|---|
| **iOS** | Install [Expo Go](https://apps.apple.com/app/expo-go/id982107779), then open the link below or scan the QR code it generates |
| **Android** | Just download and install the APK directly, no extra app needed |

**iOS (via Expo Go):**
https://expo.dev/accounts/sarakao/projects/closer-app-native/updates/f9eb4d6b-2a7b-455a-8dc7-02f7759da427

**Android (APK download):**
https://expo.dev/accounts/sarakao/projects/closer-app-native/builds/e116561b-71b9-4093-9c34-440b3c3b3f7b

---

## What it does

- **Home** — dual time zone clock with real weather, distance between the two cities, "For Habibi" quick reactions (you can change the emoji using your phone's own keyboard, not a fixed set), and a countdown to your next meetup with an animated progress ring
- **Chat** — text messaging, with reminders that pop up based on context (it's late where they are, an anniversary is coming up, you're about to meet). You can also tap your partner's name to rename them
- **Live Photo** — take a photo or pick one from your library, add text on top, and "send" it (right now this just plays a send animation — real cross-device delivery isn't built yet, see below)
- **Us** — a relationship page with important dates (including multiple recurring monthly anniversaries), avatars you can change by tapping them, and shared notification settings
- **Settings** — the whole app works in 9 languages, and you can switch between a warm/orange theme or a cooler blue theme
- **Data actually sticks around** — messages, settings, and photos are saved locally so they survive closing and reopening the app

## Built with

- React Native + Expo (SDK 54, Expo Router)
- TypeScript
- React Context for state (theme, language, relationship data)
- expo-image-picker, expo-file-system, expo-linear-gradient, expo-blur, react-native-svg
- @react-native-async-storage/async-storage for saving data locally
- A translation system I built myself, covering 9 languages
- EAS Build / EAS Update to distribute the app

## Project structure

```
app/
  _layout.tsx            # root layout, wraps AppProvider
  (tabs)/
    index.tsx             # Home
    chat.tsx               # Chat
    photo.tsx               # Live Photo
    us.tsx                   # Us
  settings.tsx            # Settings modal
components/
  AvatarPicker.tsx        # reusable photo picker (camera / library)
context/
  AppContext.tsx           # theme, language, shared relationship state
lib/
  data.ts                   # shared mock data + date/timezone helpers
  storage.ts                 # AsyncStorage + persistent photo file helpers
```

## Running it locally

```bash
git clone https://github.com/shankao1008-ui/closer-app.git
cd closer-app
npm install
npx expo start
```

Then scan the QR code with Expo Go on your phone.

---

## What's not done yet

I'm upfront about this — right now everything runs on one phone at a time, nothing actually syncs between two people yet. Still on my list:

- Real pairing between two devices (invite code / QR code)
- Actually syncing messages and photos between partners
- Push notifications
- A real home-screen widget on iOS/Android for the live photo feature
