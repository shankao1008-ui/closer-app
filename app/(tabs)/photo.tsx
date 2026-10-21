import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Image as ImageIcon, Images, Send, Type, Heart, Sparkles, ChevronDown, ChevronUp, Check } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Animated,
  ActivityIndicator,
  Alert,
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
import { photoText, photoCaption, photoError } from "../../lib/photoText";
import { sendPartnerWidgetPhoto } from "../../lib/widgetSync";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import PhotoGlow from "../../components/PhotoGlow";
import { photoDesignText } from "../../lib/photoDesignText";
import ReceivedPhoto from "../../components/ReceivedPhoto";
import { receivedPhotoText } from "../../lib/receivedPhotoText";

const FONTS = ["defaultFont", "handwriting", "rounded", "bold"] as const;
const TEXT_COLORS = ["#FFFFFF", "#000000", "#FF6B6B", "#FF8A65", "#CE93D8"];
const SIZES = [
  { key: "small", label: "small" as const, fontSize: 18 },
  { key: "medium", label: "medium" as const, fontSize: 26 },
  { key: "large", label: "large" as const, fontSize: 36 },
];

export default function PhotoScreen() {
  const { colors, t, lang, gender, uid, coupleId } = useApp();
  const copy = photoText(lang);
  const design = photoDesignText(lang);
  const insets = useSafeAreaInsets();
  const [showStyle, setShowStyle] = useState(false);
  const inboxCopy = receivedPhotoText(lang);
  const styles = makeStyles(colors);
  const canvasGradient = gender === "masculine"
    ? (["#B9E6FF", "#5A9BE7", "#3156A6"] as const)
    : (["#FFCFA8", "#FF8A65", "#CE93D8"] as const);
  const [draft, setText] = useState<string | null>(null);
  const text = photoCaption(draft, lang);
  const [font, setFont] = useState<(typeof FONTS)[number]>(FONTS[0]);
  const [color, setColor] = useState(TEXT_COLORS[0]);
  const [sizeKey, setSizeKey] = useState("medium");
  const [sent, setSent] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) { Alert.alert(copy.cameraTitle, copy.cameraBody); return; }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true, aspect: [4, 5] });
      if (!result.canceled && result.assets?.[0]) setPhotoUri(result.assets[0].uri);
    } catch { Alert.alert(copy.cameraFailed, copy.tryAgain); }
  };

  const pickFromLibrary = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert(copy.libraryTitle, copy.libraryBody); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8, allowsEditing: true, aspect: [4, 5] });
      if (!result.canceled && result.assets?.[0]) setPhotoUri(result.assets[0].uri);
    } catch { Alert.alert(copy.pickerFailed, copy.tryAgain); }
  };

  const canvasSize = useRef({ width: 0, height: 0 });
  const pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [textLayout, setTextLayout] = useState({ width: 0, height: 0 });
  const textSize = useRef({ width: 0, height: 0 });

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
    const minX = -cw / 2 + textSize.current.width / 2 + 8;
    const maxX = cw / 2 - textSize.current.width / 2 - 8;
    const minY = -ch * 0.78 + textSize.current.height / 2 + 8;
    const maxY = ch * 0.22 - textSize.current.height / 2 - 8;
    const nx = Math.max(minX, Math.min(maxX, cur.x));
    const ny = Math.max(minY, Math.min(maxY, cur.y));
    Animated.spring(pos, { toValue: { x: nx, y: ny }, useNativeDriver: false, friction: 6 }).start();
  };

  const onCanvasLayout = (e: LayoutChangeEvent) => {
    canvasSize.current = { width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height };
  };

  const sizeInfo = SIZES.find((s) => s.key === sizeKey)!;

  const handleSend = async () => {
    if (!uid || !coupleId) {
      Alert.alert(copy.pairingTitle, copy.pairingBody);
      return;
    }
    if (!photoUri) {
      Alert.alert(copy.chooseTitle, copy.chooseBody);
      return;
    }
    if (sending) return;
    setSending(true);
    try {
      await sendPartnerWidgetPhoto({ uri: photoUri, coupleId, senderId: uid, caption: text });
    } catch (error: any) {
      Alert.alert(copy.sendFailed, photoError(error, lang));
      return;
    } finally {
      setSending(false);
    }
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
      <ScrollView contentContainerStyle={[styles.body, { paddingTop: insets.top + 18 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}><Text style={{ color: colors.ink, fontSize: 32, fontWeight: "800", letterSpacing: -1 }}>{t("tabPhoto")}<Text style={{ color: colors.primary }}>.</Text></Text>
            <Text style={{ color: colors.inkSoft, fontSize: 14, lineHeight: 21, marginTop: 6 }}>{design.subtitle}</Text></View>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.cardBg, alignItems: "center", justifyContent: "center" }}><Heart size={22} color={colors.primary} fill={colors.primary + "20"} /></View>
        </View>
        <View style={styles.postcard}>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center", padding: 8, paddingBottom: 16 }}><Sparkles size={17} color={colors.primaryDeep} /><Text style={{ color: colors.ink, fontSize: 15, fontWeight: "700", flex: 1 }}>{design.create}</Text></View>
        {/* photo canvas */}
        <View style={styles.canvasWrap} onLayout={onCanvasLayout}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <>
              <PhotoGlow cool={gender === "masculine"} />
              <Pressable accessibilityRole="button" accessibilityLabel={copy.choosePhoto} disabled={sending} onPress={pickFromLibrary} style={styles.canvasIconWrap}>
                <View style={styles.addIcon}><ImageIcon size={32} color="#694660" /><View style={styles.plus}><Text style={{ color: "#694660", fontSize: 20, fontWeight: "700" }}>+</Text></View></View>
                <Text style={{ color: "#493447", fontSize: 17, fontWeight: "800", marginTop: 18 }}>{design.add}</Text>
              </Pressable>
            </>
          )}
          <Animated.View
            {...panResponder.panHandlers}
            onLayout={(e) => { const measured = { width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height }; textSize.current = measured; setTextLayout(measured); }}
            style={[
              styles.dragText,
              { marginLeft: -textLayout.width / 2, marginTop: -textLayout.height / 2, transform: [{ translateX: pos.x }, { translateY: pos.y }] },
            ]}
          >
            <Text
              style={{
                color, fontSize: sizeInfo.fontSize,
                fontFamily: font === "handwriting" ? Platform.select({ ios: "Noteworthy", android: "cursive" }) : font === "rounded" ? Platform.select({ ios: "Avenir Next", android: "sans-serif-medium" }) : undefined,
                textAlign: "center",
                fontWeight: font === "bold" ? "800" : "600",
                textShadowColor: "rgba(0,0,0,0.25)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
              }}
            >
              {text || "..."}
            </Text>
          </Animated.View>
          <View style={[styles.dragHintTag, { backgroundColor: gender === "masculine" ? "rgba(26,54,93,0.55)" : "rgba(181,75,48,0.55)" }]}>
            <Text style={{ color: "#fff", fontSize: 10.5, fontWeight: "700" }}>{t("dragHint")}</Text>
          </View>
        </View>

        </View>

        {/* take photo / choose from library */}
        <View style={styles.photoActionRow}>
          <Pressable accessibilityRole="button" disabled={sending} onPress={takePhoto} style={[styles.photoActionBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Camera size={16} color={colors.primaryDeep} />
            <Text style={{ color: colors.ink, fontWeight: "700", fontSize: 12.5, marginLeft: 6, flexShrink: 1, textAlign: "center" }}>{copy.takePhoto}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={sending} onPress={pickFromLibrary} style={[styles.photoActionBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Images size={16} color={colors.primaryDeep} />
            <Text style={{ color: colors.ink, fontWeight: "700", fontSize: 12.5, marginLeft: 6, flexShrink: 1, textAlign: "center" }}>{copy.choosePhoto}</Text>
          </Pressable>
        </View>

        {/* controls */}
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.textRow}>
            <Type size={15} color={colors.inkSoft} />
            <TextInput
              accessibilityLabel={t("textPlaceholder")}
              editable={!sending}
              value={text}
              onChangeText={(v) => setText(v.slice(0, 30))}
              placeholder={t("textPlaceholder")}
              placeholderTextColor={colors.inkSoft}
              style={{ flex: 1, fontSize: 13, color: colors.ink, marginLeft: 8 }}
            />
            <Text style={{ fontSize: 10, color: colors.inkSoft }}>{text.length}/30</Text>
          </View>

          <Pressable accessibilityRole="button" accessibilityState={{ expanded: showStyle }} onPress={() => setShowStyle(value => !value)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 }}>
            <Text style={{ color: colors.ink, fontWeight: "700" }}>{design.style}</Text>{showStyle ? <ChevronUp size={18} color={colors.inkSoft} /> : <ChevronDown size={18} color={colors.inkSoft} />}
          </Pressable>
          {showStyle && <>
          <View style={styles.chipRow}>
            {FONTS.map((f) => (
              <Pressable
                accessibilityRole="button" accessibilityState={{ selected: font === f }}
                key={f}
                onPress={() => setFont(f)}
                style={[styles.fontChip, { backgroundColor: font === f ? colors.ink : colors.hairline }]}
              >
                <Text style={{ fontSize: 11.5, color: font === f ? "#fff" : colors.ink, fontWeight: "600" }}>{copy[f]}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.colorRow}>
            {TEXT_COLORS.map((c) => (
              <Pressable
                accessibilityRole="button" accessibilityLabel={c} accessibilityState={{ selected: color === c }}
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
                accessibilityRole="button" accessibilityState={{ selected: sizeKey === s.key }}
                key={s.key}
                onPress={() => setSizeKey(s.key)}
                style={[styles.sizeChip, { backgroundColor: sizeKey === s.key ? colors.primary : colors.hairline }]}
              >
                <Text style={{ fontSize: 12, color: sizeKey === s.key ? "#fff" : colors.ink, fontWeight: "700" }}>{copy[s.label]}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ color: colors.inkSoft, fontSize: 12, lineHeight: 18 }}>{design.preview}</Text>
          </>}
        </View>

        <Pressable accessibilityRole="button" accessibilityState={{ disabled: sending, busy: sending }} onPress={handleSend} disabled={sending} style={[styles.sendBtnWrap, { opacity: sending ? 0.65 : 1 }]}>
          <LinearGradient colors={[colors.primary, colors.lavenderDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sendBtn}>
            {sending ? <ActivityIndicator color="#fff" size="small" /> : <Send size={16} color="#fff" />}
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14, marginLeft: 8, flexShrink: 1, textAlign: "center" }}>{sending ? copy.sending : inboxCopy.send}</Text>
          </LinearGradient>
        </Pressable>
        <ReceivedPhoto />
      </ScrollView>

      {sent && (
        <Animated.View pointerEvents="none" style={[styles.overlay, { opacity: fadeAnim }]}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.widgetPreview} resizeMode="cover" />
          ) : (
            <LinearGradient colors={canvasGradient} style={styles.widgetPreview} />
          )}
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15, marginTop: -34 }}>{text}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 20 }}><Check size={22} color="#fff" /><Text accessibilityRole="alert" style={{ color: "#fff", fontWeight: "700", fontSize: 17 }}>{inboxCopy.sent}</Text></View>
        </Animated.View>
      )}
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    body: { flexGrow: 1, padding: 20, paddingBottom: 48, gap: 18 },
    postcard: { backgroundColor: colors.cardBg, borderRadius: 32, padding: 10, shadowColor: "#77495E", shadowOpacity: 0.09, shadowRadius: 18, shadowOffset: { width: 0, height: 7 } },
    addIcon: { width: 76, height: 76, borderRadius: 26, backgroundColor: "#FFF8F0D9", alignItems: "center", justifyContent: "center", transform: [{ rotate: "-7deg" }] },
    plus: { position: "absolute", bottom: -5, right: -5, width: 28, height: 28, borderRadius: 14, backgroundColor: "#FFE1CB", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFF8F0" },
    canvasWrap: { width: "100%", aspectRatio: 4 / 5, borderRadius: 22, overflow: "hidden" },
    canvasIconWrap: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
    dragText: { position: "absolute", left: "50%", top: "78%", maxWidth: "85%" },
    dragHintTag: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.3)", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100 },
    photoActionRow: { flexDirection: "row", gap: 10 },
    photoActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", minHeight: 54, paddingHorizontal: 12, paddingVertical: 14, borderRadius: 20, borderWidth: 1 },
    card: { borderRadius: 26, padding: 16, borderWidth: 1, gap: 12 },
    textRow: { flexDirection: "row", alignItems: "center", minHeight: 48, backgroundColor: colors.hairline, borderRadius: 16, paddingHorizontal: 12 },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    fontChip: { flexGrow: 1, flexBasis: "40%", alignItems: "center", paddingHorizontal: 4, minHeight: 44, justifyContent: "center", paddingVertical: 10, borderRadius: 100 },
    sizeChip: { flex: 1, alignItems: "center", minHeight: 44, justifyContent: "center", paddingVertical: 10, borderRadius: 100 },
    colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    colorDot: { width: 40, height: 40, borderRadius: 20 },
    sendBtnWrap: { borderRadius: 22, overflow: "hidden" },
    sendBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", minHeight: 58, paddingHorizontal: 16, paddingVertical: 18 },
    overlay: {
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(20,14,20,0.9)",
      alignItems: "center", justifyContent: "center",
    },
    widgetPreview: { width: 150, height: 150, borderRadius: 26, overflow: "hidden", alignItems: "center" },
  });
}
