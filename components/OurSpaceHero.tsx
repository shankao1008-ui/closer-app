import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowUpRight, Camera, Heart, MessageCircle, Settings, Sparkles, UserRound } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { homeDesignText } from '../lib/homeDesignText';
import OrbitHearts from './OrbitHearts';

export default function OurSpaceHero() {
  const { colors, gender, lang, myName, partnerName, myAvatarUri, partnerAvatarUri, coupleId, t } = useApp();
  const c = homeDesignText(lang), router = useRouter(), insets = useSafeAreaInsets();
  const warm = gender === 'feminine';
  const gradient = warm ? ['#713D68', '#A64E70', '#D47A79'] as const : ['#223E67', '#426E8B', '#67A8A5'] as const;
  return <View style={{ gap: 18 }}>
    <View style={[s.heading, { paddingTop: Math.max(insets.top, 20) }]}>
      <View><Text style={[s.brand, { color: colors.ink }]}>closer<Text style={{ color: colors.primary }}>.</Text></Text>
        <Text style={{ color: colors.inkSoft, fontSize: 12, marginTop: 3 }}>{c.tagline}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel={t('settingsTitle')} onPress={() => router.push('/settings')}
        style={({ pressed }) => [s.settings, { backgroundColor: colors.cardBg, transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
        <Settings size={21} color={colors.ink} />
      </Pressable>
    </View>
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
      <OrbitHearts />
      <View style={s.row}><View style={s.badge}><Sparkles size={13} color="#FFE8BE" /><Text style={s.badgeText}>{c.eyebrow}</Text></View>
        </View>
      <Text style={s.title}>{coupleId ? c.title : c.inviteTitle}</Text>
      <Text style={s.subtitle}>{coupleId ? c.subtitle : c.inviteSubtitle}</Text>
      <View style={[s.row, { marginTop: 24, gap: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Portrait uri={myAvatarUri} label={myName} />
          <View style={s.heartSeal}><Heart size={15} color="#854862" fill="#854862" /></View>
          <Portrait uri={coupleId ? partnerAvatarUri : null} label={coupleId ? partnerName : ''} />
        </View>
        <Text numberOfLines={2} style={s.names}>{coupleId ? `${myName || c.you} & ${partnerName || c.partner}` : c.waiting}</Text>
      </View>
      {!coupleId && <Pressable accessibilityRole="button" onPress={() => router.push('/pairing')}
        style={({ pressed }) => [s.pair, { opacity: pressed ? 0.85 : 1 }]}>
        <Text style={s.pairLabel}>{c.pair}</Text><ArrowUpRight size={20} color="#492D43" />
      </Pressable>}
    </LinearGradient>
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {([{ label: c.photo, Icon: Camera, path: '/(tabs)/photo', bg: '#FFE6CD', ink: '#744B2C' },
        { label: c.chat, Icon: MessageCircle, path: '/(tabs)/chat', bg: '#E2EBDD', ink: '#395A48' }] as const).map(({ label, Icon, path, bg, ink }) =>
        <Pressable key={path} accessibilityRole="button" onPress={() => router.push(path)}
          style={({ pressed }) => [s.action, { backgroundColor: bg, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
          <View style={s.row}><Icon size={23} color={ink} /><ArrowUpRight size={17} color={ink} /></View>
          <Text style={{ color: ink, fontWeight: '700', fontSize: 15, marginTop: 18 }}>{label}</Text>
        </Pressable>)}
    </View>
  </View>;
}
function Portrait({ uri, label }: { uri: string | null; label: string }) {
  return <View style={s.portrait}>{uri ? <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
    : label ? <Text style={{ color: '#65435D', fontSize: 24, fontWeight: '700' }}>{Array.from(label)[0]}</Text>
    : <UserRound color="#65435D" size={26} />}</View>;
}
const s = StyleSheet.create({
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 4 },
  brand: { fontSize: 34, fontWeight: '800', letterSpacing: -1.5 },
  settings: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: 32, padding: 25, overflow: 'hidden', minHeight: 280 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 30, backgroundColor: '#FFFFFF20', paddingHorizontal: 12, paddingVertical: 8 },
  badgeText: { color: '#FFF3E5', fontWeight: '700', fontSize: 11, letterSpacing: 1 },
  title: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', lineHeight: 39, marginTop: 22, letterSpacing: -0.7 },
  subtitle: { fontSize: 14, lineHeight: 21, color: '#FFF1EE', marginTop: 10, maxWidth: 275 },
  portrait: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F6E9E3', borderWidth: 3, borderColor: '#FFFFFF', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  heartSeal: { zIndex: 1, backgroundColor: '#FFDDBC', borderRadius: 18, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', marginHorizontal: -5 },
  names: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '600', lineHeight: 22 },
  pair: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF2DD', padding: 16, borderRadius: 18, marginTop: 22, minHeight: 52 },
  pairLabel: { color: '#492D43', fontSize: 15, fontWeight: '800', flex: 1 },
  action: { flex: 1, borderRadius: 24, padding: 19, minHeight: 115 },
});
