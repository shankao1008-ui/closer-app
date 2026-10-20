import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AppProvider, useApp } from "../context/AppContext";

function AppNavigator() {
  const { authReady, accountReady, accountError, retryAccountLoad, session, colors, lang } = useApp();
  const router = useRouter();
  const navigation = useRootNavigationState();
  const segments = useSegments();
  const first = segments[0] as string | undefined;
  const zh = lang.startsWith("zh");
  const ready = authReady && accountReady && !!session && !accountError;
  useEffect(() => {
    if (navigation?.key && ready && (!first || first === "welcome" || first === "auth")) {
      router.replace("/(tabs)");
    }
  }, [navigation?.key, ready, first, router]);
  return <View style={{ flex: 1 }}>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="auth/callback" />
      <Stack.Screen name="complete-profile" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings" options={{ presentation: "modal" }} />
      <Stack.Screen name="pairing" options={{ presentation: "modal" }} />
    </Stack>
    {!ready && <View accessibilityViewIsModal style={[StyleSheet.absoluteFill, styles.gate, { backgroundColor: colors.screenBg[2] }]}>
      {!accountError && <ActivityIndicator color={colors.primary} />}
      <Text style={[styles.message, { color: colors.ink }]}>{accountError
        ? (zh ? "無法連線至 Closer，請檢查網路後重試。" : "Could not connect to Closer. Check your connection and try again.")
        : (zh ? "正在開啟 Closer…" : "Opening Closer…")}</Text>
      {accountError && <>
        <Pressable accessibilityRole="button" onPress={retryAccountLoad} style={[styles.button, { backgroundColor: colors.primary }]}>
          <Text style={styles.buttonText}>{zh ? "重試" : "Try again"}</Text>
        </Pressable>
      </>}
    </View>}
  </View>;
}
export default function RootLayout() { return <AppProvider><AppNavigator /></AppProvider>; }
const styles = StyleSheet.create({
  gate: { alignItems: "center", justifyContent: "center", padding: 28 },
  message: { fontSize: 16, lineHeight: 24, textAlign: "center", marginTop: 12 },
  button: { minHeight: 48, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24, marginTop: 24 },
  buttonText: { color: "white", fontWeight: "700" },
});
