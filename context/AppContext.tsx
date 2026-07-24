import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_MONTHLY_DAYS, PARTNER_BASE, PARTNER_DEFAULT_NAME } from "../lib/data";
import { loadJSON, saveJSON } from "../lib/storage";

export const LANGUAGES = [
  { code: "zh-Hant", native: "繁體中文" },
  { code: "en", native: "English" },
  { code: "zh-Hans", native: "简体中文" },
  { code: "ja", native: "日本語" },
  { code: "ko", native: "한국어" },
  { code: "es", native: "Español" },
  { code: "fr", native: "Français" },
  { code: "de", native: "Deutsch" },
  { code: "th", native: "ไทย" },
];
export const LOCALE_MAP: Record<string, string> = {
  "zh-Hant": "zh-TW", en: "en-US", "zh-Hans": "zh-CN", ja: "ja-JP", ko: "ko-KR",
  es: "es-ES", fr: "fr-FR", de: "de-DE", th: "th-TH",
};
const LKEYS = LANGUAGES.map((l) => l.code);
function mk(...vals: string[]) {
  return Object.fromEntries(LKEYS.map((l, i) => [l, vals[i]]));
}

/* ---------------- Theme ---------------- */

export const THEMES = {
  feminine: {
    primary: "#FF8A65", primaryDeep: "#E67A55", lavender: "#CE93D8", lavenderDeep: "#B565C7", coral: "#FF6B6B",
    ink: "#3A2E39", inkSoft: "#7A6B76",
    cardBg: "rgba(255,255,255,0.75)", cardBorder: "rgba(255,255,255,0.9)",
    screenBg: ["#FFF3EA", "#FBEFF7", "#F6E9FA"] as const,
    navBg: "rgba(255,255,255,0.92)", hairline: "rgba(0,0,0,0.08)",
    chipBg: "rgba(255,255,255,0.6)", inputBg: "rgba(255,255,255,0.85)", bubblePartnerBg: "#FFFFFF",
  },
  masculine: {
    primary: "#3B82D6", primaryDeep: "#2E6BB0", lavender: "#5A9BD5", lavenderDeep: "#1A365D", coral: "#FF6B6B",
    ink: "#1A365D", inkSoft: "#5A7A9A",
    cardBg: "#F5F8FC", cardBorder: "#D6E4F0",
    screenBg: ["#F5F8FC", "#EDF3FA", "#E8EEF6"] as const,
    navBg: "rgba(245,248,252,0.95)", hairline: "rgba(26,54,93,0.10)",
    chipBg: "rgba(26,54,93,0.05)", inputBg: "rgba(26,54,93,0.06)", bubblePartnerBg: "#E8F0FE",
  },
};
export type Gender = keyof typeof THEMES;

/* ---------------- Translations (subset used so far; expand as we port more screens) ---------------- */

