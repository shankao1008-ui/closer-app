import { useRouter } from "expo-router";
import { ArrowLeft, Check, Globe, Unlink, Users } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LANGUAGES, useApp } from "../context/AppContext";

export default function SettingsScreen() {
  const { colors, t, lang, setLang, gender, setGender, coupleId, unpair } = useApp();
  const [unpairing, setUnpairing] = useState(false);
  const router = useRouter();
  const styles = makeStyles(colors);

  return (
    <View style={[styles.root, { backgroundColor: colors.screenBg[2] }]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: Platform.OS === "ios" ? 20 : 24, paddingBottom: 40 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.chipBg }]}>
            <ArrowLeft size={15} color={colors.ink} />
          </Pressable>
          <Text style={[styles.title, { color: colors.ink }]}>{t("settingsTitle")}</Text>
          <View style={{ width: 30 }} />
        </View>

        <Pressable
          onPress={() => router.push("/pairing")}
          style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Users size={15} color={colors.primaryDeep} />
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.ink }}>{lang === "en" ? "Partner Pairing" : "伴侶配對"}</Text>
          </View>
          <Text style={{ fontSize: 11.5, color: coupleId ? colors.primaryDeep : colors.inkSoft, fontWeight: coupleId ? "700" : "500" }}>
            {coupleId ? (lang === "en" ? "Paired" : "已配對") : (lang === "en" ? "Not paired" : "尚未配對")}
          </Text>
        </Pressable>

        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t("editProfile")}</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <Pressable
              onPress={() => setGender("feminine")}
              style={[styles.genderBtn, { backgroundColor: gender === "feminine" ? "rgba(255,138,101,0.18)" : colors.hairline }]}
            >
              <Text style={{ color: gender === "feminine" ? "#E67A55" : colors.inkSoft, fontWeight: gender === "feminine" ? "700" : "500", fontSize: 12.5 }}>
                👩 {t("femaleLabel")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setGender("masculine")}
              style={[styles.genderBtn, { backgroundColor: gender === "masculine" ? "rgba(59,130,214,0.16)" : colors.hairline }]}
            >
              <Text style={{ color: gender === "masculine" ? "#2E6BB0" : colors.inkSoft, fontWeight: gender === "masculine" ? "700" : "500", fontSize: 12.5 }}>
                👨 {t("maleLabel")}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Globe size={12} color={colors.inkSoft} />
            <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t("languageLabel")}</Text>
          </View>
          <View style={{ gap: 6 }}>
            {LANGUAGES.map((l) => (
              <Pressable
                key={l.code}
                onPress={() => setLang(l.code)}
                style={[styles.langRow, { backgroundColor: lang === l.code ? "rgba(255,138,101,0.16)" : colors.chipBg }]}
              >
                <Text style={{ fontSize: 13, color: colors.ink, fontWeight: lang === l.code ? "700" : "500" }}>{l.native}</Text>
                {lang === l.code && <Check size={15} color={colors.primaryDeep} />}
              </Pressable>
            ))}
          </View>
        </View>

        {coupleId && (
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}> 
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
              <Unlink size={15} color="#D9822B" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12.5, color: colors.ink, fontWeight: "700" }}>{lang === "en" ? "Unpair" : "取消配對"}</Text>
                <Text style={{ fontSize: 10.5, color: colors.inkSoft, marginTop: 2 }}>{lang === "en" ? "Disconnects both partners" : "雙方都會解除連結"}</Text>
              </View>
            </View>
            <Pressable
              disabled={unpairing}
              onPress={() => {
                Alert.alert(
                  lang === "en" ? "Unpair from your partner?" : "確定取消配對？",
                  lang === "en" ? "You will both stop sharing data and messages." : "取消後，雙方將無法繼續同步資料與聊天。",
                  [
                    { text: lang === "en" ? "Cancel" : "取消", style: "cancel" },
                    {
                      text: lang === "en" ? "Unpair" : "取消配對",
                      style: "destructive",
                      onPress: async () => {
                        setUnpairing(true);
                        try {
                          await unpair();
                          Alert.alert(lang === "en" ? "Unpaired" : "已取消配對", lang === "en" ? "Your accounts are no longer connected." : "你們的帳號已解除連結。", [
                            { text: lang === "en" ? "OK" : "知道了", onPress: () => router.replace("/(tabs)") },
                          ]);
                        } catch (error: any) {
                          Alert.alert(lang === "en" ? "Unable to unpair" : "無法取消配對", error?.message ?? (lang === "en" ? "Please try again later" : "請稍後再試"));
                        } finally {
                          setUnpairing(false);
                        }
                      },
                    },
                  ]
                );
              }}
              style={[styles.unpairBtn, { opacity: unpairing ? 0.6 : 1 }]}
            >
              {unpairing ? <ActivityIndicator size="small" color="#D9822B" /> : <Text style={styles.unpairText}>{lang === "en" ? "Unpair" : "取消配對"}</Text>}
            </Pressable>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}> 
          <Text style={{ fontSize: 12.5, color: "#D6484D", fontWeight: "700" }}>⚠️ {t("deleteAccount")}</Text>
          <Pressable style={styles.deleteBtn}>
            <Text style={{ fontSize: 11.5, color: "#D6484D" }}>⚠️ {t("deleteAction")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    root: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    title: { flex: 1, textAlign: "center", fontWeight: "700", fontSize: 17 },
    iconBtn: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    card: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 12 },
    eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
    genderBtn: { flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: "center" },
    langRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
    deleteBtn: { backgroundColor: "rgba(255,107,107,0.12)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100 },
    unpairBtn: { backgroundColor: "rgba(217,130,43,0.12)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100, minWidth: 76, alignItems: "center" },
    unpairText: { fontSize: 11.5, color: "#D9822B", fontWeight: "700" },
  });
}
