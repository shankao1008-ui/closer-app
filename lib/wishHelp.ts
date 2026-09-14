const copy = {
  "en": {
    "guide": "These tabs filter your wishes. Use the button on each wish to change its status.",
    "all": "All wishes",
    "todo": "Still to do",
    "done": "Completed",
    "mark": "Mark as completed",
    "undo": "Move back to To do",
    "saved": "Wish saved.",
    "timeout": "No confirmation received. Refresh before retrying; your change may already be saved.",
    "empty": "No wishes in this view yet.",
    "setup": "This feature is not ready yet. Please contact support."
  },
  "zh-Hant": {
    "guide": "上方分頁用來篩選願望；點每個願望的按鈕，就能切換完成狀態。",
    "all": "全部願望",
    "todo": "待完成",
    "done": "已完成",
    "mark": "標記完成",
    "undo": "改回待完成",
    "saved": "願望已儲存。",
    "timeout": "尚未收到確認。請先重新整理再重試，變更可能已儲存。",
    "empty": "這個分類還沒有願望。",
    "setup": "此功能尚未準備完成，請聯絡支援。"
  },
  "zh-Hans": {
    "guide": "上方分页用于筛选愿望；点每个愿望的按钮，就能切换完成状态。",
    "all": "全部愿望",
    "todo": "待完成",
    "done": "已完成",
    "mark": "标记完成",
    "undo": "改回待完成",
    "saved": "愿望已保存。",
    "timeout": "尚未收到确认。请先刷新再重试，更改可能已保存。",
    "empty": "这个分类还没有愿望。",
    "setup": "此功能尚未准备完成，请联系支持。"
  },
  "ja": {
    "guide": "タブで絞り込み、各項目のボタンで完了状態を変更できます。",
    "all": "すべての願い",
    "todo": "これから",
    "done": "完了",
    "mark": "完了にする",
    "undo": "未完了に戻す",
    "saved": "保存しました。",
    "timeout": "確認が届いていません。保存済みの場合があるため、更新してから再試行してください。",
    "empty": "この表示にはまだ項目がありません。",
    "setup": "この機能はまだ利用できません。サポートにお問い合わせください。"
  },
  "ko": {
    "guide": "탭으로 목록을 필터링하고 각 항목의 버튼으로 완료 상태를 바꾸세요.",
    "all": "모든 소원",
    "todo": "아직 할 일",
    "done": "완료",
    "mark": "완료로 표시",
    "undo": "미완료로 되돌리기",
    "saved": "저장했어요.",
    "timeout": "확인을 받지 못했어요. 이미 저장되었을 수 있으니 새로고침 후 다시 시도해 주세요.",
    "empty": "이 목록에는 아직 항목이 없어요.",
    "setup": "아직 사용할 수 없는 기능이에요. 지원팀에 문의해 주세요."
  },
  "es": {
    "guide": "Las pestañas filtran los deseos. Usa el botón de cada deseo para cambiar su estado.",
    "all": "Todos los deseos",
    "todo": "Por hacer",
    "done": "Completados",
    "mark": "Marcar como completado",
    "undo": "Volver a pendiente",
    "saved": "Deseo guardado.",
    "timeout": "No se recibió confirmación. Actualiza antes de reintentar; el cambio podría estar guardado.",
    "empty": "Todavía no hay deseos en esta vista.",
    "setup": "Esta función aún no está disponible. Contacta con soporte."
  },
  "fr": {
    "guide": "Les onglets filtrent vos envies. Le bouton de chaque envie permet de changer son statut.",
    "all": "Toutes les envies",
    "todo": "À faire",
    "done": "Terminées",
    "mark": "Marquer comme terminé",
    "undo": "Remettre à faire",
    "saved": "Envie enregistrée.",
    "timeout": "Aucune confirmation reçue. Actualisez avant de réessayer : la modification est peut-être enregistrée.",
    "empty": "Aucune envie dans cette vue pour le moment.",
    "setup": "Cette fonction n’est pas encore disponible. Contactez l’assistance."
  },
  "de": {
    "guide": "Die Tabs filtern eure Wünsche. Mit dem Button am Wunsch änderst du seinen Status.",
    "all": "Alle Wünsche",
    "todo": "Noch offen",
    "done": "Erledigt",
    "mark": "Als erledigt markieren",
    "undo": "Zurück zu offen",
    "saved": "Wunsch gespeichert.",
    "timeout": "Keine Bestätigung erhalten. Aktualisiere vor einem neuen Versuch; die Änderung könnte gespeichert sein.",
    "empty": "In dieser Ansicht gibt es noch keine Wünsche.",
    "setup": "Diese Funktion ist noch nicht verfügbar. Bitte kontaktiere den Support."
  },
  "th": {
    "guide": "แท็บใช้กรองรายการ กดปุ่มในแต่ละรายการเพื่อเปลี่ยนสถานะ",
    "all": "ความฝันทั้งหมด",
    "todo": "ยังต้องทำ",
    "done": "เสร็จแล้ว",
    "mark": "ทำเครื่องหมายว่าเสร็จแล้ว",
    "undo": "เปลี่ยนกลับเป็นยังไม่เสร็จ",
    "saved": "บันทึกแล้ว",
    "timeout": "ยังไม่ได้รับการยืนยัน โปรดรีเฟรชก่อนลองอีกครั้ง การเปลี่ยนแปลงอาจบันทึกแล้ว",
    "empty": "ยังไม่มีรายการในมุมมองนี้",
    "setup": "ฟังก์ชันนี้ยังไม่พร้อมใช้งาน โปรดติดต่อฝ่ายสนับสนุน"
  }
};
export function wishHelp(lang:string):typeof copy.en{return (copy as Record<string,typeof copy.en>)[lang]??copy.en;}
