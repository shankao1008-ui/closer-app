import { LinearGradient } from "expo-linear-gradient";
import { ChevronDown, Moon, Plane, Send, Sparkles, X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList, KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LOCALE_MAP, useApp } from "../../context/AppContext";
import { REL, diffParts, getNextMonthlyOccurrence, getZonedParts } from "../../lib/data";
import { loadJSON, saveJSON } from "../../lib/storage";

type Message = { id: string; sender: "me" | "partner"; content: string; time: string };

const INITIAL_MESSAGES: Message[] = [];

export default function ChatScreen() {
  const { colors, t, lang, partner, setPartnerName, monthlyDays } = useApp();
  const styles = makeStyles(colors);
  const [now, setNow] = useState(new Date());
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(partner.name);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // 讀取上次的聊天紀錄
  useEffect(() => {
    (async () => {
      const saved = await loadJSON<Message[] | null>("chatMessages", null);
      if (saved && saved.length) setMessages(saved);
      setMessagesLoaded(true);
    })();
  }, []);

  // 訊息改變時自動存檔
  useEffect(() => {
    if (!messagesLoaded) return;
    saveJSON("chatMessages", messages);
  }, [messagesLoaded, messages]);

  const locale = LOCALE_MAP[lang] || "en-US";
  const partnerParts = getZonedParts(now, partner.tz, locale);
  const meetingCd = diffParts(REL.nextMeeting.date, now);
  const monthlyInfo = getNextMonthlyOccurrence(monthlyDays, now);

  const reminder = useMemo(() => {
    if (partnerParts.hour >= 23 || partnerParts.hour < 5) return { Icon: Moon, text: t("lateNightReminder") };
    if (monthlyInfo && monthlyInfo.diffDays <= 3) return { Icon: Sparkles, text: t("monthlyReminder", { d: monthlyInfo.diffDays }) };
    if (meetingCd.days <= 7) return { Icon: Plane, text: t("meetingReminder", { d: meetingCd.days }) };
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerParts.hour, monthlyInfo, meetingCd.days]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { id: String(Date.now()), sender: "me", content: input.trim(), time: "現在" }]);
    setInput("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const saveNickname = () => {
    if (nameDraft.trim()) setPartnerName(nameDraft.trim());
    setEditingName(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <LinearGradient colors={colors.screenBg as any} style={StyleSheet.absoluteFill} />

      {/* header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.lavenderDeep }]}>
          <Text style={styles.avatarText}>{partner.avatar}</Text>
        </View>
        <Pressable onPress={() => { setNameDraft(partner.name); setEditingName(true); }} style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Text style={[styles.name, { color: colors.ink }]}>{partner.name}</Text>
            <ChevronDown size={13} color={colors.inkSoft} />
          </View>
          <Text style={{ fontSize: 10.5, color: colors.inkSoft }}>{partner.cityName} {partnerParts.timeStr}</Text>
        </Pressable>
      </View>

      {reminder && (
        <View style={[styles.reminder, { backgroundColor: colors.primary + "20" }]}>
          <reminder.Icon size={15} color={colors.primaryDeep} />
          <Text style={{ fontSize: 11.5, color: colors.ink, marginLeft: 8, flex: 1 }}>{reminder.text}</Text>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => <MessageBubble message={item} colors={colors} />}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={[styles.inputBar, { backgroundColor: colors.cardBg, borderTopColor: colors.cardBorder }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={t("chatPlaceholder", { name: partner.name })}
          placeholderTextColor={colors.inkSoft}
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.ink }]}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <Pressable onPress={sendMessage} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
          <Send size={16} color="#fff" />
        </Pressable>
      </View>

      {/* edit nickname modal */}
      <Modal visible={editingName} transparent animationType="fade" onRequestClose={() => setEditingName(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setEditingName(false)}>
          <Pressable style={[styles.nameCard, { backgroundColor: colors.cardBg }]} onPress={(e) => e.stopPropagation()}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ fontWeight: "700", fontSize: 14, color: colors.ink }}>✏️ {t("editNicknameTitle")}</Text>
              <Pressable onPress={() => setEditingName(false)}><X size={16} color={colors.inkSoft} /></Pressable>
            </View>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              maxLength={12}
              autoFocus
              style={[styles.nameInput, { backgroundColor: colors.inputBg, color: colors.ink, borderColor: colors.cardBorder }]}
            />
            <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
              <Pressable onPress={() => setEditingName(false)} style={[styles.modalBtn, { backgroundColor: colors.hairline }]}>
                <Text style={{ color: colors.inkSoft, fontWeight: "700", fontSize: 13 }}>{t("cancelLabel")}</Text>
              </Pressable>
              <Pressable onPress={saveNickname} style={[styles.modalBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{t("saveLabel")}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message, colors }: { message: Message; colors: any }) {
  const isMe = message.sender === "me";
  return (
    <View style={{ alignItems: isMe ? "flex-end" : "flex-start" }}>
      <View
        style={{
          maxWidth: "72%", paddingHorizontal: 13, paddingVertical: 9, borderRadius: 16,
          borderBottomRightRadius: isMe ? 4 : 16, borderBottomLeftRadius: isMe ? 16 : 4,
          backgroundColor: isMe ? colors.primary : colors.bubblePartnerBg,
        }}
      >
        <Text style={{ color: isMe ? "#fff" : colors.ink, fontSize: 13, lineHeight: 18 }}>{message.content}</Text>
        <Text style={{ color: isMe ? "#ffffffaa" : colors.inkSoft, fontSize: 9, marginTop: 3, textAlign: "right" }}>{message.time}</Text>
      </View>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    header: {
      flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16,
      paddingTop: Platform.OS === "ios" ? 60 : 32, paddingBottom: 12,
    },
    avatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
    name: { fontWeight: "700", fontSize: 14 },
    reminder: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, borderRadius: 14, padding: 10, marginBottom: 4 },
    inputBar: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderTopWidth: 1 },
    input: { flex: 1, borderRadius: 100, paddingHorizontal: 16, paddingVertical: 10, fontSize: 13 },
    sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    modalBackdrop: { flex: 1, backgroundColor: "rgba(20,14,20,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
    nameCard: { width: "100%", borderRadius: 22, padding: 18 },
    nameInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 },
    modalBtn: { flex: 1, paddingVertical: 11, borderRadius: 14, alignItems: "center" },
  });
}
