import * as ImagePicker from "expo-image-picker";
import { Camera, Images, X } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "../context/AppContext";
import { persistPhoto } from "../lib/storage";

type Props = {
  uri: string | null;
  onChange: (uri: string) => void;
  initials: string;
  size?: number;
  bgColor: string;
};

export default function AvatarPicker({ uri, onChange, initials, size = 40, bgColor }: Props) {
  const { colors, t } = useApp();
  const [open, setOpen] = useState(false);

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled && result.assets?.[0]) {
      const permanentUri = await persistPhoto(result.assets[0].uri, "avatar");
      onChange(permanentUri);
    }
    setOpen(false);
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled && result.assets?.[0]) {
      const permanentUri = await persistPhoto(result.assets[0].uri, "avatar");
      onChange(permanentUri);
    }
    setOpen(false);
  };

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
        {uri ? (
          <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" />
        ) : (
          <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: size * 0.38 }}>{initials}</Text>
          </View>
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.card, { backgroundColor: colors.cardBg }]} onPress={(e) => e.stopPropagation()}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <Text style={{ fontWeight: "700", fontSize: 14, color: colors.ink }}>{t("changeAvatarTitle")}</Text>
              <Pressable onPress={() => setOpen(false)}><X size={16} color={colors.inkSoft} /></Pressable>
            </View>
            <Pressable onPress={takePhoto} style={[styles.option, { backgroundColor: colors.chipBg }]}>
              <Camera size={16} color={colors.primaryDeep} />
              <Text style={{ marginLeft: 8, color: colors.ink, fontWeight: "600", fontSize: 13 }}>{t("takePhotoLabel")}</Text>
            </Pressable>
            <Pressable onPress={pickFromLibrary} style={[styles.option, { backgroundColor: colors.chipBg, marginTop: 8 }]}>
              <Images size={16} color={colors.primaryDeep} />
              <Text style={{ marginLeft: 8, color: colors.ink, fontWeight: "600", fontSize: 13 }}>{t("chooseLibraryLabel")}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(20,14,20,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", borderRadius: 22, padding: 18 },
  option: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14 },
});
