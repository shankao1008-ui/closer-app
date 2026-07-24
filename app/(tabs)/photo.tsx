import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Image as ImageIcon, Images, Send, Type } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useApp } from "../../context/AppContext";

const FONTS = ["預設", "手寫", "圓體", "黑體"];
const TEXT_COLORS = ["#FFFFFF", "#000000", "#FF6B6B", "#FF8A65", "#CE93D8"];
const SIZES = [
  { key: "small", label: "小", fontSize: 18 },
  { key: "medium", label: "中", fontSize: 26 },
  { key: "large", label: "大", fontSize: 36 },
];

export default function PhotoScreen() {
  const { colors, t, partner } = useApp();
  const styles = makeStyles(colors);
  const [text, setText] = useState("想你了");
  const [font, setFont] = useState(FONTS[0]);
  const [color, setColor] = useState(TEXT_COLORS[0]);
  const [sizeKey, setSizeKey] = useState("medium");
  const [sent, setSent] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true, aspect: [4, 5] });
    if (!result.canceled && result.assets?.[0]) setPhotoUri(result.assets[0].uri);
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8, allowsEditing: true, aspect: [4, 5] });
    if (!result.canceled && result.assets?.[0]) setPhotoUri(result.assets[0].uri);
  };

  const canvasSize = useRef({ width: 0, height: 0 });
  const pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [textLayout, setTextLayout] = useState({ width: 0, height: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        (pos as any).setOffset({ x: (pos.x as any)._value, y: (pos.y as any)._value });
        (pos as any).setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pos.x, dy: pos.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        (pos as any).flattenOffset();
        clampPosition();
      },
    })
  ).current;

  const clampPosition = () => {
    const cw = canvasSize.current.width;
    const ch = canvasSize.current.height;
    const cur = { x: (pos.x as any)._value, y: (pos.y as any)._value };
    const minX = -cw / 2 + textLayout.width / 2 + 8;
    const maxX = cw / 2 - textLayout.width / 2 - 8;
    const minY = -ch / 2 + textLayout.height / 2 + 8;
    const maxY = ch / 2 - textLayout.height / 2 - 8;
    const nx = Math.max(minX, Math.min(maxX, cur.x));
    const ny = Math.max(minY, Math.min(maxY, cur.y));
    Animated.spring(pos, { toValue: { x: nx, y: ny }, useNativeDriver: false, friction: 6 }).start();
  };

  const onCanvasLayout = (e: LayoutChangeEvent) => {
    canvasSize.current = { width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height };
  };

  const sizeInfo = SIZES.find((s) => s.key === sizeKey)!;

  const handleSend = () => {
    setSent(true);
    fadeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setSent(false));
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={colors.screenBg as any} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* photo canvas */}
        <View style={styles.canvasWrap} onLayout={onCanvasLayout}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <>
              <LinearGradient colors={["#FFCFA8", "#FF8A65", "#CE93D8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <View style={styles.canvasIconWrap}>
                <ImageIcon size={54} color="rgba(255,255,255,0.35)" />
              </View>
            </>
          )}
          <Animated.View
            {...panResponder.panHandlers}
            onLayout={(e) => setTextLayout({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
            style={[
              styles.dragText,
              { transform: [{ translateX: pos.x }, { translateY: pos.y }] },
            ]}
          >
            <Text
              style={{
                color, fontSize: sizeInfo.fontSize,
                fontWeight: font === "黑體" ? "800" : "600",
                textShadowColor: "rgba(0,0,0,0.25)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
              }}
            >
              {text || "..."}
            </Text>
          </Animated.View>
          <View style={styles.dragHintTag}>
            <Text style={{ color: "#fff", fontSize: 10.5, fontWeight: "700" }}>{t("dragHint")}</Text>
          </View>
        </View>

        {/* take photo / choose from library */}
        <View style={styles.photoActionRow}>
          <Pressable onPress={takePhoto} style={[styles.photoActionBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Camera size={16} color={colors.primaryDeep} />
            <Text style={{ color: colors.ink, fontWeight: "700", fontSize: 12.5, marginLeft: 6 }}>拍照</Text>
          </Pressable>
          <Pressable onPress={pickFromLibrary} style={[styles.photoActionBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Images size={16} color={colors.primaryDeep} />
            <Text style={{ color: colors.ink, fontWeight: "700", fontSize: 12.5, marginLeft: 6 }}>從相簿選取</Text>
          </Pressable>
        </View>

        {/* controls */}
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.textRow}>
            <Type size={15} color={colors.inkSoft} />
            <TextInput
              value={text}
              onChangeText={(v) => setText(v.slice(0, 30))}
              placeholder={t("textPlaceholder")}
              placeholderTextColor={colors.inkSoft}
              style={{ flex: 1, fontSize: 13, color: colors.ink, marginLeft: 8 }}
            />
            <Text style={{ fontSize: 10, color: colors.inkSoft }}>{text.length}/30</Text>
          </View>

          <View style={styles.chipRow}>
            {FONTS.map((f) => (
              <Pressable
                key={f}
                onPress={() => setFont(f)}
                style={[styles.fontChip, { backgroundColor: font === f ? colors.ink : colors.hairline }]}
              >
                <Text style={{ fontSize: 11.5, color: font === f ? "#fff" : colors.ink, fontWeight: "600" }}>{f}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.colorRow}>
            {TEXT_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorDot,
                  { backgroundColor: c, borderColor: color === c ? colors.primaryDeep : colors.hairline, borderWidth: color === c ? 2 : 1.5 },
                ]}
              />
            ))}
          </View>

          <View style={styles.chipRow}>
            {SIZES.map((s) => (
              <Pressable
                key={s.key}
                onPress={() => setSizeKey(s.key)}
                style={[styles.sizeChip, { backgroundColor: sizeKey === s.key ? colors.primary : colors.hairline }]}
              >
                <Text style={{ fontSize: 12, color: sizeKey === s.key ? "#fff" : colors.ink, fontWeight: "700" }}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable onPress={handleSend} style={styles.sendBtnWrap}>
          <LinearGradient colors={[colors.primary, colors.lavenderDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sendBtn}>
            <Send size={16} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14, marginLeft: 8 }}>{t("sendToWidget")}</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>

      {sent && (
        <Animated.View pointerEvents="none" style={[styles.overlay, { opacity: fadeAnim }]}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.widgetPreview} resizeMode="cover" />
          ) : (
            <LinearGradient colors={["#FFCFA8", "#FF8A65", "#CE93D8"]} style={styles.widgetPreview} />
          )}
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15, marginTop: -34 }}>{text || "想你了"}</Text>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15, marginTop: 16 }}>{t("widgetUpdated")}</Text>
        </Animated.View>
      )}
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    body: { flexGrow: 1, padding: 16, paddingTop: Platform.OS === "ios" ? 60 : 32, paddingBottom: 50, gap: 14 },
    canvasWrap: { width: "100%", aspectRatio: 4 / 5, borderRadius: 22, overflow: "hidden" },
    canvasIconWrap: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
    dragText: { position: "absolute", left: "50%", top: "78%" },
    dragHintTag: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.3)", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100 },
    photoActionRow: { flexDirection: "row", gap: 10 },
    photoActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 16, borderWidth: 1 },
    card: { borderRadius: 20, padding: 16, borderWidth: 1, gap: 12 },
    textRow: { flexDirection: "row", alignItems: "center" },
    chipRow: { flexDirection: "row", gap: 8 },
    fontChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100 },
    sizeChip: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 100 },
    colorRow: { flexDirection: "row", gap: 10 },
    colorDot: { width: 24, height: 24, borderRadius: 12 },
    sendBtnWrap: { borderRadius: 18, overflow: "hidden" },
    sendBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14 },
    overlay: {
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(20,14,20,0.9)",
      alignItems: "center", justifyContent: "center",
    },
    widgetPreview: { width: 150, height: 150, borderRadius: 26, overflow: "hidden", alignItems: "center" },
  });
}
