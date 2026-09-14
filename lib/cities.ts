// lib/cities.ts
export interface City {
  name: string;
  country: string;
  tz: string;
  lat: number;
  lon: number;
  emoji?: string;
}

const CITY_ENGLISH: Record<string, string> = {
  台北: "Taipei", 高雄: "Kaohsiung", 台中: "Taichung", 香港: "Hong Kong",
  上海: "Shanghai", 北京: "Beijing", 東京: "Tokyo", 大阪: "Osaka", 首爾: "Seoul",
  新加坡: "Singapore", 曼谷: "Bangkok", 吉隆坡: "Kuala Lumpur", 雅加達: "Jakarta",
  馬尼拉: "Manila", 胡志明市: "Ho Chi Minh City", 峴港: "Da Nang", 河內: "Hanoi",
  蘇黎世: "Zurich", 倫敦: "London", 巴黎: "Paris", 柏林: "Berlin",
  羅馬: "Rome", 馬德里: "Madrid", 阿姆斯特丹: "Amsterdam", 維也納: "Vienna",
  紐約: "New York", 洛杉磯: "Los Angeles", 舊金山: "San Francisco", 芝加哥: "Chicago",
  多倫多: "Toronto", 溫哥華: "Vancouver", 墨西哥城: "Mexico City", 雪梨: "Sydney",
  墨爾本: "Melbourne", 奧克蘭: "Auckland", 杜拜: "Dubai", 特拉維夫: "Tel Aviv",
};

const COUNTRY_ENGLISH: Record<string, string> = {
  台灣: "Taiwan", 香港: "Hong Kong", 中國: "China", 日本: "Japan", 韓國: "South Korea",
  新加坡: "Singapore", 泰國: "Thailand", 馬來西亞: "Malaysia", 印尼: "Indonesia",
  菲律賓: "Philippines", 瑞士: "Switzerland", 英國: "United Kingdom", 法國: "France",
  越南: "Vietnam",
  德國: "Germany", 義大利: "Italy", 西班牙: "Spain", 荷蘭: "Netherlands",
  奧地利: "Austria", 美國: "United States", 加拿大: "Canada", 墨西哥: "Mexico",
  澳洲: "Australia", 紐西蘭: "New Zealand", 阿聯酋: "United Arab Emirates", 以色列: "Israel",
};

export function localizeCityName(name: string, lang: string): string {
  return lang === "zh-Hant" ? name : CITY_ENGLISH[name] ?? name;
}

export function localizeCountryName(name: string, lang: string): string {
  return lang === "zh-Hant" ? name : COUNTRY_ENGLISH[name] ?? name;
}

