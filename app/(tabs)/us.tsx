import { LinearGradient } from "expo-linear-gradient";
import { Bell, Gift, Lock, Plane, Sparkles, X } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import AvatarPicker from "../../components/AvatarPicker";
import { useApp } from "../../context/AppContext";
import { ME, REL, diffParts, getNextMonthlyOccurrence } from "../../lib/data";

export default function UsScreen() {
  const {
    colors, t, partner, monthlyDays, setMonthlyDays, notifSettings, setNotifSettings,
    myAvatarUri, setMyAvatarUri, partnerAvatarUri, setPartnerAvatarUri,
  } = useApp();
  const styles = makeStyles(colors);
  const [now] = useState(new Date());
  const [editingDates, setEditingDates] = useState(false);
  const [newDay, setNewDay] = useState("");

  const togetherDays = diffParts(now, REL.startDate).days;
  const meetingCd = diffParts(REL.nextMeeting.date, now);
  const monthlyInfo = getNextMonthlyOccurrence(monthlyDays, now);
  const monthlyDaysLabel = monthlyDays.length
    ? monthlyDays.map((d: number) => `${d}${t("monthlyDaySuffix")}`).join(" · ")
    : t("monthlyNotSet");

  const addDay = () => {
    const n = parseInt(newDay, 10);
    if (n >= 1 && n <= 31 && !monthlyDays.includes(n)) {
      setMonthlyDays((d: number[]) => [...d, n].sort((a, b) => a - b));
    }
    setNewDay("");
  };
  const removeDay = (n: number) => {
    if (monthlyDays.length <= 1) return;
    setMonthlyDays((d: number[]) => d.filter((x) => x !== n));
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={colors.screenBg as any} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>{t("tabUs")}</Text>

        {/* couple card */}
        <View style={[styles.card, { alignItems: "center", paddingVertical: 22 }]}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ marginRight: -14, zIndex: 1 }}>
              <AvatarPicker uri={myAvatarUri} onChange={setMyAvatarUri} initials={ME.avatar} size={64} bgColor={colors.primary} />
            </View>
            <AvatarPicker uri={partnerAvatarUri} onChange={setPartnerAvatarUri} initials={partner.avatar} size={64} bgColor={colors.lavenderDeep} />
          </View>
          <Text style={[styles.coupleName, { color: colors.ink }]}>{partner.name} ❤️ {ME.name}</Text>
          <Text style={{ fontSize: 12.5, color: colors.inkSoft, marginTop: 5 }}>
            {t("togetherLabel")} {togetherDays.toLocaleString()} {t("daysWord")}
          </Text>
        </View>

        {/* important dates */}
        <View style={styles.card}>
          <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t("importantDates")}</Text>

          <AlignedRow icon={Lock} label={t("anniversaryLocked")}
            value={`${REL.startDate.getFullYear()} / ${String(REL.startDate.getMonth() + 1).padStart(2, "0")} / ${String(REL.startDate.getDate()).padStart(2, "0")}`}
            colors={colors} />
          <AlignedRow icon={Sparkles} label={t("monthlyAnniversary")} value={monthlyDaysLabel} colors={colors} />
          <AlignedRow icon={Gift} label={t("partnerBirthday")} value={REL.partnerBirthday.replace("-", " / ")} colors={colors} />
          <AlignedRow icon={Gift} label={t("myBirthday")} value={REL.myBirthday.replace("-", " / ")} colors={colors} />
          <AlignedRow icon={Plane} label={t("nextMeetingLabel")}
            value={`${REL.nextMeeting.cityName} · ${t("daysUntilSuffix", { d: meetingCd.days })}`} colors={colors} last />

          {editingDates && (
            <View style={[styles.editBox, { borderTopColor: colors.hairline }]}>
              <Text style={{ fontSize: 11, color: colors.inkSoft, marginBottom: 8 }}>{t("monthlyAnniversary")}</Text>
              <View style={styles.chipsWrap}>
                {monthlyDays.map((d: number) => (
                  <View key={d} style={[styles.dayChip, { backgroundColor: colors.primary + "22" }]}>
                    <Text style={{ color: colors.primaryDeep, fontWeight: "700", fontSize: 12 }}>{d}{t("monthlyDaySuffix")}</Text>
                    <Pressable onPress={() => removeDay(d)} style={{ marginLeft: 4 }}>
                      <X size={11} color={colors.primaryDeep} />
                    </Pressable>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                <TextInput
                  value={newDay}
                  onChangeText={(v) => setNewDay(v.replace(/\D/g, ""))}
                  placeholder="1-31"
                  placeholderTextColor={colors.inkSoft}
                  keyboardType="number-pad"
                  style={[styles.dayInput, { borderColor: colors.hairline, color: colors.ink }]}
                />
                <Pressable onPress={addDay} style={[styles.smallBtn, { backgroundColor: colors.primary + "22" }]}>
                  <Text style={{ color: colors.primaryDeep, fontSize: 12, fontWeight: "700" }}>{t("addDate")}</Text>
                </Pressable>
                <Pressable onPress={() => setEditingDates(false)} style={[styles.smallBtn, { backgroundColor: colors.ink, marginLeft: "auto" }]}>
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>{t("doneLabel")}</Text>
                </Pressable>
              </View>
            </View>
          )}
          {!editingDates && (
            <Pressable onPress={() => setEditingDates(true)} style={{ alignSelf: "flex-end", marginTop: 10 }}>
              <Text style={{ color: colors.primaryDeep, fontSize: 12 }}>✏️ {t("editAllDates")}</Text>
            </Pressable>
          )}
        </View>

        {/* notifications */}
        <View style={styles.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Bell size={12} color={colors.inkSoft} />
            <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t("notifSection")}</Text>
          </View>
          <ToggleRow
            icon={Sparkles} label={t("notifForHabibi")} sub={t("notifForHabibiSub")}
            value={notifSettings.forYou} onChange={(v: boolean) => setNotifSettings((s: any) => ({ ...s, forYou: v }))}
            colors={colors}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function AlignedRow({ icon: Icon, label, value, colors, last }: any) {
  return (
    <View style={[styles2.row, { borderBottomColor: colors.hairline, borderBottomWidth: last ? 0 : 1 }]}>
      <Icon size={14} color={colors.primaryDeep} style={{ marginRight: 8 }} />
      <Text style={{ width: 84, fontSize: 12.5, fontWeight: "700", color: colors.ink, flexShrink: 0 }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: 12.5, color: colors.ink, fontWeight: "500" }}>{value}</Text>
    </View>
  );
}

function ToggleRow({ icon: Icon, label, sub, value, onChange, colors }: any) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
      <Icon size={15} color={colors.inkSoft} style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12.5, color: colors.ink }}>{label}</Text>
        {sub && <Text style={{ fontSize: 10.5, color: colors.inkSoft, marginTop: 2 }}>{sub}</Text>}
      </View>
      <Pressable
        onPress={() => onChange(!value)}
        style={{ width: 38, height: 22, borderRadius: 100, backgroundColor: value ? colors.primary : colors.hairline, justifyContent: "center" }}
      >
        <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: "#fff", marginLeft: value ? 18 : 2 }} />
      </Pressable>
    </View>
  );
}

const styles2 = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
});

function makeStyles(colors: any) {
  return StyleSheet.create({
    body: { padding: 16, paddingTop: Platform.OS === "ios" ? 60 : 32, paddingBottom: 40, gap: 12 },
    headerTitle: { fontWeight: "700", fontSize: 17, textAlign: "center", marginBottom: 2 },
    card: { backgroundColor: colors.cardBg, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.cardBorder },
    coupleAvatar: { width: 76, height: 76, borderRadius: 38, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.7)" },
    coupleAvatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
    coupleName: { fontWeight: "700", fontSize: 16, marginTop: 10 },
    eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 },
    editBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
    chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
    dayChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
    dayInput: { width: 70, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12 },
    smallBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  });
}
