const text: Record<string, readonly string[]> = {
  en: ['Little moments, closer together.', 'A little piece of my day', 'Add a photo', 'Make it yours', 'Caption style is a preview. Your photo and message are sent separately.', 'Connect with your partner'],
  'zh-Hant': ['把日常的小瞬間，送到你身邊。', '分享今天的一小片刻', '放上我的照片', '加一點你的風格', '文字樣式為預覽效果；照片與訊息會分開傳送。', '與伴侶配對'],
  'zh-Hans': ['把日常的小瞬间，送到你身边。', '分享今天的一小片刻', '放上我的照片', '加一点你的风格', '文字样式为预览效果；照片与消息会分开发送。', '与伴侣配对'],
  ja: ['日々の小さな瞬間で、もっと近くに。', '今日のひとコマを届けよう', '写真を追加', '自分らしくアレンジ', '文字のスタイルはプレビューです。写真とメッセージは別々に送信されます。', 'パートナーとつながる'],
  ko: ['작은 일상의 순간으로 더 가까이.', '오늘의 한 조각을 보내요', '사진 추가', '나만의 스타일로', '글자 스타일은 미리보기예요. 사진과 메시지는 따로 전송돼요.', '상대방과 연결하기'],
  es: ['Pequeños momentos que nos acercan.', 'Un pedacito de mi día', 'Añadir foto', 'Dale tu estilo', 'El estilo del texto es una vista previa. La foto y el mensaje se envían por separado.', 'Vincular con tu pareja'],
  fr: ['De petits moments pour se rapprocher.', 'Un petit bout de ma journée', 'Ajouter une photo', 'À votre image', 'Le style du texte est un aperçu. La photo et le message sont envoyés séparément.', 'Se connecter à votre partenaire'],
  de: ['Kleine Momente bringen uns näher.', 'Ein kleiner Einblick in meinen Tag', 'Foto hinzufügen', 'Dein eigener Stil', 'Der Textstil ist eine Vorschau. Foto und Nachricht werden separat gesendet.', 'Mit deinem Partner verbinden'],
  th: ['ใกล้กันขึ้นผ่านช่วงเวลาเล็ก ๆ ในแต่ละวัน', 'แบ่งปันช่วงเวลาของวันนี้', 'เพิ่มรูปภาพ', 'เติมสไตล์ของคุณ', 'รูปแบบข้อความเป็นเพียงตัวอย่าง รูปภาพและข้อความจะส่งแยกกัน', 'จับคู่กับคนรัก'],
};
export function photoDesignText(lang: string) {
  const [subtitle, create, add, style, preview, pair] = text[lang] ?? text.en;
  return { subtitle, create, add, style, preview, pair };
}
