import React, { useState } from "react";
import { Linking, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import { useApp } from "../context/AppContext";
import { buildPayment, type PaymentCoin } from "../lib/cryptoPayment";
import { cryptoText } from "../lib/cryptoText";

export default function WalletTransfer() {
  const { uid, coupleId } = useApp();
  return <TransferForm key={JSON.stringify([uid, coupleId])} />;
}
function TransferForm() {
  const { colors, lang } = useApp();
  const router = useRouter();
  const c = cryptoText(lang);
  const [coin, setCoin] = useState<PaymentCoin>("BTC");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [payment, setPayment] = useState<ReturnType<typeof buildPayment> | null>(null);
  const [status, setStatus] = useState<"badAddress" | "badAmount" | "failed" | "opened" | "copied" | null>(null);
  const [busy, setBusy] = useState(false);
  const review = () => {
    try { setPayment(buildPayment(coin, address, amount)); setStatus(null); }
    catch (e) { setStatus(e instanceof Error && e.message === "amount" ? "badAmount" : "badAddress"); }
  };
  const open = async (uri: string) => {
    if (busy) return;
    setBusy(true);
    try { await Linking.openURL(uri); setStatus("opened"); }
    catch { setStatus("failed"); }
    finally { setBusy(false); }
  };
  const button = (label: string, action: () => void) => <Pressable accessibilityRole="button" disabled={busy} onPress={action}
    style={{ padding: 14, minHeight: 48, borderRadius: 14, backgroundColor: colors.hairline, opacity: busy ? 0.5 : 1 }}>
    <Text style={{ color: colors.ink, textAlign: "center", fontWeight: "700" }}>{label}</Text>
  </Pressable>;
  const inputStyle = { borderWidth: 1, borderColor: colors.hairline, borderRadius: 12, padding: 14, color: colors.ink, backgroundColor: colors.cardBg };
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.cardBg }}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 16 }}>
      {button(c.close, () => router.back())}
      <Text style={{ color: colors.ink, fontSize: 24, fontWeight: "700" }}>{c.title}</Text>
      <Text style={{ color: colors.inkSoft }}>{c.network}</Text>
      {!payment ? <>
        <View style={{ flexDirection: "row", gap: 12 }}>{(["BTC", "XMR"] as const).map(value =>
          <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: coin === value }}
            onPress={() => { setCoin(value); setAddress(""); setAmount(""); setStatus(null); }}
            style={{ flex: 1, padding: 16, borderRadius: 12, borderWidth: 2, borderColor: coin === value ? colors.primary : colors.hairline }}>
            <Text style={{ color: colors.ink }}>{value === "BTC" ? "Bitcoin (BTC)" : "Monero (XMR)"}</Text>
          </Pressable>)}</View>
        <Text style={{ color: colors.ink }}>{c.address}</Text>
        <TextInput accessibilityLabel={c.address} value={address} onChangeText={setAddress} autoCapitalize="none" autoCorrect={false} maxLength={120} style={inputStyle} />
        <Text style={{ color: colors.ink }}>{c.amount} ({coin})</Text>
        <TextInput accessibilityLabel={c.amount} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" maxLength={30} style={inputStyle} />
        {button(c.review, review)}
      </> : <>
        <Text style={{ color: colors.ink, fontSize: 22 }}>{payment.amount} {payment.coin}</Text>
        <Text style={{ color: colors.ink }}>{c.address}</Text>
        <Text selectable style={{ color: colors.ink }}>{payment.address}</Text>
        <Text style={{ color: colors.inkSoft }}>{c.note}</Text>
        {button(c.open, () => { void open(payment.uri); })}
        {button(c.copy, () => { void Clipboard.setStringAsync(payment.uri).then(() => setStatus("copied")).catch(() => setStatus("failed")); })}
        {button(c.cake, () => { void open("cakewallet:"); })}
        {button(c.edit, () => { setPayment(null); setStatus(null); })}
        <Text style={{ color: colors.inkSoft }}>{c.routing}</Text>
      </>}
      {status && <Text accessibilityRole="alert" style={{ color: colors.ink }}>{c[status]}</Text>}
    </ScrollView>
  </SafeAreaView>;
}