export const T: Record<string, Record<string, string>> = {
  tabHome: mk("首頁", "Home", "首页", "ホーム", "홈", "Inicio", "Accueil", "Start", "หน้าแรก"),
  tabChat: mk("聊天", "Chat", "聊天", "チャット", "채팅", "Chat", "Chat", "Chat", "แชท"),
  tabPhoto: mk("即時照片", "Live Photo", "即时照片", "ライブ写真", "라이브 사진", "Foto en Vivo", "Photo Live", "Live-Foto", "ภาพสด"),
  tabUs: mk("我們", "Us", "我们", "私たち", "우리", "Nosotros", "Nous", "Wir", "เรา"),
  online: mk("在線上", "Online", "在线", "オンライン", "온라인", "En línea", "En ligne", "Online", "ออนไลน์"),
  distanceApart: mk("你們相隔", "You are", "你们相隔", "お互いは", "서로", "Están a", "Vous êtes à", "Ihr seid", "คุณอยู่ห่างกัน"),
  kmApartSuffix: mk("公里", "km apart", "公里", "km 離れています", "km 떨어져 있습니다", "km de distancia", "km l'un de l'autre", "km voneinander entfernt", "km"),
  tzDiff: mk("時差", "Time diff", "时差", "時差", "시차", "Diferencia horaria", "Décalage horaire", "Zeitunterschied", "เวลาต่างกัน"),
  hoursSuffix: mk("小時", "hrs", "小时", "時間", "시간", "horas", "heures", "Stunden", "ชั่วโมง"),
  morningPeriod: mk("早上", "Morning", "早上", "午前", "오전", "Mañana", "Matin", "Vormittag", "เช้า"),
  afternoonPeriod: mk("下午", "Afternoon", "下午", "午後", "오후", "Tarde", "Après-midi", "Nachmittag", "บ่าย"),
  eveningPeriod: mk("晚上", "Evening", "晚上", "夜", "밤", "Noche", "Soir", "Abend", "เย็น"),
  nightPeriod: mk("凌晨", "Late Night", "凌晨", "夜中", "새벽", "Madrugada", "Nuit", "Nacht", "ดึก"),
  weatherSunny: mk("晴朗", "Sunny", "晴朗", "晴れ", "맑음", "Soleado", "Ensoleillé", "Sonnig", "แดดออก"),
  weatherCloudy: mk("多雲", "Cloudy", "多云", "曇り", "흐림", "Nublado", "Nuageux", "Bewölkt", "มีเมฆ"),
  weatherRainy: mk("下雨", "Rainy", "下雨", "雨", "비", "Lluvioso", "Pluvieux", "Regnerisch", "ฝนตก"),
  weatherFoggy: mk("有霧", "Foggy", "有雾", "霧", "안개", "Neblina", "Brumeux", "Neblig", "มีหมอก"),
  weatherSnowy: mk("下雪", "Snowy", "下雪", "雪", "눈", "Nevado", "Neigeux", "Schneereich", "หิมะตก"),
  countdownTitle: mk("見面倒數", "Next Meeting", "见面倒数", "待ち合わせまで", "다음 만남까지", "Cuenta regresiva", "Compte à rebours", "Countdown", "นับถอยหลัง"),
  monthlyAnniversary: mk("每月紀念日", "Monthly Anniversary", "每月纪念日", "毎月記念日", "매월 기념일", "Aniversario Mensual", "Anniversaire Mensuel", "Monatlicher Jahrestag", "วันครบรอบประจำเดือน"),
  togetherLabel: mk("在一起", "Together", "在一起", "一緒に", "함께한 날", "Juntos", "Ensemble", "Zusammen", "อยู่ด้วยกัน"),
  daysWord: mk("天", "days", "天", "日", "일", "días", "jours", "Tage", "วัน"),
  monthlyNotSet: mk("尚未設定", "Not set", "尚未设置", "未設定", "설정되지 않음", "No configurado", "Non défini", "Nicht festgelegt", "ยังไม่ได้ตั้งค่า"),
  monthlyToday: mk("今天！🎉", "Today! 🎉", "今天！🎉", "今日！🎉", "오늘! 🎉", "¡Hoy! 🎉", "Aujourd'hui ! 🎉", "Heute! 🎉", "วันนี้! 🎉"),
  daysUntilSuffix: mk("還有 {d} 天", "{d} days left", "还有 {d} 天", "あと {d} 日", "{d} 일 남음", "{d} días restantes", "{d} jours restants", "Noch {d} Tage", "เหลืออีก {d} วัน"),
  sentEmojiMsg: mk("你發送了一個 {emoji} ！", "You sent a {emoji} !", "你发送了一个 {emoji} ！", "{emoji} を送信しました！", "{emoji} 을 보냈어요!", "¡Enviaste un {emoji} !", "Tu as envoyé un {emoji} !", "Du hast {emoji} gesendet!", "คุณส่ง {emoji} แล้ว!"),
  longPressHint: mk("長按可更換表情", "Hold to change", "长按可更换表情", "長押しで変更", "길게 눌러 변경", "Mantén para cambiar", "Maintenir pour changer", "Halten zum Ändern", "กดค้างเพื่อเปลี่ยน"),
  choosEmojiTitle: mk("選擇新的表情符號", "Choose a new emoji", "选择新的表情符号", "新しい絵文字を選択", "새 이모지 선택", "Elige un nuevo emoji", "Choisis un nouvel emoji", "Neues Emoji wählen", "เลือกอิโมจิใหม่"),
  settingsTitle: mk("設定", "Settings", "设置", "設定", "설정", "Configuración", "Paramètres", "Einstellungen", "การตั้งค่า"),
  languageLabel: mk("語言", "Language", "语言", "言語", "언어", "Idioma", "Langue", "Sprache", "ภาษา"),
  editProfile: mk("編輯個人資料", "Edit Profile", "编辑个人资料", "プロフィールを編集", "프로필 수정", "Editar Perfil", "Modifier le Profil", "Profil Bearbeiten", "แก้ไขโปรไฟล์"),
  femaleLabel: mk("女生", "Female", "女生", "女性", "여성", "Mujer", "Femme", "Weiblich", "หญิง"),
  maleLabel: mk("男生", "Male", "男生", "男性", "남성", "Hombre", "Homme", "Männlich", "ชาย"),
  notifSection: mk("通知設定", "Notifications", "通知设置", "通知設定", "알림 설정", "Notificaciones", "Notifications", "Benachrichtigungen", "การแจ้งเตือน"),
  notifForHabibi: mk("For Habibi 互動提醒", "For Habibi Alerts", "For Habibi 互动提醒", "For Habibi 通知", "For Habibi 알림", "Alertas For Habibi", "Alertes For Habibi", "For Habibi-Benachrichtigungen", "การแจ้งเตือน For Habibi"),
  notifForHabibiSub: mk("對方傳送貼圖時通知我", "Notify me when they send a sticker", "对方传送贴图时通知我", "相手がスタンプを送ったら通知", "상대방이 스티커를 보내면 알림", "Notificarme cuando envíen un sticker", "Me notifier quand ils envoient un sticker", "Benachrichtigen bei Sticker-Erhalt", "แจ้งเตือนเมื่อพวกเขาส่งสติกเกอร์"),
  deleteAccount: mk("刪除帳號", "Delete Account", "删除账号", "アカウント削除", "계정 삭제", "Eliminar Cuenta", "Supprimer le Compte", "Konto Löschen", "ลบบัญชี"),
  deleteAction: mk("刪除", "Delete", "删除", "削除", "삭제", "Eliminar", "Supprimer", "Löschen", "ลบ"),
  cancelLabel: mk("取消", "Cancel", "取消", "キャンセル", "취소", "Cancelar", "Annuler", "Abbrechen", "ยกเลิก"),
  backLabel: mk("返回", "Back", "返回", "戻る", "뒤로", "Atrás", "Retour", "Zurück", "ย้อนกลับ"),
  chatPlaceholder: mk("傳訊息給{name}...", "Message {name}...", "传消息给{name}...", "{name}にメッセージ...", "{name}에게 메시지...", "Mensaje a {name}...", "Message à {name}...", "Nachricht an {name}...", "ส่งข้อความถึง{name}..."),
  lateNightReminder: mk("那裡已經凌晨了，早點休息喔 🌙", "It's already late night there 🌙", "那里已经凌晨了，早点休息喔 🌙", "そちらはもう夜遅いですね 🌙", "거긴 벌써 늦은 밤이네요 🌙", "Ya es de madrugada allí 🌙", "Il est déjà tard là-bas 🌙", "Es ist dort schon spät 🌙", "ที่นั่นดึกแล้วนะ 🌙"),
  meetingReminder: mk("再 {d} 天就要見面了！好期待 💕", "Only {d} days until you meet! 💕", "还有 {d} 天就要见面了！好期待 💕", "あと {d} 日で会えますね！💕", "{d} 일 후에 만나요! 💕", "¡Solo {d} días para verse! 💕", "Plus que {d} jours ! 💕", "Nur noch {d} Tage! 💕", "อีก {d} วันจะได้เจอกัน! 💕"),
  monthlyReminder: mk("再 {d} 天就是每月紀念日了！🎉", "Only {d} days until your anniversary! 🎉", "还有 {d} 天就是每月纪念日了！🎉", "あと {d} 日で記念日です！🎉", "앞으로 {d} 일 남았어요! 🎉", "¡Solo {d} días para su aniversario! 🎉", "Plus que {d} jours avant l'anniversaire ! 🎉", "Nur noch {d} Tage bis zum Jahrestag! 🎉", "อีก {d} วันก็จะถึงวันครบรอบแล้ว! 🎉"),
  editNicknameTitle: mk("編輯伴侶暱稱", "Edit Partner Nickname", "编辑伴侣昵称", "パートナーのニックネームを編集", "파트너 닉네임 수정", "Editar Apodo de Pareja", "Modifier le Surnom du Partenaire", "Partner-Spitznamen Bearbeiten", "แก้ไขชื่อเล่นคู่"),
  saveLabel: mk("儲存", "Save", "保存", "保存", "저장", "Guardar", "Enregistrer", "Speichern", "บันทึก"),
  dragHint: mk("拖曳調整位置", "Drag to reposition", "拖曳调整位置", "ドラッグして調整", "드래그해 조정", "Arrastra para ajustar", "Fais glisser pour ajuster", "Ziehen zum Positionieren", "ลากเพื่อจัดตำแหน่ง"),
  textPlaceholder: mk("想對他說的話（限 30 字）", "Type text to show on photo...", "想对他说的话（限 30 字）", "写真に表示する文字を入力…", "사진에 표시할 텍스트 입력…", "Escribe el texto...", "Saisis le texte...", "Text für das Foto eingeben...", "พิมพ์ข้อความ..."),
  sendToWidget: mk("發送到伴侶桌面", "Send to Partner's Widget", "发送到伴侣桌面", "パートナーのウィジェットに送信", "파트너 위젯으로 보내기", "Enviar al Widget de tu Pareja", "Envoyer au Widget de mon Partenaire", "An das Widget des Partners senden", "ส่งไปที่วิดเจ็ตของคู่ของคุณ"),
  widgetSentTitle: mk("已送達{name}的桌面 Widget", "Delivered to {name}'s Widget", "已送达{name}的桌面 Widget", "{name}のウィジェットに届きました", "{name}의 위젯에 전달됨", "Entregado al Widget de {name}", "Livré au Widget de {name}", "An {name}s Widget geliefert", "ส่งถึงวิดเจ็ตของ{name}แล้ว"),
  widgetUpdated: mk("已傳送", "Sent", "已发送", "送信済み", "전송됨", "Enviado", "Envoyé", "Gesendet", "ส่งแล้ว"),
  importantDates: mk("重要日期", "Important Dates", "重要日期", "記念日", "기념일", "Fechas Importantes", "Dates Importantes", "Wichtige Daten", "วันสำคัญ"),
  anniversaryLocked: mk("交往紀念日", "Anniversary", "交往纪念日", "記念日", "기념일", "Aniversario", "Anniversaire", "Jahrestag", "วันครบรอบ"),
  partnerBirthday: mk("伴侶生日", "Partner's Birthday", "伴侣生日", "パートナーの誕生日", "파트너 생일", "Cumpleaños de Pareja", "Anniversaire du Partenaire", "Geburtstag des Partners", "วันเกิดของคู่"),
  myBirthday: mk("我的生日", "My Birthday", "我的生日", "私の誕生日", "내 생일", "Mi Cumpleaños", "Mon Anniversaire", "Mein Geburtstag", "วันเกิดของฉัน"),
  nextMeetingLabel: mk("下次見面", "Next Meeting", "下次见面", "次回の待ち合わせ", "다음 만남", "Próximo Encuentro", "Prochaine Rencontre", "Nächstes Treffen", "การพบกันครั้งหน้า"),
  editAllDates: mk("編輯所有日期", "Edit All Dates", "编辑所有日期", "すべての日付を編集", "모든 날짜 편집", "Editar Todas las Fechas", "Modifier Toutes les Dates", "Alle Daten Bearbeiten", "แก้ไขวันที่ทั้งหมด"),
  addDate: mk("新增日期", "Add Date", "新增日期", "日付を追加", "날짜 추가", "Agregar Fecha", "Ajouter une Date", "Datum Hinzufügen", "เพิ่มวันที่"),
  doneLabel: mk("完成", "Done", "完成", "完了", "완료", "Listo", "Terminé", "Fertig", "เสร็จสิ้น"),
  monthlyDaySuffix: mk("號", "th", "号", "日", "일", "", "", ".", " ค."),
  changeAvatarTitle: mk("更換大頭照", "Change Photo", "更换大头照", "写真を変更", "사진 변경", "Cambiar Foto", "Changer la Photo", "Foto Ändern", "เปลี่ยนรูปภาพ"),
  takePhotoLabel: mk("拍照", "Take Photo", "拍照", "撮影", "촬영", "Tomar Foto", "Prendre une Photo", "Foto aufnehmen", "ถ่ายรูป"),
  chooseLibraryLabel: mk("從相簿選取", "Choose from Library", "从相簿选取", "アルバムから選択", "앨범에서 선택", "Elegir del Álbum", "Choisir dans l'Album", "Aus Album wählen", "เลือกจากอัลบั้ม"),
  typeEmojiHint: mk("點鍵盤上的表情符號圖示，選一個喜歡的", "Tap the emoji key on your keyboard to pick one", "点键盘上的表情符号图标，选一个喜欢的", "キーボードの絵文字アイコンをタップして選択", "키보드의 이모지 아이콘을 눌러 선택", "Toca el ícono de emoji en tu teclado", "Appuie sur l'icône emoji du clavier", "Tippe auf das Emoji-Symbol der Tastatur", "แตะไอคอนอิโมจิบนแป้นพิมพ์"),
};

