# 靠近 Closer

A cross-platform mobile app for long-distance couples — built with React Native (Expo) and TypeScript.

Closer helps couples feel present in each other's daily lives despite the distance: synced time zones, a "For Habibi" quick-reaction widget, meeting countdowns, live photo sharing, and a fully bilingual (9-language) interface that adapts to each partner's preference.

> 🧪 This is a personal side project built as an exploration of AI-assisted development (Claude), from product spec through iterative UI design to a working cross-platform app.

---

## 📱 Try it

| Platform | How |
|---|---|
| **iOS** | Install [Expo Go](https://apps.apple.com/app/expo-go/id982107779), then scan this QR code or open the link below |
| **Android** | Download and install the standalone APK directly — no extra app needed |

**iOS (Expo Go):**
[https://expo.dev/accounts/sarakao/projects/closer-app-native/updates/f9eb4d6b-2a7b-455a-8dc7-02f7759da427](https://expo.dev/accounts/sarakao/projects/closer-app-native/updates/f9eb4d6b-2a7b-455a-8dc7-02f7759da427)

**Android (APK download):**
[https://expo.dev/accounts/sarakao/projects/closer-app-native/builds/e116561b-71b9-4093-9c34-440b3c3b3f7b](https://expo.dev/accounts/sarakao/projects/closer-app-native/builds/e116561b-71b9-4093-9c34-440b3c3b3f7b)

---

## ✨ Features

- **Home** — live dual-timezone clock with real weather, distance between cities, "For Habibi" one-tap reactions (fully customizable via the native emoji keyboard), and a meeting countdown with an animated progress ring
- **Chat** — messaging with contextual smart reminders (late night, upcoming anniversary, upcoming meetup) and inline partner nickname editing
- **Live Photo** — take or pick a photo, overlay custom text, and "send" it with a simulated desktop-widget delivery animation
- **Us** — relationship dashboard: important dates (including multiple recurring monthly anniversaries), editable avatars, shared notification preferences
- **Settings** — 9-language localization (繁中, English, 简中, 日本語, 한국어, Español, Français, Deutsch, ไทย) and a live-switchable color theme (feminine warm palette / masculine cool palette)
- **Persistence** — app state, chat history, and photos survive app restarts via local storage (no backend required for single-device use)

## 🛠 Tech Stack

- **React Native** + **Expo** (SDK 54, Expo Router)
- **TypeScript**
- React Context for global state (theme, language, relationship data)
- `expo-image-picker`, `expo-file-system`, `expo-linear-gradient`, `expo-blur`, `react-native-svg`
- `@react-native-async-storage/async-storage` for local persistence
- Custom i18n system (9 languages) built from scratch
- EAS Build / EAS Update for distribution

## 📂 Project Structure

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

## 🚀 Running locally

```bash
git clone https://github.com/shankao1008-ui/closer-app.git
cd closer-app
npm install
npx expo start
```

Scan the QR code with [Expo Go](https://expo.dev/go) to run it on your own device.

---

## 🗺 Roadmap / Not yet implemented

- Real two-device pairing (invite code / QR code)
- Cloud sync of messages & photos across devices
- Push notifications
- Native iOS/Android home-screen widget for live photo delivery
