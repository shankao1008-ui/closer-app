import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowUpRight, Heart, Images, MapPin, Sparkles, UserRound } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { localizeCityName } from '../lib/cities';
import { usDesignText } from '../lib/usDesignText';
import OrbitHearts from './OrbitHearts';

export default function UsStory({ days }: { days: number | null }) {
  const { lang, gender, coupleId, myName, partnerName, myAvatarUri, partnerAvatarUri, myCity, partner, t } = useApp();
  const c = usDesignText(lang), router = useRouter();
  return <View style={{ gap: 18 }}>
    <LinearGradient colors={gender === 'masculine' ? ['#284F68', '#548F99'] : ['#734965', '#B76E87']} style={s.cover}>
      <OrbitHearts />
      <Text style={s.eyebrow}>{c.title}</Text>
      <View style={s.people}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('settingsTitle')} onPress={() => router.push('/settings')} style={s.person}>
          <Portrait uri={myAvatarUri} name={myName || c.you} /><Text style={s.name}>{myName || c.you}</Text>
        </Pressable>
        <View style={s.seal}><Heart size={20} color="#91556C" fill="#91556C" /></View>
        <View style={s.person}><Portrait uri={coupleId ? partnerAvatarUri : null} name={coupleId ? partnerName : ''} /><Text style={s.name}>{coupleId ? partnerName || c.partner : c.partner}</Text></View>
      </View>
      {coupleId ? <>
        {days !== null && <View style={s.counter}><Text style={s.days}>{days.toLocaleString()}</Text><Text style={s.caption}>{t('daysWord')} · {t('togetherLabel')}</Text></View>}
        <View style={s.cities}><MapPin size={14} color="#FFE9D6" /><Text style={s.city}>{localizeCityName(myCity.name, lang)}  ·  {partner.city}</Text></View>
      </> : <>
        <Text style={s.emptyTitle}>{c.emptyTitle}</Text><Text style={s.caption}>{c.emptyBody}</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/pairing')} style={s.pair}><Text style={{ color: '#573B50', fontWeight: '800', flex: 1 }}>{c.pair}</Text><ArrowUpRight size={20} color="#573B50" /></Pressable>
      </>}
    </LinearGradient>
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {([{ title: c.moments, sub: c.momentsSub, path: '/together', Icon: Images, bg: '#EAE3F2', ink: '#695378' }, { title: c.wishes, sub: c.wishesSub, path: '/wishes', Icon: Sparkles, bg: '#FAE6D1', ink: '#835A39' }] as const).map(item =>
        <Pressable key={item.path} accessibilityRole="button" onPress={() => router.push(item.path)} style={({ pressed }) => [s.link, { backgroundColor: item.bg, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><item.Icon size={24} color={item.ink} /><ArrowUpRight size={16} color={item.ink} /></View>
          <Text style={{ color: item.ink, fontSize: 17, fontWeight: '800', marginTop: 16 }}>{item.title}</Text>
          <Text style={{ color: item.ink, fontSize: 12, lineHeight: 18, marginTop: 5 }}>{item.sub}</Text>
        </Pressable>)}
    </View>
  </View>;
}
function Portrait({ uri, name }: { uri: string | null; name: string }) {
  return <View style={s.avatar}>{uri ? <Image source={{ uri }} style={{ width: '100%', height: '100%' }} /> : name ? <Text style={{ color: '#80596E', fontSize: 30, fontWeight: '700' }}>{Array.from(name)[0]}</Text> : <UserRound size={32} color="#80596E" />}</View>;
}
const s = StyleSheet.create({
  cover: { borderRadius: 32, padding: 24, overflow: 'hidden' },
  eyebrow: { color: '#FFE9D6', textAlign: 'center', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  people: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginTop: 26 },
  person: { flex: 1, alignItems: 'center', gap: 10 },
  avatar: { width: 82, height: 82, borderRadius: 30, borderWidth: 3, borderColor: '#FFF1E3', backgroundColor: '#F4E4EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  name: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  seal: { marginTop: 23, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFE4CC' },
  counter: { alignItems: 'center', marginTop: 20 },
  days: { color: '#FFFFFF', fontSize: 54, fontWeight: '800', letterSpacing: -2 },
  caption: { color: '#FFF0E6', fontSize: 13, lineHeight: 21, textAlign: 'center' },
  cities: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 18 },
  city: { color: '#FFE9D6', fontSize: 12, flexShrink: 1, textAlign: 'center' },
  emptyTitle: { color: '#FFFFFF', textAlign: 'center', fontSize: 21, fontWeight: '800', marginTop: 23, marginBottom: 8 },
  pair: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, backgroundColor: '#FFF1DF', borderRadius: 18, marginTop: 20 },
  link: { flex: 1, padding: 18, borderRadius: 25 },
});