function useTranslator(lang: string) {
  return useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let str = (T[key] && (T[key][lang] || T[key].en)) || key;
      if (vars) Object.entries(vars).forEach(([k, v]) => { str = str.replace(new RegExp(`{${k}}`, "g"), String(v)); });
      return str;
    },
    [lang]
  );
}

/* ---------------- Context ---------------- */

type AppCtxValue = {
  gender: Gender;
  setGender: (g: Gender) => void;
  lang: string;
  setLang: (l: string) => void;
  colors: typeof THEMES["feminine"];
  t: (key: string, vars?: Record<string, string | number>) => string;
  partnerName: string;
  setPartnerName: (n: string) => void;
  partner: typeof PARTNER_BASE & { name: string };
  monthlyDays: number[];
  setMonthlyDays: (d: number[] | ((prev: number[]) => number[])) => void;
  notifSettings: { forYou: boolean };
  setNotifSettings: (n: any) => void;
  myAvatarUri: string | null;
  setMyAvatarUri: (uri: string | null) => void;
  partnerAvatarUri: string | null;
  setPartnerAvatarUri: (uri: string | null) => void;
  habibiEmojis: string[];
  setHabibiEmojis: (e: string[] | ((prev: string[]) => string[])) => void;
  isLoaded: boolean;
};

