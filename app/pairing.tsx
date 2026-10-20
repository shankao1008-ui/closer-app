import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Copy, Heart } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useApp } from "../context/AppContext";
import { createPairingCode, redeemPairingCode } from "../lib/pairing";

export default function PairingScreen() {
  const { colors, coupleId, lang, refreshPairing } = useApp();
  const en = lang === "en";
  const router = useRouter();
  const styles = makeStyles(colors);
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [myCode, setMyCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Refresh the creator too, even when Realtime publication is unavailable.
  useEffect(() => {
    if (coupleId || mode !== "create") return;
    const timer = setInterval(() => { void refreshPairing().catch(() => {}); }, 5000);
    return () => clearInterval(timer);
  }, [coupleId, mode, refreshPairing]);

  // 已經配對成功了，直接返回主畫面
  if (coupleId) {
    return (
      <View style={[styles.root, { backgroundColor: colors.screenBg[2], alignItems: "center", justifyContent: "center", padding: 24 }]}>
        <Heart size={40} color={colors.primary} />
        <Text style={{ marginTop: 12, fontSize: 15, fontWeight: "700", color: colors.ink }}>{en ? "You’re paired!" : "你們已經配對成功了！"}</Text>
        <Pressable onPress={() => router.replace("/(tabs)")} style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 20 }]}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{en ? "Back to Home" : "回到主畫面"}</Text>
        </Pressable>
      </View>
    );
  }

  const handleCreate = async () => {
    setLoading(true);
    try {
      const code = await createPairingCode();
      setMyCode(code);
      setMode("create");
    } catch (e: any) {
      Alert.alert(en ? "Something went wrong" : "發生錯誤", e.message ?? (en ? "Please try again later" : "請稍後再試"));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inputCode.trim()) return;
    setLoading(true);
    try {
      await redeemPairingCode(inputCode.trim());
      await refreshPairing();
      Alert.alert(en ? "Paired successfully!" : "配對成功！", en ? "You’re now connected 💕" : "你們已經連上囉 💕");
    } catch (e: any) {
      Alert.alert(en ? "Pairing failed" : "配對失敗", e.message ?? (en ? "Please check the pairing code" : "請確認配對碼是否正確"));
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!myCode) return;
    await Clipboard.setStringAsync(myCode);
    Alert.alert(en ? "Copied" : "已複製", en ? "Send this pairing code to your partner" : "把配對碼傳給對方吧");
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.screenBg[2] }]}>
      <LinearGradient colors={colors.screenBg as any} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable
          onPress={() => (mode === "choose" ? router.back() : setMode("choose"))}
          style={[styles.iconBtn, { backgroundColor: colors.chipBg }]}
        >
          <ArrowLeft size={15} color={colors.ink} />
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>{en ? "Pairing" : "配對"}</Text>
        <View style={{ width: 30 }} />
      </View>

      {mode === "choose" && (
        <View style={{ padding: 16, gap: 12 }}>
          <Pressable onPress={handleCreate} disabled={loading} style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: colors.ink }}>{en ? "Create pairing code" : "產生配對碼"}</Text>
            <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 4 }}>{en ? "Your partner can enter this code to connect" : "給對方輸入，連上你的帳號"}</Text>
          </Pressable>
          <Pressable onPress={() => setMode("join")} disabled={loading} style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: colors.ink }}>{en ? "Enter pairing code" : "輸入配對碼"}</Text>
            <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 4 }}>{en ? "Connect using your partner’s code" : "用對方給你的配對碼連上"}</Text>
          </Pressable>
          {loading && <ActivityIndicator color={colors.primary} />}
        </View>
      )}

      {mode === "create" && myCode && (
        <View style={{ padding: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 13, color: colors.inkSoft, marginBottom: 16 }}>{en ? "Send this code to your partner" : "把這組配對碼傳給對方"}</Text>
          <Pressable onPress={copyCode} style={[styles.codeBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={{ fontSize: 32, fontWeight: "800", letterSpacing: 6, color: colors.primaryDeep }}>{myCode}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 }}>
              <Copy size={12} color={colors.inkSoft} />
              <Text style={{ fontSize: 11, color: colors.inkSoft }}>{en ? "Tap to copy" : "點擊複製"}</Text>
            </View>
          </Pressable>
          <Text style={{ fontSize: 11, color: colors.inkSoft, marginTop: 20, textAlign: "center" }}>
            {en ? "This screen updates automatically after your partner enters the code" : "對方輸入後，這個畫面會自動更新為配對成功"}
          </Text>
        </View>
      )}

      {mode === "join" && (
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 13, color: colors.inkSoft, marginBottom: 10 }}>{en ? "Enter your partner’s 6-character code" : "輸入對方給你的 6 位英數配對碼"}</Text>
          <TextInput
            value={inputCode}
            onChangeText={setInputCode}
            autoCapitalize="characters"
            maxLength={6}
            placeholder="A1B2C3"
            placeholderTextColor={colors.inkSoft}
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.ink, borderColor: colors.cardBorder }]}
          />
          <Pressable onPress={handleJoin} disabled={loading || inputCode.length < 6} style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 16, opacity: loading || inputCode.length < 6 ? 0.5 : 1 }]}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{en ? "Pair now" : "確認配對"}</Text>}
          </Pressable>
        </View>
      )}
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    root: { flex: 1 },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 60 : 32, paddingBottom: 12,
    },
    iconBtn: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    title: { flex: 1, textAlign: "center", fontWeight: "700", fontSize: 17 },
    card: { borderRadius: 20, padding: 16, borderWidth: 1 },
    codeBox: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 32, paddingVertical: 24, alignItems: "center" },
    input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 20, textAlign: "center", letterSpacing: 8 },
    primaryBtn: { paddingVertical: 13, borderRadius: 100, alignItems: "center", justifyContent: "center" },
  });
}