export const CITIES: City[] = [
  // 亞洲
  { name: "台北", country: "台灣", tz: "Asia/Taipei", lat: 25.033, lon: 121.5654, emoji: "🏯" },
  { name: "高雄", country: "台灣", tz: "Asia/Taipei", lat: 22.627, lon: 120.301, emoji: "🌊" },
  { name: "台中", country: "台灣", tz: "Asia/Taipei", lat: 24.147, lon: 120.673, emoji: "🌳" },
  { name: "香港", country: "香港", tz: "Asia/Hong_Kong", lat: 22.319, lon: 114.169, emoji: "🏙️" },
  { name: "上海", country: "中國", tz: "Asia/Shanghai", lat: 31.230, lon: 121.473, emoji: "🌆" },
  { name: "北京", country: "中國", tz: "Asia/Shanghai", lat: 39.904, lon: 116.407, emoji: "🏛️" },
  { name: "東京", country: "日本", tz: "Asia/Tokyo", lat: 35.676, lon: 139.650, emoji: "🗼" },
  { name: "大阪", country: "日本", tz: "Asia/Tokyo", lat: 34.693, lon: 135.502, emoji: "🍜" },
  { name: "首爾", country: "韓國", tz: "Asia/Seoul", lat: 37.566, lon: 126.978, emoji: "🇰🇷" },
  { name: "新加坡", country: "新加坡", tz: "Asia/Singapore", lat: 1.352, lon: 103.820, emoji: "🦁" },
  { name: "曼谷", country: "泰國", tz: "Asia/Bangkok", lat: 13.756, lon: 100.502, emoji: "🙏" },
  { name: "吉隆坡", country: "馬來西亞", tz: "Asia/Kuala_Lumpur", lat: 3.139, lon: 101.687, emoji: "🌴" },
  { name: "雅加達", country: "印尼", tz: "Asia/Jakarta", lat: -6.209, lon: 106.845, emoji: "🌋" },
  { name: "馬尼拉", country: "菲律賓", tz: "Asia/Manila", lat: 14.599, lon: 120.984, emoji: "🏖️" },
  { name: "胡志明市", country: "越南", tz: "Asia/Ho_Chi_Minh", lat: 10.8231, lon: 106.6297, emoji: "🇻🇳" },
  { name: "峴港", country: "越南", tz: "Asia/Ho_Chi_Minh", lat: 16.0544, lon: 108.2022, emoji: "🇻🇳" },
  { name: "河內", country: "越南", tz: "Asia/Ho_Chi_Minh", lat: 21.0278, lon: 105.8342, emoji: "🇻🇳" },
  
  // 歐洲
  { name: "蘇黎世", country: "瑞士", tz: "Europe/Zurich", lat: 47.377, lon: 8.542, emoji: "⛰️" },
  { name: "倫敦", country: "英國", tz: "Europe/London", lat: 51.507, lon: -0.128, emoji: "🇬🇧" },
  { name: "巴黎", country: "法國", tz: "Europe/Paris", lat: 48.857, lon: 2.352, emoji: "🗼" },
  { name: "柏林", country: "德國", tz: "Europe/Berlin", lat: 52.520, lon: 13.405, emoji: "🇩🇪" },
  { name: "羅馬", country: "義大利", tz: "Europe/Rome", lat: 41.902, lon: 12.496, emoji: "🏛️" },
  { name: "馬德里", country: "西班牙", tz: "Europe/Madrid", lat: 40.417, lon: -3.703, emoji: "🇪🇸" },
  { name: "阿姆斯特丹", country: "荷蘭", tz: "Europe/Amsterdam", lat: 52.368, lon: 4.904, emoji: "🌷" },
  { name: "維也納", country: "奧地利", tz: "Europe/Vienna", lat: 48.208, lon: 16.373, emoji: "🎵" },
  
  // 美洲
  { name: "紐約", country: "美國", tz: "America/New_York", lat: 40.712, lon: -74.006, emoji: "🗽" },
  { name: "洛杉磯", country: "美國", tz: "America/Los_Angeles", lat: 34.052, lon: -118.244, emoji: "🌴" },
  { name: "舊金山", country: "美國", tz: "America/Los_Angeles", lat: 37.774, lon: -122.419, emoji: "🌉" },
  { name: "芝加哥", country: "美國", tz: "America/Chicago", lat: 41.878, lon: -87.630, emoji: "🌃" },
  { name: "多倫多", country: "加拿大", tz: "America/Toronto", lat: 43.653, lon: -79.383, emoji: "🇨🇦" },
  { name: "溫哥華", country: "加拿大", tz: "America/Vancouver", lat: 49.283, lon: -123.121, emoji: "🏔️" },
  { name: "墨西哥城", country: "墨西哥", tz: "America/Mexico_City", lat: 19.433, lon: -99.133, emoji: "🌮" },
  
  // 大洋洲
  { name: "雪梨", country: "澳洲", tz: "Australia/Sydney", lat: -33.869, lon: 151.209, emoji: "🦘" },
  { name: "墨爾本", country: "澳洲", tz: "Australia/Melbourne", lat: -37.814, lon: 144.963, emoji: "🎭" },
  { name: "奧克蘭", country: "紐西蘭", tz: "Pacific/Auckland", lat: -36.848, lon: 174.763, emoji: "🌿" },
  
  // 中東
  { name: "杜拜", country: "阿聯酋", tz: "Asia/Dubai", lat: 25.205, lon: 55.271, emoji: "🕌" },
  { name: "特拉維夫", country: "以色列", tz: "Asia/Jerusalem", lat: 32.085, lon: 34.782, emoji: "☀️" },
];

export function getCityByTz(tz: string): City | undefined {
  return CITIES.find(c => c.tz === tz);
}

export function searchCities(query: string): City[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return CITIES.filter(c => 
    c.name.toLowerCase().includes(q) ||
    c.country.toLowerCase().includes(q) ||
    (CITY_ENGLISH[c.name] ?? "").toLowerCase().includes(q) ||
    (COUNTRY_ENGLISH[c.country] ?? "").toLowerCase().includes(q)
  ).slice(0, 15);
}

type GeocodingResult = {
  id?: number;
  name?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  country?: string;
  country_code?: string;
  admin1?: string;
};

/** Search the global GeoNames location database through Open-Meteo. */
export async function searchGlobalCities(query: string, lang: string): Promise<City[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return searchCities(trimmed);

  const language = lang === "zh-Hant" ? "zh" : lang.startsWith("zh") ? "zh" : "en";
  const url =
    "https://geocoding-api.open-meteo.com/v1/search" +
    `?name=${encodeURIComponent(trimmed)}&count=30&language=${language}&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`City search failed (${response.status})`);
    const payload = await response.json();
    const rows: GeocodingResult[] = Array.isArray(payload?.results) ? payload.results : [];

    const remote = rows
      .filter((row) =>
        typeof row.name === "string" &&
        typeof row.latitude === "number" &&
        typeof row.longitude === "number" &&
        typeof row.timezone === "string"
      )
      .map((row) => ({
        name: row.name!,
        country: [row.admin1, row.country].filter(Boolean).join(", ") || row.country_code || "",
        tz: row.timezone!,
        lat: row.latitude!,
        lon: row.longitude!,
        emoji: "📍",
      }));

    const local = searchCities(trimmed);
    const combined = [...remote, ...local];
    return combined.filter(
      (city, index, all) =>
        all.findIndex(
          (candidate) =>
            candidate.name.toLowerCase() === city.name.toLowerCase() &&
            Math.abs(candidate.lat - city.lat) < 0.001 &&
            Math.abs(candidate.lon - city.lon) < 0.001
        ) === index
    ).slice(0, 30);
  } catch (error) {
    console.warn("Global city search unavailable; using offline cities:", error);
    return searchCities(trimmed);
  }
}
