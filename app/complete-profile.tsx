import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, UserRound } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useApp } from "../context/AppContext";

export default function CompleteProfileScreen() {
  const { colors, lang, completeProfile, signOut } = useApp();
  const en = lang === "en";
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showDate, setShowDate] = useState(false);
  const [saving, setSaving] = useState(false);

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setAvatarUri(result.assets[0].uri);
  };
  const changeDate = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== "ios") setShowDate(false);
    if (date) setBirthDate(date);
  };
  const submit = async () => {
    if (!name.trim() || !birthDate || !avatarUri) {
      Alert.alert(en ? "Complete every field" : "請完成所有資料", en ? "Name, birthday and profile photo are required." : "姓名、生日與大頭照皆為必填。" );
      return;
    }
    setShowDate(false);
    setSaving(true);
    try {
      const isoDate = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, "0")}-${String(birthDate.getDate()).padStart(2, "0")}`;
      await completeProfile({ name, birthDate: isoDate, avatarUri });
    } catch (error: any) {
      Alert.alert(en ? "Unable to save profile" : "無法儲存個人資料", error?.message ?? (en ? "Please try again." : "請稍後再試。"));
    } finally { setSaving(false); }
  };

  return (
    <LinearGradient colors={colors.screenBg as any} style={styles.root}>
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.title, { color: colors.ink }]}>{en ? "Create your profile" : "建立你的個人資料"}</Text>
        <Text style={[styles.subtitle, { color: colors.inkSoft }]}>{en ? "Tell your partner a little about you." : "讓伴侶更認識你。"}</Text>
        <Pressable onPress={choosePhoto} style={[styles.avatar, { backgroundColor: colors.chipBg, borderColor: colors.primary }]}>
          {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} /> : <><Camera size={26} color={colors.primaryDeep} /><Text style={{ color: colors.primaryDeep, fontSize: 11, marginTop: 6 }}>{en ? "Add photo" : "選擇照片"}</Text></>}
        </Pressable>
        <View style={[styles.inputRow, { backgroundColor: colors.inputBg }]}><UserRound size={17} color={colors.inkSoft} /><TextInput value={name} onChangeText={setName} placeholder={en ? "Your name" : "你的名字"} placeholderTextColor={colors.inkSoft} style={[styles.input, { color: colors.ink }]} /></View>
        <Pressable onPress={() => setShowDate(true)} style={[styles.dateButton, { backgroundColor: colors.inputBg }]}><Text style={{ color: birthDate ? colors.ink : colors.inkSoft }}>{birthDate ? birthDate.toLocaleDateString() : (en ? "Select your birthday" : "選擇出生日期")}</Text></Pressable>
        {showDate && <DateTimePicker value={birthDate ?? new Date(2000, 0, 1)} mode="date" maximumDate={new Date()} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={changeDate} />}
        {Platform.OS === "ios" && showDate && <Pressable onPress={() => setShowDate(false)}><Text style={{ color: colors.primaryDeep, textAlign: "right", fontWeight: "700", marginTop: 6 }}>{en ? "Done" : "完成"}</Text></Pressable>}
        <Pressable disabled={saving} onPress={submit} style={[styles.button, { backgroundColor: colors.primary, opacity: saving ? 0.65 : 1 }]}>{saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{en ? "Complete Profile" : "完成個人資料"}</Text>}</Pressable>
        <Pressable disabled={saving} onPress={signOut}><Text style={[styles.signOut, { color: colors.inkSoft }]}>{en ? "Use another email" : "使用其他 Email"}</Text></Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "center", padding: 22 }, card: { borderWidth: 1, borderRadius: 26, padding: 20 },
  title: { fontSize: 24, fontWeight: "800", textAlign: "center" }, subtitle: { fontSize: 13, textAlign: "center", marginTop: 6, marginBottom: 20 },
  avatar: { width: 104, height: 104, borderRadius: 52, borderWidth: 2, alignSelf: "center", alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: 20 },
  avatarImage: { width: "100%", height: "100%" }, inputRow: { flexDirection: "row", alignItems: "center", borderRadius: 15, paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 15, paddingVertical: 14, marginLeft: 8 }, dateButton: { borderRadius: 15, paddingHorizontal: 14, paddingVertical: 15, marginTop: 12 },
  button: { minHeight: 50, borderRadius: 999, alignItems: "center", justifyContent: "center", marginTop: 18 }, buttonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  signOut: { textAlign: "center", fontSize: 12, marginTop: 16 },
});
