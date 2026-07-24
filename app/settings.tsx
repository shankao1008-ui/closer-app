import { useRouter } from "expo-router";
import { ArrowLeft, Check, Globe } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LANGUAGES, useApp } from "../context/AppContext";

export default function SettingsScreen() {
  const { colors, t, lang, setLang, gender, setGender } = useApp();
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
  });
}
