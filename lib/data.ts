/* 共用的假資料與計算邏輯 — Home / Chat / Us 都會用到 */

export const ME = { name: "小明", cityName: "台北", tz: "Asia/Taipei", lat: 25.033, lon: 121.5654, avatar: "明" };
export const PARTNER_BASE = { cityName: "蘇黎世", tz: "Europe/Zurich", lat: 47.3769, lon: 8.5417, avatar: "美" };
export const PARTNER_DEFAULT_NAME = "小美";

export const REL = {
  startDate: new Date("2023-02-14T00:00:00"),
  lastMeeting: new Date("2026-06-15T00:00:00"),
  nextMeeting: { cityName: "大阪", date: new Date("2026-08-25T00:00:00") },
  myBirthday: "05-10",
  partnerBirthday: "08-20",
};

export const DEFAULT_MONTHLY_DAYS = [1, 14, 15];

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function getUtcOffsetMinutes(timeZone: string, date: Date) {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone, hour12: false,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    const parts = dtf.formatToParts(date).reduce((acc: any, p) => ((acc[p.type] = p.value), acc), {});
    const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour === 24 ? 0 : +parts.hour, +parts.minute, +parts.second);
    return (asUTC - date.getTime()) / 60000;
  } catch (e) {
    return 0;
  }
}

export function getZonedParts(date: Date, timeZone: string, locale: string) {
  try {
    const fmt = new Intl.DateTimeFormat(locale, { timeZone, hour: "2-digit", minute: "2-digit", hour12: false });
    const parts = fmt.formatToParts(date).reduce((acc: any, p) => ((acc[p.type] = p.value), acc), {});
    const hour = parseInt(new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", hour12: false }).format(date), 10) % 24;
    let periodKey = "nightPeriod";
    if (hour >= 5 && hour < 12) periodKey = "morningPeriod";
    else if (hour >= 12 && hour < 18) periodKey = "afternoonPeriod";
    else if (hour >= 18 && hour < 23) periodKey = "eveningPeriod";
    return { hour, timeStr: `${parts.hour}:${parts.minute}`, periodKey };
  } catch (e) {
    return { hour: date.getHours(), timeStr: date.toTimeString().slice(0, 5), periodKey: "morningPeriod" };
  }
}

export function diffParts(target: Date, now: Date) {
  const ms = Math.abs(target.getTime() - now.getTime());
  return { days: Math.floor(ms / 86400000), hours: Math.floor((ms % 86400000) / 3600000) };
}

export function getNextMonthlyOccurrence(monthlyDays: number[], now: Date) {
  if (!monthlyDays || monthlyDays.length === 0) return null;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let best: Date | null = null;
  for (let offset = 0; offset <= 2; offset++) {
    const y = now.getFullYear();
    const m = now.getMonth() + offset;
    const expectedMonth = ((m % 12) + 12) % 12;
    for (const d of monthlyDays) {
      const candidate = new Date(y, m, d);
      if (candidate.getMonth() !== expectedMonth) continue;
      if (candidate >= startOfToday && (!best || candidate < best)) best = candidate;
    }
  }
  if (!best) return null;
  const diffDays = Math.round((best.getTime() - startOfToday.getTime()) / 86400000);
  return { date: best, diffDays, isToday: diffDays === 0 };
}
