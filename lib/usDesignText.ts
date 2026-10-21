const words: Record<string, readonly string[]> = {
  en: ['Our little world', 'Two lives. One story.', 'Your story starts here', 'Connect with your partner and make this space yours.', 'Pair with your partner', 'You', 'Your partner', 'Our moments', 'Little memories, shared', 'Our wishes', 'Dream up your next adventure', 'Our timeline'],
  'zh-Hant': ['我們的小宇宙', '兩個人的生活，一起寫的故事。', '故事，從你們開始', '與伴侶配對，把這裡變成你們的專屬空間。', '與伴侶配對', '你', '你的伴侶', '我們的時刻', '一起收藏日常的小回憶', '共同願望', '想像下一場雙人冒險', '我們的時間軸'],
  'zh-Hans': ['我们的小宇宙', '两个人的生活，一起写的故事。', '故事，从你们开始', '与伴侣配对，把这里变成你们的专属空间。', '与伴侣配对', '你', '你的伴侣', '我们的时刻', '一起收藏日常的小回忆', '共同愿望', '想象下一场双人冒险', '我们的时间轴'],
  ja: ['ふたりの小さな世界', 'ふたつの日常、ひとつの物語。', 'ここから始まる物語', 'パートナーとつながって、ふたりだけの場所に。', 'パートナーとつながる', 'あなた', 'パートナー', 'ふたりの瞬間', '小さな思い出を一緒に', 'ふたりの願い', '次の冒険を思い描こう', 'ふたりのタイムライン'],
  ko: ['우리만의 작은 세상', '두 사람의 일상, 하나의 이야기.', '우리 이야기가 시작되는 곳', '상대방과 연결하고 우리만의 공간을 만들어요.', '상대방과 연결하기', '나', '상대방', '우리의 순간', '함께 모으는 작은 추억', '우리의 소원', '다음 모험을 꿈꿔요', '우리의 타임라인'],
  es: ['Nuestro pequeño mundo', 'Dos vidas. Una historia.', 'Aquí empieza vuestra historia', 'Vincúlate con tu pareja y haced vuestro este espacio.', 'Vincular con tu pareja', 'Tú', 'Tu pareja', 'Nuestros momentos', 'Pequeños recuerdos compartidos', 'Nuestros deseos', 'Soñad vuestra próxima aventura', 'Nuestra historia'],
  fr: ['Notre petit monde', 'Deux vies. Une histoire.', 'Votre histoire commence ici', 'Connectez-vous à votre partenaire et créez votre espace.', 'Se connecter à votre partenaire', 'Vous', 'Votre partenaire', 'Nos moments', 'De petits souvenirs partagés', 'Nos envies', 'Imaginez votre prochaine aventure', 'Notre histoire'],
  de: ['Unsere kleine Welt', 'Zwei Leben. Eine Geschichte.', 'Hier beginnt eure Geschichte', 'Verbinde dich mit deinem Partner und schafft euren eigenen Ort.', 'Mit deinem Partner verbinden', 'Du', 'Dein Partner', 'Unsere Momente', 'Kleine Erinnerungen teilen', 'Unsere Wünsche', 'Träumt vom nächsten Abenteuer', 'Unsere Geschichte'],
  th: ['โลกใบเล็กของเรา', 'สองชีวิต หนึ่งเรื่องราว', 'เรื่องราวของเราเริ่มที่นี่', 'จับคู่กับคนรักและสร้างพื้นที่ของเรา', 'จับคู่กับคนรัก', 'คุณ', 'คนรักของคุณ', 'ช่วงเวลาของเรา', 'เก็บความทรงจำเล็ก ๆ ร่วมกัน', 'ความฝันของเรา', 'วางแผนการผจญภัยครั้งต่อไป', 'ไทม์ไลน์ของเรา'],
};
export function usDesignText(lang: string) {
  const [title, subtitle, emptyTitle, emptyBody, pair, you, partner, moments, momentsSub, wishes, wishesSub, timeline] = words[lang] ?? words.en;
  return { title, subtitle, emptyTitle, emptyBody, pair, you, partner, moments, momentsSub, wishes, wishesSub, timeline };
}
