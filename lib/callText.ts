export const CALL_TEXT = {
  "zh-Hant": {
    "voice": "語音通話",
    "video": "視訊通話",
    "preview": "通話介面預覽",
    "unavailable": "尚未連接通話服務。此畫面不會撥號或通知對方。",
    "microphone": "麥克風未啟用",
    "camera": "鏡頭未啟用",
    "close": "返回聊天"
  },
  "zh-Hans": {
    "voice": "语音通话",
    "video": "视频通话",
    "preview": "通话界面预览",
    "unavailable": "尚未连接通话服务。此界面不会拨号或通知对方。",
    "microphone": "麦克风未启用",
    "camera": "摄像头未启用",
    "close": "返回聊天"
  },
  "en": {
    "voice": "Voice call",
    "video": "Video call",
    "preview": "Call preview",
    "unavailable": "Calling is not connected yet. This screen will not place a call or notify your partner.",
    "microphone": "Microphone inactive",
    "camera": "Camera inactive",
    "close": "Back to chat"
  },
  "ja": {
    "voice": "音声通話",
    "video": "ビデオ通話",
    "preview": "通話画面のプレビュー",
    "unavailable": "通話サービスは未接続です。この画面から発信や相手への通知は行われません。",
    "microphone": "マイクは無効です",
    "camera": "カメラは無効です",
    "close": "チャットに戻る"
  },
  "ko": {
    "voice": "음성 통화",
    "video": "영상 통화",
    "preview": "통화 화면 미리보기",
    "unavailable": "통화 서비스가 아직 연결되지 않았어요. 이 화면에서는 전화를 걸거나 상대방에게 알리지 않아요.",
    "microphone": "마이크 비활성화",
    "camera": "카메라 비활성화",
    "close": "채팅으로 돌아가기"
  },
  "es": {
    "voice": "Llamada de voz",
    "video": "Videollamada",
    "preview": "Vista previa de llamada",
    "unavailable": "El servicio de llamadas aún no está conectado. Esta pantalla no llamará ni notificará a tu pareja.",
    "microphone": "Micrófono inactivo",
    "camera": "Cámara inactiva",
    "close": "Volver al chat"
  },
  "fr": {
    "voice": "Appel vocal",
    "video": "Appel vidéo",
    "preview": "Aperçu de l’appel",
    "unavailable": "Le service d’appel n’est pas encore connecté. Cet écran ne lance aucun appel et ne prévient pas votre partenaire.",
    "microphone": "Microphone inactif",
    "camera": "Caméra inactive",
    "close": "Retour au chat"
  },
  "de": {
    "voice": "Sprachanruf",
    "video": "Videoanruf",
    "preview": "Anrufvorschau",
    "unavailable": "Der Anrufdienst ist noch nicht verbunden. Dieser Bildschirm startet keinen Anruf und benachrichtigt deinen Partner nicht.",
    "microphone": "Mikrofon inaktiv",
    "camera": "Kamera inaktiv",
    "close": "Zurück zum Chat"
  },
  "th": {
    "voice": "โทรด้วยเสียง",
    "video": "วิดีโอคอล",
    "preview": "ตัวอย่างหน้าจอการโทร",
    "unavailable": "ยังไม่ได้เชื่อมต่อบริการโทร หน้าจอนี้จะไม่โทรหรือแจ้งเตือนคนรักของคุณ",
    "microphone": "ไมโครโฟนยังไม่ทำงาน",
    "camera": "กล้องยังไม่ทำงาน",
    "close": "กลับไปที่แชต"
  }
};
export const callText = (lang: string) => CALL_TEXT[lang as keyof typeof CALL_TEXT] ?? CALL_TEXT.en;