const AppCtx = createContext<AppCtxValue | null>(null);
const DEFAULT_HABIBI_EMOJIS = ["😘", "❤️", "🌅"];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [gender, setGender] = useState<Gender>("feminine");
  const [lang, setLang] = useState("zh-Hant");
  const [partnerName, setPartnerName] = useState(PARTNER_DEFAULT_NAME);
  const [monthlyDays, setMonthlyDays] = useState<number[]>(DEFAULT_MONTHLY_DAYS);
  const [notifSettings, setNotifSettings] = useState({ forYou: true });
  const [myAvatarUri, setMyAvatarUri] = useState<string | null>(null);
  const [partnerAvatarUri, setPartnerAvatarUri] = useState<string | null>(null);
  const [habibiEmojis, setHabibiEmojis] = useState<string[]>(DEFAULT_HABIBI_EMOJIS);
  const [isLoaded, setIsLoaded] = useState(false);
  const t = useTranslator(lang);
  const colors = THEMES[gender];
  const partner = useMemo(() => ({ ...PARTNER_BASE, name: partnerName }), [partnerName]);

  // 開啟 App 時，把上次存的資料讀回來
  useEffect(() => {
    (async () => {
      const saved = await loadJSON("appState", null as any);
      if (saved) {
        if (saved.gender) setGender(saved.gender);
        if (saved.lang) setLang(saved.lang);
        if (saved.partnerName) setPartnerName(saved.partnerName);
        if (saved.monthlyDays) setMonthlyDays(saved.monthlyDays);
        if (saved.notifSettings) setNotifSettings(saved.notifSettings);
        if (saved.myAvatarUri) setMyAvatarUri(saved.myAvatarUri);
        if (saved.partnerAvatarUri) setPartnerAvatarUri(saved.partnerAvatarUri);
        if (saved.habibiEmojis) setHabibiEmojis(saved.habibiEmojis);
      }
      setIsLoaded(true);
    })();
  }, []);

  // 資料變動時自動存檔（跳過第一次載入前的狀態，避免用預設值把剛讀到的資料覆蓋掉）
  useEffect(() => {
    if (!isLoaded) return;
    saveJSON("appState", {
      gender, lang, partnerName, monthlyDays, notifSettings, myAvatarUri, partnerAvatarUri, habibiEmojis,
    });
  }, [isLoaded, gender, lang, partnerName, monthlyDays, notifSettings, myAvatarUri, partnerAvatarUri, habibiEmojis]);

  const value = useMemo(
    () => ({
      gender, setGender, lang, setLang, colors, t, partnerName, setPartnerName, partner,
      monthlyDays, setMonthlyDays, notifSettings, setNotifSettings,
      myAvatarUri, setMyAvatarUri, partnerAvatarUri, setPartnerAvatarUri,
      habibiEmojis, setHabibiEmojis, isLoaded,
    }),
    [gender, lang, colors, t, partnerName, partner, monthlyDays, notifSettings, myAvatarUri, partnerAvatarUri, habibiEmojis, isLoaded]
  );
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
