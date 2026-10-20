import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowUpRight, Clock, Images } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { togetherText } from '../lib/togetherText';
export default function TogetherCards() {
 const { lang } = useApp(), c = togetherText(lang), router = useRouter();
 return <View style={{ flexDirection: 'row', gap: 12 }}>{(['moment', 'overlap'] as const).map(mode =>
  <Pressable key={mode} accessibilityRole="button" onPress={() => router.push({ pathname: '/together', params: { view: mode } })}
   style={({ pressed }) => ({ flex: 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
   <LinearGradient colors={mode === 'moment' ? ['#EEE3F4', '#E4D6ED'] : ['#F8EACA', '#F4DFAE']} style={{ padding: 19, borderRadius: 26, minHeight: 155, overflow: 'hidden' }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
     <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: '#FFFFFF90', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: mode === 'moment' ? '-8deg' : '8deg' }] }}>
      {mode === 'moment' ? <Images size={24} color="#694575" /> : <Clock size={24} color="#7B5B20" />}
     </View><ArrowUpRight size={18} color={mode === 'moment' ? '#694575' : '#7B5B20'} />
    </View>
    <Text style={{ color: mode === 'moment' ? '#513359' : '#624713', fontWeight: '800', fontSize: 18, lineHeight: 24, marginTop: 22 }}>{c[mode]}</Text>
   </LinearGradient>
  </Pressable>)}</View>;
}
