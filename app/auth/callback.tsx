import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "../../context/AppContext";

export default function AuthCallbackScreen() {
  const { colors, lang } = useApp();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);
  const en = lang === "en";
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 20_000);
    return () => clearTimeout(timer);
  }, []);
  // The root layout handles successful navigation after the profile is loaded.
  return (
    <View style={[styles.root, { backgroundColor: colors.screenBg[2] }]}>
      {!timedOut && <ActivityIndicator color={colors.primary} />}
      <Text style={[styles.message, { color: colors.inkSoft }]}>
        {timedOut
          ? (en ? "Sign-in has not completed. Return to sign-in and request a new link." : "登入尚未完成，請返回登入頁重新寄送連結。")
          : (en ? "Signing you in…" : "正在登入…")}
      </Text>
      {timedOut && <Pressable accessibilityRole="button" style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => router.replace("/welcome")}>
        <Text style={styles.buttonText}>{en ? "Back to sign-in" : "返回登入"}</Text>
      </Pressable>}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 },
  message: { marginTop: 12, fontSize: 16, lineHeight: 24, textAlign: "center" },
  button: { minHeight: 48, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24, marginTop: 24 },
  buttonText: { color: "white", fontWeight: "700" },
});
