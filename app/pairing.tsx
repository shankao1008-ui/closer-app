import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Copy, Heart } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator, Alert, AppState, KeyboardAvoidingView, ScrollView, Share, Pressable, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { pairingText, normalizePairingCode } from "../lib/pairingText";
import { useApp } from "../context/AppContext";
import { createPairingCode, redeemPairingCode } from "../lib/pairing";

export default function PairingScreen() {
  const { colors, coupleId, lang, refreshPairing } = useApp();
  const c = pairingText(lang);
  const insets = useSafeAreaInsets();
  const requestLock = useRef(false);
  const router = useRouter();
  const styles = makeStyles(colors);
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [myCode, setMyCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Refresh the creator too, even when Realtime publication is unavailable.
  useEffect(() => {
    if (coupleId || mode !== "create") return;
    const timer = setInterval(() => { if (AppState.currentState === "active") void refreshPairing().catch(() => {}); }, 5000);
    return () => clearInterval(timer);
  }, [coupleId, mode, refreshPairing]);

  // 已經配對成功了，直接返回主畫面
  if (coupleId) {
    return (
      <View style={[styles.root, { backgroundColor: colors.screenBg[2], alignItems: "center", justifyContent: "center", padding: 24 }]}>
        <Heart size={40} color={colors.primary} />
        <Text style={{ marginTop: 12, fontSize: 15, fontWeight: "700", color: colors.ink }}>{c.success}</Text>
        <Pressable onPress={() => router.replace("/(tabs)")} style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 20 }]}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{c.home}</Text>
        </Pressable>
      </View>
    );
  }

  const handleCreate = async () => {
    if (requestLock.current) return;
    requestLock.current = true;
    setLoading(true);
    try {
      const code = await createPairingCode();
      setMyCode(code);
      setMode("create");
    } catch (e: any) {
      Alert.alert(c.error, c.retry);
    } finally {
      requestLock.current = false;
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (requestLock.current || !/^[A-Z0-9]{6}$/.test(inputCode)) return;
    requestLock.current = true;
    setLoading(true);
    try {
      await redeemPairingCode(inputCode.trim());
      await refreshPairing();
      Alert.alert(c.success, c.subtitle);
    } catch (e: any) {
      Alert.alert(c.failed, c.check);
    } finally {
      requestLock.current = false;
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!myCode) return;
    try {
      await Clipboard.setStringAsync(myCode);
      Alert.alert(c.copied, c.copiedHint);
    } catch { Alert.alert(c.error, c.retry); }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.screenBg[2] }]}>
      <LinearGradient colors={colors.screenBg as any} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          accessibilityRole="button" accessibilityLabel={c.back} disabled={loading}
          onPress={() => (mode === "choose" ? router.back() : setMode("choose"))}
          style={[styles.iconBtn, { backgroundColor: colors.chipBg }]}
        >
          <ArrowLeft size={15} color={colors.ink} />
        </Pressable>
        <Text style={[styles.title, { color: colors.ink }]}>{c.title}</Text>
        <View style={{ width: 30 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
      <View style={{ alignItems: "center", padding: 24, gap: 14 }}><View style={{ padding: 22, borderRadius: 30, backgroundColor: colors.cardBg }}><Heart size={36} color={colors.primary} fill={colors.primary + "20"} /></View><Text style={{ color: colors.ink, fontSize: 22, fontWeight: "800", textAlign: "center" }}>{c.subtitle}</Text></View>
      {mode === "choose" && (
        <View style={{ padding: 16, gap: 12 }}>
          <Pressable onPress={handleCreate} disabled={loading} style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: colors.ink }}>{c.create}</Text>
            <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 4 }}>{c.createHint}</Text>
          </Pressable>
          <Pressable onPress={() => setMode("join")} disabled={loading} style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: colors.ink }}>{c.join}</Text>
            <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 4 }}>{c.joinHint}</Text>
          </Pressable>
          {loading && <ActivityIndicator color={colors.primary} />}
        </View>
      )}

      {mode === "create" && myCode && (
        <View style={{ padding: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 13, color: colors.inkSoft, marginBottom: 16 }}>{c.sendCode}</Text>
          <Pressable onPress={copyCode} style={[styles.codeBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={{ fontSize: 32, fontWeight: "800", letterSpacing: 6, color: colors.primaryDeep }}>{myCode}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 }}>
              <Copy size={12} color={colors.inkSoft} />
              <Text style={{ fontSize: 11, color: colors.inkSoft }}>{c.copy}</Text>
            </View>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={async () => { try { await Share.share({ message: `${c.sendCode}: ${myCode}` }); } catch { Alert.alert(c.error, c.retry); } }} style={[styles.primaryBtn, { backgroundColor: colors.primary, alignSelf: "stretch", marginTop: 16 }]}><Text style={{ color: "#fff", fontWeight: "700" }}>{c.share}</Text></Pressable>
          <Text style={{ fontSize: 11, color: colors.inkSoft, marginTop: 20, textAlign: "center" }}>
            {c.waiting}
          </Text>
        </View>
      )}

      {mode === "join" && (
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 13, color: colors.inkSoft, marginBottom: 10 }}>{c.input}</Text>
          <TextInput
            value={inputCode}
            onChangeText={value => setInputCode(normalizePairingCode(value))}
            accessibilityLabel={c.input}
            editable={!loading}
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => { void handleJoin(); }}
            autoCapitalize="characters"
            placeholder="A1B2C3"
            placeholderTextColor={colors.inkSoft}
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.ink, borderColor: colors.cardBorder }]}
          />
          <Pressable onPress={handleJoin} disabled={loading || inputCode.length < 6} style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 16, opacity: loading || inputCode.length < 6 ? 0.5 : 1 }]}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{c.pair}</Text>}
          </Pressable>
        </View>
      )}
      </ScrollView></KeyboardAvoidingView>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    root: { flex: 1 },
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12,
    },
    iconBtn: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    title: { flex: 1, textAlign: "center", fontWeight: "700", fontSize: 17 },
    card: { borderRadius: 26, padding: 24, borderWidth: 1 },
    codeBox: { borderRadius: 28, borderWidth: 1, paddingHorizontal: 32, paddingVertical: 24, alignItems: "center" },
    input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 20, textAlign: "center", letterSpacing: 8 },
    primaryBtn: { minHeight: 54, paddingHorizontal: 16, paddingVertical: 16, borderRadius: 100, alignItems: "center", justifyContent: "center" },
  });
}
