import * as Linking from "expo-linking";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AppProvider, useApp } from "../context/AppContext";
import { createSessionFromUrl, isAuthCallbackUrl } from "../lib/auth";

function AppNavigator() {
  const { authReady, accountReady, accountError, retryAccountLoad, session, profileComplete, colors, lang } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const navigation = useRootNavigationState();
  const url = Linking.useURL();
  const [linkState, setLinkState] = useState<{ url: string; failed: boolean } | null>(null);
  const callbackUrl = url && isAuthCallbackUrl(url) ? url : null;
  const linkPending = !!callbackUrl && linkState?.url !== callbackUrl;
  const linkFailed = !!callbackUrl && linkState?.url === callbackUrl && linkState.failed;
  const first = segments[0] as string | undefined;
  const onAuthRoute = first === "welcome" || first === "auth";
  const onProfileRoute = first === "complete-profile";
  const en = lang === "en";

  useEffect(() => {
    if (!callbackUrl) return;
    let active = true;
    void createSessionFromUrl(callbackUrl).then(() => {
      if (active) setLinkState({ url: callbackUrl, failed: false });
    }).catch(() => {
      if (active) setLinkState({ url: callbackUrl, failed: true });
    });
    return () => { active = false; };
  }, [callbackUrl]);

  // This is the only owner of automatic authentication navigation.
  useEffect(() => {
    if (!navigation?.key || linkPending || linkFailed || !authReady || accountError) return;
    if (!session) {
      if (!onAuthRoute) router.replace("/welcome");
      return;
    }
    if (!accountReady) return;
    if (!profileComplete && !onProfileRoute) router.replace("/complete-profile");
    else if (profileComplete && (onAuthRoute || onProfileRoute || !first)) router.replace("/(tabs)");
  }, [navigation?.key, linkPending, linkFailed, authReady, accountReady, accountError,
    session, profileComplete, onAuthRoute, onProfileRoute, first, router]);

  const blocked = linkPending || linkFailed || !authReady || accountError || (!!session && !accountReady);
  const failed = linkFailed || accountError;
  return (
    <View style={{ flex: 1 }}>
      {/* Mount the navigator before any navigation or deep-link processing. */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="complete-profile" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ presentation: "modal" }} />
        <Stack.Screen name="pairing" options={{ presentation: "modal" }} />
      </Stack>
      {blocked && (
        <View accessibilityViewIsModal style={[StyleSheet.absoluteFill, styles.gate, { backgroundColor: colors.screenBg[2] }]}>
          {!failed && <ActivityIndicator color={colors.primary} />}
          <Text style={[styles.message, { color: colors.ink }]}>
            {failed
              ? linkFailed
                ? (en ? "This sign-in link could not be completed. Request a new link." : "無法完成此登入連結，請重新寄送登入信。")
                : (en ? "Your account data could not be loaded. Check your connection and try again." : "無法載入帳號資料，請檢查網路後重試。")
              : (en ? "Loading your account…" : "正在載入帳號…")}
          </Text>
          {failed && <Pressable accessibilityRole="button" style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => {
            if (linkFailed && callbackUrl) {
              setLinkState({ url: callbackUrl, failed: false });
              router.replace("/welcome");
            } else retryAccountLoad();
          }}><Text style={styles.buttonText}>{linkFailed ? (en ? "Continue" : "繼續") : (en ? "Try again" : "重試")}</Text></Pressable>}
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return <AppProvider><AppNavigator /></AppProvider>;
}
const styles = StyleSheet.create({
  gate: { alignItems: "center", justifyContent: "center", padding: 28 },
  message: { fontSize: 16, lineHeight: 24, textAlign: "center", marginTop: 12 },
  button: { minHeight: 48, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24, marginTop: 24 },
  buttonText: { color: "white", fontWeight: "700" },
});
