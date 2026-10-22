import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Bell, CalendarDays, Edit3, Gift, Lock, MapPin, Plane, Sparkles, X } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Switch } from "react-native";
import UsStory from "../../components/UsStory";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { polishText } from "../../lib/polishText";
import { usDesignText } from "../../lib/usDesignText";
import CityPicker from "../../components/CityPicker";
import { useApp } from "../../context/AppContext";
import { City, localizeCityName } from "../../lib/cities";
import { diffParts } from "../../lib/data";

function formatDate(date: Date | null | undefined): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDate(text: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function validBirthday(text: string): boolean {
  const match = /^(\d{2})-(\d{2})$/.exec(text.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const day = Number(match[2]);
  const probe = new Date(2024, month - 1, day);
  return probe.getMonth() === month - 1 && probe.getDate() === day;
}

type PickerField = "start" | "last" | "next" | "mine" | "partner";

function birthdayToDate(value: string): Date {
  const match = /^(\d{2})-(\d{2})$/.exec(value);
  return match ? new Date(2000, Number(match[1]) - 1, Number(match[2])) : new Date(2000, 0, 1);
}

export default function UsScreen() {
  const {
    colors, t, lang, monthlyDays, setMonthlyDays, notifSettings, setNotifSettings,
    rel, setRel,
  } = useApp();
  const styles = makeStyles(colors);
  const [now, setNow] = useState(new Date());
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const design = usDesignText(lang);
  const polish = polishText(lang);
  useFocusEffect(useCallback(() => { setNow(new Date()); }, []));
  const [editingDates, setEditingDates] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [startDateText, setStartDateText] = useState("");
  const [lastMeetingText, setLastMeetingText] = useState("");
  const [nextMeetingText, setNextMeetingText] = useState("");
  const [meetingCity, setMeetingCity] = useState("");
  const [myBirthday, setMyBirthday] = useState("");
  const [partnerBirthday, setPartnerBirthday] = useState("");
  const [draftMonthlyDays, setDraftMonthlyDays] = useState<number[]>([]);
  const [newDay, setNewDay] = useState("");
  const [activePicker, setActivePicker] = useState<PickerField | null>(null);
  const [pickerValue, setPickerValue] = useState(new Date());

  const copy = lang === "zh-Hant" ? {
    lastMeeting: "上次見面",
    startDate: "交往開始日期",
    lastMeetingDate: "上次見面日期",
    nextMeetingDate: "下次見面日期",
    nextMeetingPlace: "下次見面地點",
    selectCity: "選擇城市",
    myBirthday: "我的生日",
    partnerBirthday: "伴侶生日",
    monthlyAnniversary: "每月紀念日",
    invalidDayTitle: "日期錯誤",
    invalidDayMessage: "每月紀念日請輸入 1–31。",
    invalidDateTitle: "日期格式錯誤",
    invalidDateMessage: "請重新選擇有效日期。",
    cityTitle: "尚未選擇地點",
    cityMessage: "請選擇下次見面的城市。",
    done: "完成",
  } : {
    lastMeeting: "Last Meeting",
    startDate: "Relationship Start Date",
    lastMeetingDate: "Last Meeting Date",
    nextMeetingDate: "Next Meeting Date",
    nextMeetingPlace: "Next Meeting Location",
    selectCity: "Select a city",
    myBirthday: "My Birthday",
    partnerBirthday: "Partner's Birthday",
    monthlyAnniversary: "Monthly Anniversary",
    invalidDayTitle: "Invalid Day",
    invalidDayMessage: "Enter a monthly anniversary day from 1 to 31.",
    invalidDateTitle: "Invalid Date",
    invalidDateMessage: "Please select a valid date.",
    cityTitle: "Location Required",
    cityMessage: "Please select the city for your next meeting.",
    done: "Done",
  };

  const togetherDays = rel.startDate && !Number.isNaN(rel.startDate.getTime()) && rel.startDate <= now ? diffParts(now, rel.startDate).days : null;
  const meetingCd = diffParts(rel.nextMeeting.date, now);
  const monthlyDaysLabel = monthlyDays.length
    ? monthlyDays.map((day) => `${day}${t("monthlyDaySuffix")}`).join(" · ")
    : t("monthlyNotSet");

  const openDateEditor = () => {
    setStartDateText(formatDate(rel.startDate));
    setLastMeetingText(formatDate(rel.lastMeeting));
    setNextMeetingText(formatDate(rel.nextMeeting.date));
    setMeetingCity(rel.nextMeeting.cityName ?? "");
    setMyBirthday(rel.myBirthday ?? "");
    setPartnerBirthday(rel.partnerBirthday ?? "");
    setDraftMonthlyDays([...monthlyDays]);
    setNewDay("");
    setActivePicker(null);
    setEditingDates(true);
  };

  const addMonthlyDay = () => {
    const day = Number(newDay);
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      Alert.alert(copy.invalidDayTitle, copy.invalidDayMessage);
      return;
    }
    if (!draftMonthlyDays.includes(day)) {
      setDraftMonthlyDays((days) => [...days, day].sort((a, b) => a - b));
    }
    setNewDay("");
  };

  const saveAllDates = () => {
    const startDate = parseDate(startDateText);
    const lastMeeting = parseDate(lastMeetingText);
    const nextMeetingDate = parseDate(nextMeetingText);
    if ((startDateText.trim() && !startDate) || (lastMeetingText.trim() && !lastMeeting) || (nextMeetingText.trim() && !nextMeetingDate)) {
      Alert.alert(copy.invalidDateTitle, copy.invalidDateMessage);
      return;
    }
    if ((myBirthday.trim() && !validBirthday(myBirthday)) || (partnerBirthday.trim() && !validBirthday(partnerBirthday))) {
      Alert.alert(copy.invalidDateTitle, copy.invalidDateMessage);
      return;
    }
    const today = new Date(); today.setHours(23, 59, 59, 999);
    if ((startDate && startDate > today) || (lastMeeting && lastMeeting > today)) {
      Alert.alert(copy.invalidDateTitle, polish.future);
      return;
    }
    if (nextMeetingDate && !meetingCity.trim()) {
      Alert.alert(copy.cityTitle, copy.cityMessage);
      return;
    }
    setRel((current) => ({
      ...current,
      startDate: startDate ?? current.startDate,
      lastMeeting: lastMeeting ?? current.lastMeeting,
      myBirthday: myBirthday.trim() || current.myBirthday,
      partnerBirthday: partnerBirthday.trim() || current.partnerBirthday,
      nextMeeting: { ...current.nextMeeting, cityName: meetingCity.trim() || current.nextMeeting.cityName, date: nextMeetingDate ?? current.nextMeeting.date },
    }));
    setMonthlyDays(draftMonthlyDays);
    setEditingDates(false);
  };

  const openPicker = (field: PickerField) => {
    const values: Record<PickerField, Date> = {
      start: parseDate(startDateText) ?? new Date(),
      last: parseDate(lastMeetingText) ?? new Date(),
      next: parseDate(nextMeetingText) ?? new Date(),
      mine: birthdayToDate(myBirthday),
      partner: birthdayToDate(partnerBirthday),
    };
    setPickerValue(values[field]);
    setActivePicker(field);
  };

  const changePickerDate = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setActivePicker(null);
    if (event.type === "dismissed" || !selected || !activePicker) return;
    setPickerValue(selected);
    if (activePicker === "start") setStartDateText(formatDate(selected));
    if (activePicker === "last") setLastMeetingText(formatDate(selected));
    if (activePicker === "next") setNextMeetingText(formatDate(selected));
    const birthday = `${String(selected.getMonth() + 1).padStart(2, "0")}-${String(selected.getDate()).padStart(2, "0")}`;
    if (activePicker === "mine") setMyBirthday(birthday);
    if (activePicker === "partner") setPartnerBirthday(birthday);
  };

  const openCityPicker = () => {
    setEditingDates(false);
    setTimeout(() => setShowCityPicker(true), 250);
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={colors.screenBg as any} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={[styles.body, { paddingTop: insets.top + 18 }]} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}><Text style={[styles.headerTitle, { color: colors.ink }]}>{t("tabUs")}<Text style={{ color: colors.primary }}>.</Text></Text>
          <Text style={{ color: colors.inkSoft, fontSize: 14, lineHeight: 21, marginTop: 5 }}>{design.subtitle}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel={t("settingsTitle")} onPress={() => router.push('/settings')} style={{ width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: colors.cardBg }}><Edit3 size={20} color={colors.primaryDeep} /></Pressable>
        </View>
        <UsStory days={togetherDays} />

        <View style={styles.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <Text style={{ flex: 1, color: colors.ink, fontSize: 20, fontWeight: "800" }}>{design.timeline}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={t("editAllDates")} onPress={openDateEditor} style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: colors.hairline, alignItems: "center", justifyContent: "center" }}><Edit3 size={18} color={colors.primaryDeep} /></Pressable>
          </View>
          <AlignedRow icon={Lock} label={t("anniversaryLocked")} value={formatDate(rel.startDate).replaceAll("-", " / ") || "—"} colors={colors} />
          <AlignedRow icon={CalendarDays} label={copy.lastMeeting} value={formatDate(rel.lastMeeting).replaceAll("-", " / ") || "—"} colors={colors} />
          <AlignedRow icon={Sparkles} label={t("monthlyAnniversary")} value={monthlyDaysLabel} colors={colors} />
          <AlignedRow icon={Gift} label={t("partnerBirthday")} value={(rel.partnerBirthday || "—").replace("-", " / ")} colors={colors} />
          <AlignedRow icon={Gift} label={t("myBirthday")} value={(rel.myBirthday || "—").replace("-", " / ")} colors={colors} />
          <AlignedRow
            icon={Plane}
            label={t("nextMeetingLabel")}
            value={rel.nextMeeting.date ? `${localizeCityName(rel.nextMeeting.cityName, lang)} · ${formatDate(rel.nextMeeting.date).replaceAll("-", " / ")} ${rel.nextMeeting.date > now ? `· ${t("daysUntilSuffix", { d: meetingCd.days })}` : ""}` : "—"}
            colors={colors}
            last
          />
          <Pressable accessibilityRole="button" onPress={openDateEditor} style={{ alignItems: "center", padding: 15, borderRadius: 16, backgroundColor: colors.hairline, marginTop: 14 }}>
            <Text style={{ color: colors.primaryDeep, fontSize: 14, fontWeight: "700" }}>{t("editAllDates")}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Bell size={12} color={colors.inkSoft} />
            <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t("notifSection")}</Text>
          </View>
          <ToggleRow
            icon={Sparkles} label={t("notifForHabibi")} sub={t("notifForHabibiSub")}
            value={notifSettings.forYou}
            onChange={(value: boolean) => setNotifSettings((current: any) => ({ ...current, forYou: value }))}
            colors={colors}
          />
        </View>
      </ScrollView>

      <Modal visible={editingDates} transparent animationType="fade" onRequestClose={() => setEditingDates(false)}>
        <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEditingDates(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={{ fontWeight: "700", fontSize: 16, color: colors.ink }}>📅 {t("editAllDates")}</Text>
              <Pressable onPress={() => setEditingDates(false)}><X size={20} color={colors.inkSoft} /></Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={{ color: colors.inkSoft, lineHeight: 20, marginVertical: 12 }}>{polish.optional}</Text>
              <DateField label={copy.startDate} value={startDateText} onPress={() => openPicker("start")} colors={colors} />
              <DateField label={copy.lastMeetingDate} value={lastMeetingText} onPress={() => openPicker("last")} colors={colors} />
              <DateField label={copy.nextMeetingDate} value={nextMeetingText} onPress={() => openPicker("next")} colors={colors} />

              <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>{copy.nextMeetingPlace}</Text>
              <Pressable onPress={openCityPicker} style={[styles.citySelector, { backgroundColor: colors.inputBg, borderColor: colors.hairline }]}>
                <MapPin size={16} color={colors.primaryDeep} />
                <Text style={{ flex: 1, fontSize: 14, color: meetingCity ? colors.ink : colors.inkSoft, marginLeft: 8 }}>{meetingCity ? localizeCityName(meetingCity, lang) : copy.selectCity}</Text>
                <Edit3 size={14} color={colors.inkSoft} />
              </Pressable>

              <DateField label={copy.myBirthday} value={myBirthday} onPress={() => openPicker("mine")} colors={colors} />
              <DateField label={copy.partnerBirthday} value={partnerBirthday} onPress={() => openPicker("partner")} colors={colors} />

              <Text style={[styles.fieldLabel, { color: colors.inkSoft }]}>{copy.monthlyAnniversary}</Text>
              <View style={styles.chipsWrap}>
                {draftMonthlyDays.map((day) => (
                  <View key={day} style={[styles.dayChip, { backgroundColor: colors.primary + "22" }]}>
                    <Text style={{ color: colors.primaryDeep, fontWeight: "700", fontSize: 12 }}>{day}{t("monthlyDaySuffix")}</Text>
                    <Pressable onPress={() => setDraftMonthlyDays((days) => days.filter((value) => value !== day))} style={{ marginLeft: 4 }}>
                      <X size={11} color={colors.primaryDeep} />
                    </Pressable>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput value={newDay} onChangeText={(value) => setNewDay(value.replace(/\D/g, "").slice(0, 2))} placeholder="1-31" placeholderTextColor={colors.inkSoft} keyboardType="number-pad" style={[styles.dayInput, { backgroundColor: colors.inputBg, borderColor: colors.hairline, color: colors.ink }]} />
                <Pressable onPress={addMonthlyDay} style={[styles.smallBtn, { backgroundColor: colors.primary + "22" }]}>
                  <Text style={{ color: colors.primaryDeep, fontSize: 12, fontWeight: "700" }}>{t("addDate")}</Text>
                </Pressable>
              </View>
              {activePicker && (
                <View style={[styles.pickerBox, { borderColor: colors.hairline, backgroundColor: colors.inputBg }]}>
                  <DateTimePicker
                    value={pickerValue}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={changePickerDate}
                    locale={lang === "zh-Hant" ? "zh-TW" : lang === "zh-Hans" ? "zh-CN" : lang}
                    themeVariant="light"
                  />
                  {Platform.OS === "ios" && (
                    <Pressable onPress={() => setActivePicker(null)} style={[styles.pickerDone, { backgroundColor: colors.primary }]}>
                      <Text style={{ color: "#fff", fontWeight: "700" }}>{copy.done}</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </ScrollView>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <Pressable onPress={() => setEditingDates(false)} style={[styles.modalBtn, { backgroundColor: colors.hairline, flex: 1 }]}>
                <Text style={{ color: colors.ink, fontWeight: "600" }}>{t("cancelLabel")}</Text>
              </Pressable>
              <Pressable onPress={saveAllDates} style={[styles.modalBtn, { backgroundColor: colors.primary, flex: 2 }]}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>{t("saveLabel")}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <CityPicker
        visible={showCityPicker}
        onClose={() => {
          setShowCityPicker(false);
          setTimeout(() => setEditingDates(true), 250);
        }}
        onSelect={(city: City) => {
          setMeetingCity(city.name);
          setShowCityPicker(false);
          setTimeout(() => setEditingDates(true), 250);
        }}
        currentCity={undefined}
      />
    </View>
  );
}

function DateField({ label, value, onPress, colors }: any) {
  return <View><Text style={[styles2.fieldLabel, { color: colors.inkSoft }]}>{label}</Text><Pressable onPress={onPress} style={[styles2.input, { backgroundColor: colors.inputBg, borderColor: colors.hairline }]}><Text style={{ color: colors.ink, fontSize: 14 }}>{value || "—"}</Text><CalendarDays size={16} color={colors.primaryDeep} /></Pressable></View>;
}

function AlignedRow({ icon: Icon, label, value, colors, last }: any) {
  return <View style={styles2.row}>
    <View style={{ width: 40, alignSelf: "stretch", alignItems: "center", marginRight: 13 }}>
      {!last && <View style={{ position: "absolute", top: 32, bottom: -16, width: 2, backgroundColor: colors.hairline }} />}
      <View style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: colors.chipBg, alignItems: "center", justifyContent: "center" }}><Icon size={17} color={colors.primaryDeep} /></View>
    </View>
    <View style={{ flex: 1, paddingBottom: 10 }}><Text style={{ fontSize: 12, color: colors.inkSoft, marginBottom: 5 }}>{label}</Text><Text style={{ fontSize: 15, color: colors.ink, fontWeight: "700", lineHeight: 22 }}>{value || "—"}</Text></View>
  </View>;
}

function ToggleRow({ icon: Icon, label, sub, value, onChange, colors }: any) {
  return <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}><View style={{ width: 42, height: 42, borderRadius: 15, backgroundColor: colors.chipBg, alignItems: "center", justifyContent: "center" }}><Icon size={20} color={colors.primaryDeep} /></View><View style={{ flex: 1 }}><Text style={{ fontSize: 15, fontWeight: "700", color: colors.ink }}>{label}</Text>{sub && <Text style={{ fontSize: 12, lineHeight: 18, color: colors.inkSoft, marginTop: 4 }}>{sub}</Text>}</View><Switch accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{ false: colors.hairline, true: colors.primary }} thumbColor="#FFFFFF" /></View>;
}

const styles2 = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", paddingTop: 12 },
  fieldLabel: { fontSize: 12, marginTop: 12, marginBottom: 4 },
  input: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});

function makeStyles(colors: any) {
  return StyleSheet.create({
    body: { padding: 20, paddingBottom: 48, gap: 20 },
    headerTitle: { fontWeight: "800", fontSize: 34, letterSpacing: -1 },
    card: { backgroundColor: colors.cardBg, borderRadius: 28, padding: 22 },
    coupleName: { fontWeight: "700", fontSize: 16, marginTop: 10 },
    eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 },
    cityChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
    modalBackdrop: { flex: 1, backgroundColor: "rgba(20,14,20,0.5)", alignItems: "center", justifyContent: "center", padding: 18 },
    modalCard: { width: "100%", maxHeight: "88%", borderRadius: 28, padding: 18 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    fieldLabel: { fontSize: 12, marginTop: 12, marginBottom: 4 },
    citySelector: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
    chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
    dayChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
    dayInput: { width: 80, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12 },
    smallBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, justifyContent: "center" },
    modalBtn: { paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    pickerBox: { marginTop: 12, borderRadius: 14, borderWidth: 1, padding: 8 },
    pickerDone: { alignSelf: "flex-end", paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10, marginTop: 4 },
  });
}
