const translations: Record<string, readonly string[]> = {
  en: ["From your partner", "No photos yet", "Pair with your partner to receive photos.", "Loading photo…", "Couldn't load the photo. Try again.", "Refresh", "Send to partner", "Photo sent", "Create a photo"],
  "zh-Hant": ["伴侶傳來的照片", "還沒有收到照片", "與伴侶配對後即可接收照片。", "正在載入照片…", "無法載入照片，請重試。", "重新整理", "傳送給伴侶", "照片已傳送", "製作照片"],
  "zh-Hans": ["伴侣发来的照片", "还没有收到照片", "与伴侣配对后即可接收照片。", "正在加载照片…", "无法加载照片，请重试。", "刷新", "发送给伴侣", "照片已发送", "制作照片"],
  ja: ["パートナーからの写真", "写真はまだありません", "ペアリングすると写真を受け取れます。", "写真を読み込み中…", "写真を読み込めませんでした。再試行してください。", "更新", "パートナーに送る", "写真を送信しました", "写真を作成"],
  ko: ["상대방이 보낸 사진", "아직 받은 사진이 없어요", "상대방과 연결하면 사진을 받을 수 있어요.", "사진을 불러오는 중…", "사진을 불러오지 못했어요. 다시 시도해 주세요.", "새로고침", "상대방에게 보내기", "사진을 보냈어요", "사진 만들기"],
  es: ["Fotos de tu pareja", "Aún no hay fotos", "Vincúlate con tu pareja para recibir fotos.", "Cargando foto…", "No se pudo cargar la foto. Inténtalo de nuevo.", "Actualizar", "Enviar a tu pareja", "Foto enviada", "Crear una foto"],
  fr: ["Photo de votre partenaire", "Aucune photo pour le moment", "Associez-vous à votre partenaire pour recevoir des photos.", "Chargement de la photo…", "Impossible de charger la photo. Réessayez.", "Actualiser", "Envoyer à votre partenaire", "Photo envoyée", "Créer une photo"],
  de: ["Foto von deinem Partner", "Noch keine Fotos", "Verbinde dich mit deinem Partner, um Fotos zu empfangen.", "Foto wird geladen…", "Das Foto konnte nicht geladen werden. Versuche es erneut.", "Aktualisieren", "An deinen Partner senden", "Foto gesendet", "Foto erstellen"],
  th: ["รูปจากคนรัก", "ยังไม่มีรูปภาพ", "จับคู่กับคนรักเพื่อรับรูปภาพ", "กำลังโหลดรูปภาพ…", "โหลดรูปภาพไม่ได้ โปรดลองอีกครั้ง", "รีเฟรช", "ส่งให้คนรัก", "ส่งรูปภาพแล้ว", "สร้างรูปภาพ"],
};
export function receivedPhotoText(lang: string) {
  const [title, empty, pair, loading, error, refresh, send, sent, create] = translations[lang] ?? translations.en;
  return { title, empty, pair, loading, error, refresh, send, sent, create };
}
