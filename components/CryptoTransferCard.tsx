import React, { useRef, useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import { Wallet, ChevronRight } from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { cryptoText } from "../lib/cryptoText";

export default function CryptoTransferCard() {
  const { colors, lang } = useApp();
  const opening = useRef(false);
  const [busy, setBusy] = useState(false);
  const labels: Record<string, [string, string]> = {
    "zh-Hant": ["開啟 Cake Wallet", "無法開啟 Cake Wallet，請先在手機安裝 App，再試一次。"],
    "zh-Hans": ["打开 Cake Wallet", "无法打开 Cake Wallet，请先在手机安装 App，再试一次。"],
    en: ["Open Cake Wallet", "Could not open Cake Wallet. Install the app on your phone and try again."],
    ja: ["Cake Wallet を開く", "Cake Wallet を開けません。スマートフォンにアプリをインストールして、もう一度お試しください。"],
    ko: ["Cake Wallet 열기", "Cake Wallet을 열 수 없습니다. 휴대폰에 앱을 설치한 후 다시 시도해 주세요."],
    es: ["Abrir Cake Wallet", "No se pudo abrir Cake Wallet. Instala la aplicación en tu teléfono e inténtalo de nuevo."],
    fr: ["Ouvrir Cake Wallet", "Impossible d’ouvrir Cake Wallet. Installez l’application sur votre téléphone et réessayez."],
    de: ["Cake Wallet öffnen", "Cake Wallet konnte nicht geöffnet werden. Installiere die App auf deinem Handy und versuche es erneut."],
    th: ["เปิด Cake Wallet", "ไม่สามารถเปิด Cake Wallet ได้ โปรดติดตั้งแอปบนโทรศัพท์แล้วลองอีกครั้ง"]
  };
  const copy = labels[lang] ?? labels.en;
  const openWallet = async () => {
    if (opening.current) return;
    opening.current = true;
    setBusy(true);
    try {
      await Linking.openURL("cakewallet:");
    } catch {
      Alert.alert(copy[0], copy[1]);
    } finally {
      opening.current = false;
      setBusy(false);
    }
  };
  return <Pressable accessibilityRole="button" accessibilityLabel={copy[0]} disabled={busy} accessibilityState={{ disabled: busy, busy }}
    onPress={openWallet}
    style={{ backgroundColor: colors.cardBg, borderRadius: 22, padding: 18, flexDirection: "row", alignItems: "center", gap: 12 }}>
    <View style={{ padding: 12, backgroundColor: colors.hairline, borderRadius: 14 }}>
      <Wallet size={24} color={colors.primary} />
    </View>
    <View style={{ flex: 1, gap: 5 }}>
      <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "700" }}>{cryptoText(lang).title}</Text>
      <Text style={{ color: colors.inkSoft, fontSize: 12 }}>{copy[0]} · BTC / XMR</Text>
    </View>
    <ChevronRight size={20} color={colors.inkSoft} />
  </Pressable>;
}
