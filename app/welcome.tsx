import { LinearGradient } from "expo-linear-gradient";
import { Heart, Mail } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useApp } from "../context/AppContext";
import { sendMagicLink } from "../lib/auth";

export default function WelcomeScreen() {
  const { colors, lang } = useApp();
  const en = lang === "en";
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert(en ? "Invalid email" : "Email 格式不正確");
      return;
    }
    setSending(true);
    try {
      await sendMagicLink(email);
      setSent(true);
    } catch (error: any) {
      Alert.alert(en ? "Unable to send link" : "無法寄出登入連結", error?.message ?? (en ? "Please try again." : "請稍後再試。"));
    } finally {
      setSending(false);
    }
  };

  return (
    <LinearGradient colors={colors.screenBg as any} style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.center}>
        <View style={[styles.logo, { backgroundColor: colors.primary }]}><Heart size={30} color="#fff" /></View>
        <Text style={[styles.brand, { color: colors.ink }]}>Closer</Text>
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>
          {sent
            ? (en ? "Check your inbox and tap the link to continue." : "請到信箱點擊登入連結以繼續。")
            : (en ? "Sign in or create an account with your email." : "使用 Email 登入或建立帳號。")}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={[styles.inputRow, { backgroundColor: colors.inputBg }]}>
            <Mail size={18} color={colors.inkSoft} />
            <TextInput
              value={email}
              onChangeText={(value) => { setEmail(value); setSent(false); }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="name@example.com"
              placeholderTextColor={colors.inkSoft}
              style={[styles.input, { color: colors.ink }]}
            />
          </View>
          <Pressable disabled={sending} onPress={submit} style={[styles.button, { backgroundColor: colors.primary, opacity: sending ? 0.65 : 1 }]}>
            {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{sent ? (en ? "Send again" : "重新寄送") : (en ? "Send Login Link" : "寄送登入連結")}</Text>}
          </Pressable>
        </View>
        <Text style={[styles.note, { color: colors.inkSoft }]}>{en ? "No password needed." : "不需要設定密碼。"}</Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }, center: { flex: 1, justifyContent: "center", padding: 24 },
  logo: { width: 64, height: 64, borderRadius: 22, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  brand: { fontSize: 32, fontWeight: "800", textAlign: "center", marginTop: 14 },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 21, marginTop: 8, marginBottom: 24 },
  card: { borderWidth: 1, borderRadius: 24, padding: 18 },
  inputRow: { flexDirection: "row", alignItems: "center", borderRadius: 15, paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 15, paddingVertical: 14, marginLeft: 8 },
  button: { minHeight: 50, borderRadius: 999, alignItems: "center", justifyContent: "center", marginTop: 14 },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  note: { fontSize: 12, textAlign: "center", marginTop: 16 },
});

