import React from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MicOff, VideoOff, Phone, Video } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { callText } from '../lib/callText';

type Props = {
  mode: 'voice' | 'video' | null;
  lang: string;
  partnerName: string;
  avatarUri: string | null;
  accent: string;
  onClose: () => void;
};

// UI only: never requests media access, sends invitations, or changes call state remotely.
export default function CallPreview({ mode, lang, partnerName, avatarUri, accent, onClose }: Props) {
  const copy = callText(lang);
  const insets = useSafeAreaInsets();
  const isVideo = mode === 'video';
  return (
    <Modal visible={mode !== null} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <ScrollView style={styles.screen} contentContainerStyle={[styles.content,
        { paddingTop: Math.max(insets.top, 24) + 20, paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        <Text style={styles.badge}>{copy.preview}</Text>
        <View style={styles.titleRow}>
          {isVideo ? <Video color={accent} size={24} /> : <Phone color={accent} size={24} />}
          <Text style={styles.title}>{isVideo ? copy.video : copy.voice}</Text>
        </View>
        <View style={[styles.stage, isVideo && styles.videoStage]}>
          {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatar} /> :
            <View style={[styles.avatar, styles.initial, { backgroundColor: accent }]}>
              <Text style={styles.initialText}>{Array.from(partnerName)[0] || '?'}</Text>
            </View>}
          <Text style={styles.name}>{partnerName}</Text>
          {isVideo && <VideoOff size={30} color="#ABA6B3" />}
        </View>
        <Text accessibilityRole="alert" style={styles.notice}>{copy.unavailable}</Text>
        <View style={styles.controls}>
          <View style={styles.inactive}>
            <MicOff color="#ABA6B3" size={25} />
            <Text style={styles.controlText}>{copy.microphone}</Text>
          </View>
          {isVideo && <View style={styles.inactive}>
            <VideoOff color="#ABA6B3" size={25} />
            <Text style={styles.controlText}>{copy.camera}</Text>
          </View>}
        </View>
        <Pressable accessibilityRole="button" onPress={onClose} style={[styles.close, { backgroundColor: accent }]}>
          <Text style={styles.closeText}>{copy.close}</Text>
        </Pressable>
      </ScrollView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#211C29' },
  content: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, gap: 24 },
  badge: { color: '#E1D8E9', backgroundColor: '#393043', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', flexShrink: 1 },
  stage: { alignItems: 'center', justifyContent: 'center', gap: 20, width: '100%', paddingVertical: 28 },
  videoStage: { backgroundColor: '#302838', borderRadius: 24, minHeight: 250 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  initial: { alignItems: 'center', justifyContent: 'center' },
  initialText: { fontSize: 36, color: '#FFFFFF' },
  name: { color: '#FFFFFF', fontWeight: '700', fontSize: 26, textAlign: 'center', paddingHorizontal: 12 },
  notice: { color: '#EEE7F2', fontSize: 16, lineHeight: 25, textAlign: 'center' },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 20, width: '100%' },
  inactive: { flex: 1, alignItems: 'center', gap: 12, paddingVertical: 12 },
  controlText: { color: '#ABA6B3', textAlign: 'center', fontSize: 13 },
  close: { minHeight: 48, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 28, marginTop: 'auto' },
  closeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16, textAlign: 'center' },
});
