import CallPreview from "../../components/CallPreview";
import { callText } from "../../lib/callText";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  Switch,
  View,
} from "react-native";
import AvatarPicker from "../../components/AvatarPicker";
import { useApp } from "../../context/AppContext";
import { clearChatMessages, sendMessage, subscribeMessages, type ChatMessage } from "../../lib/chat";
import { getZonedParts } from "../../lib/data";

export default function ChatScreen() {
  const { 
    colors, t, lang, 
    partnerName, setPartnerName, partner, partnerAvatarUri, setPartnerAvatarUri,
    myAvatarUri,
    uid,
    coupleId,
  } = useApp();
  const callCopy = callText(lang);
  const [callMode, setCallMode] = useState<"voice" | "video" | null>(null);
  useEffect(() => { setCallMode(null); }, [uid, coupleId]);
  const router = useRouter();
  const styles = makeStyles(colors);
  const [now] = useState(new Date());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [chatNotifications, setChatNotifications] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    AsyncStorage.getItem("closer_app:chat_notifications_enabled").then((value) => {
      if (value !== null) setChatNotifications(value === "true");
    });
  }, []);

  const toggleChatNotifications = async (enabled: boolean) => {
    setChatNotifications(enabled);
    await AsyncStorage.setItem("closer_app:chat_notifications_enabled", String(enabled));
  };

  const confirmClearChat = () => {
    setMenuVisible(false);
    Alert.alert(
      lang === "zh-Hant" ? "清除聊天紀錄？" : "Clear chat history?",
      lang === "zh-Hant" ? "這會刪除你們雙方的所有訊息，而且無法復原。" : "This deletes all messages for both of you and cannot be undone.",
      [
        { text: lang === "zh-Hant" ? "取消" : "Cancel", style: "cancel" },
        {
          text: lang === "zh-Hant" ? "清除" : "Clear",
          style: "destructive",
          onPress: async () => {
            if (!coupleId) return;
            setClearing(true);
            try {
              await clearChatMessages(coupleId);
              setMessages([]);
            } catch (error: any) {
              Alert.alert(
                lang === "zh-Hant" ? "無法清除聊天紀錄" : "Unable to clear chat",
                error?.message ?? (lang === "zh-Hant" ? "請稍後再試" : "Please try again later")
              );
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (!uid || !coupleId) {
      setMessages([]);
      return;
    }

    const unsub = subscribeMessages(
      uid,
      coupleId,
      (newMessages) => {
        setMessages(newMessages);
      }
    );

    return () => unsub();
  }, [uid, coupleId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const partnerParts = getZonedParts(now, partner.tz, lang);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;
    setSending(true);
    try {
      if (!uid || !coupleId) {
        Alert.alert("尚未配對", "請先和伴侶完成配對");
        return;
      }

      await sendMessage(text, uid, coupleId);
      setInputText("");
    } catch (e) {
      Alert.alert("發送失敗", "請稍後再試");
    } finally {
      setSending(false);
    }
  }, [inputText, uid, coupleId]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === "me";
    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowPartner]}>
        {!isMe && (
          <AvatarPicker
            uri={partnerAvatarUri}
            onChange={setPartnerAvatarUri}
            initials={partner.avatar}
            size={28}
            bgColor={colors.lavenderDeep}
          />
        )}
        <View
          style={[
            styles.bubble,
            isMe
              ? [styles.bubbleMe, { backgroundColor: colors.primary }]
              : [styles.bubblePartner, { backgroundColor: colors.bubblePartnerBg }],
          ]}
        >
          <Text style={[styles.messageText, { color: isMe ? "#fff" : colors.ink }]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, { color: isMe ? "rgba(255,255,255,0.7)" : colors.inkSoft }]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
        {isMe && (
          <AvatarPicker
            uri={myAvatarUri}
            onChange={() => {}}
            initials={"我"}
            size={28}
            bgColor={colors.primary}
          />
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={colors.screenBg as any} style={StyleSheet.absoluteFill} />
      
      {/* 頂部導航欄 - 顯示伴侶（小明）的資訊，點擊可編輯 */}
      <View style={[styles.header, { backgroundColor: colors.navBg, borderBottomColor: colors.hairline }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.ink} />
        </Pressable>
        
        <Pressable 
          onPress={() => {
            Alert.prompt(
              "編輯伴侶暱稱",
              "請輸入伴侶的名字",
              [
                { text: "取消", style: "cancel" },
                { 
                  text: "儲存", 
                  onPress: (text?: string) => {
                    if (text && text.trim()) {
                      setPartnerName(text.trim());
                    }
                  }
                }
              ],
              "plain-text",
              partnerName
            );
          }}
          style={styles.headerCenter}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, width: "100%" }}>
            <AvatarPicker
              uri={partnerAvatarUri}
              onChange={setPartnerAvatarUri}
              initials={partner.avatar}
              size={36}
              bgColor={colors.lavenderDeep}
            />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={[styles.headerName, { color: colors.ink }]}>{partnerName}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={[styles.onlineDot, { backgroundColor: "#4CD48A" }]} />
                <Text numberOfLines={1} style={[styles.headerSub, { color: colors.inkSoft }]}>
                  {t("online")} · {partner.city} {partnerParts.timeStr}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
        
        <Pressable accessibilityRole="button" accessibilityLabel={callCopy.voice}
          onPress={() => { setMenuVisible(false); setCallMode("voice"); }} style={styles.headerRight}>
          <Phone size={21} color={colors.primary} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={callCopy.video}
          onPress={() => { setMenuVisible(false); setCallMode("video"); }} style={styles.headerRight}>
          <Video size={23} color={colors.primary} />
        </Pressable>
        <Pressable onPress={() => setMenuVisible(true)} style={styles.headerRight}>
          <MoreVertical size={20} color={colors.ink} />
        </Pressable>
      </View>

      <CallPreview mode={callMode} lang={lang} partnerName={partnerName}
        avatarUri={partnerAvatarUri} accent={colors.primary} onClose={() => setCallMode(null)} />
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)}>
          <Pressable style={[styles.menuCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]} onPress={(event) => event.stopPropagation()}>
            <View style={styles.menuRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuTitle, { color: colors.ink }]}>{lang === "zh-Hant" ? "聊天通知" : "Chat notifications"}</Text>
                <Text style={[styles.menuSubtitle, { color: colors.inkSoft }]}>{chatNotifications ? (lang === "zh-Hant" ? "已開啟" : "On") : (lang === "zh-Hant" ? "已關閉" : "Off")}</Text>
              </View>
              <Switch
                value={chatNotifications}
                onValueChange={toggleChatNotifications}
                trackColor={{ false: colors.hairline, true: colors.primary }}
              />
            </View>
            <Pressable disabled={clearing || !coupleId} onPress={confirmClearChat} style={[styles.clearChatButton, { borderTopColor: colors.hairline }]}>
              <Text style={{ color: "#D94A4A", fontWeight: "700" }}>
                {clearing ? (lang === "zh-Hant" ? "清除中…" : "Clearing…") : (lang === "zh-Hant" ? "清除聊天紀錄" : "Clear chat history")}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        inverted={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={[styles.inputContainer, { borderTopColor: colors.hairline, backgroundColor: colors.cardBg }]}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder={t("chatPlaceholder", { name: partnerName })}
            placeholderTextColor={colors.inkSoft}
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.ink }]}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={sending || !inputText.trim()}
            style={[
              styles.sendBtn,
              { backgroundColor: inputText.trim() ? colors.primary : colors.hairline },
            ]}
          >
            <Text style={{ color: inputText.trim() ? "#fff" : colors.inkSoft, fontSize: 16, fontWeight: "700" }}>
              發送
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingTop: Platform.OS === "ios" ? 50 : 12,
      paddingBottom: 10,
      borderBottomWidth: 1,
    },
    backBtn: {
      padding: 4,
    },
    headerCenter: {
      flex: 1,
      minWidth: 0,
      paddingHorizontal: 6,
    },
    headerName: {
      fontSize: 16,
      fontWeight: "700",
    },
    headerSub: {
      fontSize: 11,
    },
    headerRight: {
      width: 44, height: 44, alignItems: "center", justifyContent: "center",
    },
    menuBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.18)",
      alignItems: "flex-end",
      paddingTop: Platform.OS === "ios" ? 92 : 58,
      paddingRight: 14,
    },
    menuCard: {
      width: 250,
      borderRadius: 16,
      borderWidth: 1,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.16,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    menuTitle: { fontSize: 14, fontWeight: "700" },
    menuSubtitle: { fontSize: 11, marginTop: 2 },
    clearChatButton: {
      paddingHorizontal: 16,
      paddingVertical: 15,
      borderTopWidth: 1,
    },
    onlineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    messageList: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      flexGrow: 1,
    },
    messageRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom: 8,
      gap: 6,
    },
    messageRowMe: {
      justifyContent: "flex-end",
    },
    messageRowPartner: {
      justifyContent: "flex-start",
    },
    bubble: {
      maxWidth: "75%",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
    },
    bubbleMe: {
      borderBottomRightRadius: 4,
    },
    bubblePartner: {
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: 14,
      lineHeight: 20,
    },
    messageTime: {
      fontSize: 9,
      marginTop: 4,
      alignSelf: "flex-end",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: 1,
      gap: 8,
    },
    input: {
      flex: 1,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
      fontSize: 14,
      maxHeight: 100,
      minHeight: 36,
    },
    sendBtn: {
      paddingHorizontal: 16,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
