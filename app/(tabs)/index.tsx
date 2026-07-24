import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Cloud,
  CloudFog,
  CloudRain, CloudSnow,
  Heart,
  MapPin,
  Plane,
  Settings,
  Sparkles, Sun,
  Wind, X
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal, Platform,
  Pressable, ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import AvatarPicker from "../../components/AvatarPicker";
import { LOCALE_MAP, useApp } from "../../context/AppContext";
import { ME, REL, diffParts, getNextMonthlyOccurrence, getUtcOffsetMinutes, getZonedParts, haversineKm } from "../../lib/data";

/* ---------------- weather helper ---------------- */

const WEATHER_KEY = (code: number) => {
  if (code === 0) return { Icon: Sun, key: "weatherSunny" };
  if ([1, 2, 3].includes(code)) return { Icon: Cloud, key: "weatherCloudy" };
  if ([45, 48].includes(code)) return { Icon: CloudFog, key: "weatherFoggy" };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { Icon: CloudRain, key: "weatherRainy" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { Icon: CloudSnow, key: "weatherSnowy" };
  return { Icon: Wind, key: "weatherCloudy" };
};

/* ================= Screen ================= */

export default function HomeScreen() {
  const { colors, t, lang, partner, monthlyDays, partnerAvatarUri, setPartnerAvatarUri, habibiEmojis, setHabibiEmojis } = useApp();
  const router = useRouter();
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState<{ me: any; partner: any }>({ me: null, partner: null });
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [emojiDraft, setEmojiDraft] = useState("");
  const [sentEmoji, setSentEmoji] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load(city: { lat: number; lon: number }) {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`);
        const data = await res.json();
        return { temp: Math.round(data.current_weather.temperature), code: data.current_weather.weathercode };
      } catch (e) {
        return null;
      }
    }
    (async () => {
      const [me, partnerW] = await Promise.all([load(ME), load(partner)]);
      if (!cancelled) setWeather({ me, partner: partnerW });
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locale = LOCALE_MAP[lang] || "en-US";
  const distanceKm = useMemo(() => haversineKm(ME.lat, ME.lon, partner.lat, partner.lon), [partner]);
  const meParts = getZonedParts(now, ME.tz, locale);
  const partnerParts = getZonedParts(now, partner.tz, locale);
  const tzDiffHours = useMemo(() => {
    const offsetMe = getUtcOffsetMinutes(ME.tz, now);
    const offsetPartner = getUtcOffsetMinutes(partner.tz, now);
    return Math.round((offsetMe - offsetPartner) / 60);
  }, [now, partner]);

  const togetherDays = diffParts(now, REL.startDate).days;
  const meetingCd = diffParts(REL.nextMeeting.date, now);
  const monthlyInfo = getNextMonthlyOccurrence(monthlyDays, now);
  const totalWaitDays = Math.max(1, diffParts(REL.nextMeeting.date, REL.lastMeeting).days);
  const elapsedWaitDays = Math.max(0, diffParts(now, REL.lastMeeting).days);
  const progressPct = Math.min(100, Math.round((elapsedWaitDays / totalWaitDays) * 100));

  let monthlyDisplay = t("monthlyNotSet");
  if (monthlyInfo?.isToday) monthlyDisplay = t("monthlyToday");
  else if (monthlyInfo) monthlyDisplay = `${monthlyInfo.date.getMonth() + 1}/${monthlyInfo.date.getDate()}（${t("daysUntilSuffix", { d: monthlyInfo.diffDays })}）`;

  const sendHabibi = useCallback((emoji: string) => {
    setSentEmoji(emoji);
    fadeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1600),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setSentEmoji(null));
  }, [fadeAnim]);

  const meWeather = weather.me ? WEATHER_KEY(weather.me.code) : null;
  const partnerWeather = weather.partner ? WEATHER_KEY(weather.partner.code) : null;

  const styles = makeStyles(colors);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={colors.screenBg as any} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* top bar */}
        <View style={styles.topBar}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <AvatarPicker uri={partnerAvatarUri} onChange={setPartnerAvatarUri} initials={partner.avatar} size={40} bgColor={colors.lavenderDeep} />
            <View>
              <Text style={[styles.name, { color: colors.ink }]}>{partner.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <View style={styles.onlineDot} />
                <Text style={[styles.subtle, { color: colors.inkSoft }]}>{t("online")}</Text>
              </View>
            </View>
          </View>
          <Pressable onPress={() => router.push("/settings")} style={[styles.iconBtn, { backgroundColor: colors.chipBg }]}>
            <Settings size={17} color={colors.ink} />
          </Pressable>
        </View>

        {/* dual timezone card */}
        <View style={styles.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <TzColumn label="我" cityName={ME.cityName} parts={meParts} weatherInfo={meWeather} weatherData={weather.me} t={t} colors={colors} />
            <View style={{ alignItems: "center", justifyContent: "center", paddingHorizontal: 6 }}>
              <View style={[styles.tzDivider, { backgroundColor: colors.hairline }]} />
              <View style={[styles.tzTag, { backgroundColor: colors.primary + "22" }]}>
                <Text style={{ color: colors.primaryDeep, fontWeight: "700", fontSize: 11 }}>
                  {t("tzDiff")} {Math.abs(tzDiffHours)} {t("hoursSuffix")}
                </Text>
              </View>
              <View style={[styles.tzDivider, { backgroundColor: colors.hairline }]} />
            </View>
            <TzColumn label={partner.name} cityName={partner.cityName} parts={partnerParts} weatherInfo={partnerWeather} weatherData={weather.partner} t={t} colors={colors} align="right" />
          </View>
          <View style={[styles.distanceRow, { borderTopColor: colors.hairline }]}>
            <MapPin size={13} color={colors.inkSoft} />
            <Text style={{ fontSize: 12, color: colors.inkSoft, marginLeft: 6 }}>
              {t("distanceApart")} <Text style={{ fontWeight: "700", color: colors.ink }}>{distanceKm.toLocaleString()}</Text> {t("kmApartSuffix")}
            </Text>
          </View>
        </View>

        {/* For Habibi */}
        <View style={styles.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>For Habibi</Text>
            <Text style={{ fontSize: 9.5, color: colors.inkSoft }}>{t("longPressHint")}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {habibiEmojis.map((emoji, i) => (
              <EmojiButton key={i} emoji={emoji} colors={colors} onTap={() => sendHabibi(emoji)} onLongPress={() => { setEmojiDraft(emoji); setPickerIndex(i); }} />
            ))}
          </View>
        </View>

        {/* countdown */}
        <View style={styles.card}>
          <Text style={[styles.eyebrow, { color: colors.inkSoft }]}>{t("countdownTitle")}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 8 }}>
            <HeartbeatRing pct={progressPct} colors={colors} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 26, fontWeight: "700", color: colors.ink }}>
                {meetingCd.days}d {meetingCd.hours}h
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                <Plane size={12} color={colors.inkSoft} />
                <Text style={{ fontSize: 12, color: colors.inkSoft }}>
                  {REL.nextMeeting.cityName} · {REL.nextMeeting.date.getMonth() + 1}/{REL.nextMeeting.date.getDate()}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
            <MiniStat label={t("monthlyAnniversary")} value={monthlyDisplay} icon={Sparkles} colors={colors} />
            <MiniStat label={t("togetherLabel")} value={`${togetherDays.toLocaleString()} ${t("daysWord")}`} icon={Heart} colors={colors} />
          </View>
        </View>
      </ScrollView>

      {/* sent overlay */}
      {sentEmoji && (
        <Animated.View pointerEvents="none" style={[styles.overlay, { opacity: fadeAnim, backgroundColor: colors.primary + "ee" }]}>
          <Text style={{ fontSize: 72 }}>{sentEmoji}</Text>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16, marginTop: 14 }}>{t("sentEmojiMsg", { emoji: sentEmoji })}</Text>
        </Animated.View>
      )}

      {/* emoji picker — uses the phone's native emoji keyboard, not a fixed list */}
      <Modal visible={pickerIndex !== null} transparent animationType="fade" onRequestClose={() => setPickerIndex(null)}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPickerIndex(null)} />
          <Pressable style={[styles.pickerCard, { backgroundColor: colors.cardBg }]} onPress={(e) => e.stopPropagation()}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Text style={{ fontWeight: "700", fontSize: 14, color: colors.ink }}>{t("choosEmojiTitle")}</Text>
              <Pressable onPress={() => setPickerIndex(null)} style={[styles.iconBtn, { width: 26, height: 26, backgroundColor: colors.hairline }]}>
                <X size={13} color={colors.ink} />
              </Pressable>
            </View>
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 48 }}>{emojiDraft || "?"}</Text>
            </View>
            <TextInput
              value={emojiDraft}
              onChangeText={(v) => setEmojiDraft(v.slice(-4))}
              placeholder="😀"
              autoFocus
              style={[styles.emojiInput, { backgroundColor: colors.inputBg, color: colors.ink, borderColor: colors.hairline }]}
            />
            <Pressable
              onPress={() => {
                if (pickerIndex !== null && emojiDraft.trim()) {
                  setHabibiEmojis((arr) => arr.map((old, i) => (i === pickerIndex ? emojiDraft.trim() : old)));
                }
                setPickerIndex(null);
              }}
              style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{t("doneLabel")}</Text>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

/* ---------------- subcomponents ---------------- */

function TzColumn({ label, cityName, parts, weatherInfo, weatherData, t, colors, align }: any) {
  return (
    <View style={{ flex: 1, alignItems: align === "right" ? "flex-end" : "flex-start" }}>
      <Text style={{ fontSize: 11, color: colors.inkSoft, marginBottom: 2 }}>{label} · {cityName}</Text>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.ink }}>{parts.timeStr}</Text>
      <Text style={{ fontSize: 10.5, color: colors.inkSoft, marginTop: 1 }}>{t(parts.periodKey)}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 3 }}>
        {weatherInfo && <weatherInfo.Icon size={12} color={colors.inkSoft} />}
        <Text style={{ fontSize: 10.5, color: colors.inkSoft }}>
          {weatherData ? `${weatherData.temp}°C` : "..."} {weatherInfo ? `· ${t(weatherInfo.key)}` : ""}
        </Text>
      </View>
    </View>
  );
}

function EmojiButton({ emoji, colors, onTap, onLongPress }: any) {
  return (
    <Pressable
      onPress={onTap}
      onLongPress={onLongPress}
      delayLongPress={500}
      style={({ pressed }) => [
        {
          flex: 1, paddingVertical: 16, borderRadius: 18, alignItems: "center", justifyContent: "center",
          backgroundColor: colors.primary + "16", opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={{ fontSize: 26 }}>{emoji}</Text>
    </Pressable>
  );
}

function HeartbeatRing({ pct, colors }: any) {
  const r = 30, c = 2 * Math.PI * r;
  return (
    <View style={{ width: 78, height: 78, alignItems: "center", justifyContent: "center" }}>
      <Svg width={78} height={78} viewBox="0 0 78 78">
        <Circle cx={39} cy={39} r={r} fill="none" stroke={colors.hairline} strokeWidth={6} />
        <Circle
          cx={39} cy={39} r={r} fill="none" stroke={colors.primary} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={`${c} ${c}`} strokeDashoffset={c - (c * pct) / 100}
          rotation={-90} origin="39,39"
        />
      </Svg>
      <View style={{ position: "absolute" }}>
        <Heart size={20} color={colors.primary} fill={colors.primary} />
      </View>
    </View>
  );
}

function MiniStat({ label, value, icon: Icon, colors }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.chipBg, borderRadius: 12, padding: 10, flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Icon size={14} color={colors.primaryDeep} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 9.5, color: colors.inkSoft }}>{label}</Text>
        <Text style={{ fontSize: 11.5, fontWeight: "700", color: colors.ink }}>{value}</Text>
      </View>
    </View>
  );
}

/* ---------------- styles ---------------- */

function makeStyles(colors: any) {
  return StyleSheet.create({
    body: { padding: 16, paddingTop: Platform.OS === "ios" ? 60 : 32, paddingBottom: 40, gap: 12 },
    topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    name: { fontWeight: "700", fontSize: 15 },
    subtle: { fontSize: 11 },
    onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4CD48A" },
    iconBtn: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    card: { backgroundColor: colors.cardBg, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.cardBorder },
    tzDivider: { width: 1, flex: 1 },
    tzTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, marginVertical: 6 },
    distanceRow: { flexDirection: "row", alignItems: "center", marginTop: 12, paddingTop: 10, borderTopWidth: 1 },
    eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
    overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
    modalBackdrop: { flex: 1, backgroundColor: "rgba(20,14,20,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
    pickerCard: { width: "100%", borderRadius: 22, padding: 18 },
    emojiOption: { width: "17%", aspectRatio: 1, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    emojiInput: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 20, textAlign: "center", marginBottom: 14 },
    confirmBtn: { paddingVertical: 12, borderRadius: 14, alignItems: "center" },
  });
}
