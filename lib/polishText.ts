const words: Record<string, readonly string[]> = {
 en: ['Remove photo', 'Photo removed. Choose another whenever you’re ready.', 'Choose what to edit', 'Only filled fields are updated. You can add other dates later.', 'Relationship and past meeting dates cannot be in the future.'],
 'zh-Hant': ['移除照片', '照片已移除，隨時可以重新選取。', '設定你想記住的日期', '只更新已填寫的欄位，其他日期可以之後再補。', '交往開始日與上次見面日期不能是未來日期。'],
 'zh-Hans': ['移除照片', '照片已移除，随时可以重新选择。', '设置你想记住的日期', '只更新已填写的字段，其他日期可以之后再补。', '交往开始日与上次见面日期不能是未来日期。'],
 ja: ['写真を削除', '写真を削除しました。また選べます。', '覚えておきたい日を設定', '入力した項目だけ更新されます。他の日付は後で追加できます。', '交際開始日と前回会った日は未来の日付にできません。'],
 ko: ['사진 제거', '사진을 제거했어요. 언제든 다시 선택하세요.', '기억하고 싶은 날짜 설정', '입력한 항목만 업데이트돼요. 다른 날짜는 나중에 추가할 수 있어요.', '교제 시작일과 마지막 만남은 미래 날짜일 수 없어요.'],
 es: ['Quitar foto', 'Foto eliminada. Puedes elegir otra.', 'Elige qué editar', 'Solo se actualizan los campos rellenados. Puedes añadir más fechas después.', 'El inicio de la relación y el último encuentro no pueden ser fechas futuras.'],
 fr: ['Retirer la photo', 'Photo retirée. Vous pouvez en choisir une autre.', 'Choisissez les dates à modifier', 'Seuls les champs remplis sont mis à jour. Les autres dates peuvent attendre.', 'Le début de la relation et la dernière rencontre ne peuvent pas être dans le futur.'],
 de: ['Foto entfernen', 'Foto entfernt. Du kannst ein anderes auswählen.', 'Wähle, was du ändern möchtest', 'Nur ausgefüllte Felder werden aktualisiert. Weitere Daten kannst du später ergänzen.', 'Beziehungsbeginn und letztes Treffen dürfen nicht in der Zukunft liegen.'],
 th: ['นำรูปออก', 'นำรูปออกแล้ว เลือกรูปใหม่ได้ทุกเมื่อ', 'เลือกวันที่ที่อยากจดจำ', 'อัปเดตเฉพาะช่องที่กรอก เพิ่มวันอื่นภายหลังได้', 'วันเริ่มคบและวันที่พบกันล่าสุดต้องไม่เป็นวันในอนาคต'],
};
export function polishText(lang: string) { const [removePhoto, removed, edit, optional, future] = words[lang] ?? words.en; return {removePhoto, removed, edit, optional, future}; }
