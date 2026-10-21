import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { Heart, Sparkles } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, StyleSheet, View } from 'react-native';

/** Native-driven ambient motion, paused off-screen and disabled for Reduce Motion. */
export default function PhotoGlow({ cool = false }: { cool?: boolean }) {
  const phase = useRef(new Animated.Value(0.5)).current;
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [reduce, setReduce] = useState(true);
  useFocusEffect(useCallback(() => { setFocused(true); return () => setFocused(false); }, []));
  useEffect(() => {
    let alive = true, changed = false;
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', value => { changed = true; setReduce(value); });
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (alive && !changed) setReduce(value); }).catch(() => {});
    const app = AppState.addEventListener('change', state => setActive(state === 'active'));
    return () => { alive = false; motion.remove(); app.remove(); };
  }, []);
  useEffect(() => {
    if (!focused || !active || reduce) { phase.setValue(0.5); return; }
    const move = (toValue: number, duration: number) => Animated.timing(phase, {
      toValue, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false,
    });
    const loop = Animated.sequence([move(1, 4000), Animated.loop(Animated.sequence([move(0, 8000), move(1, 8000)]), { resetBeforeIteration: false })]);
    loop.start();
    return () => loop.stop();
  }, [active, focused, reduce, phase]);
  const palette = cool ? ['#B6DAD7', '#6A9FC2', '#726BA7'] as const : ['#FFD6AD', '#E996AB', '#AA8EC9'] as const;
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
    <LinearGradient colors={palette} style={StyleSheet.absoluteFill} />
    <Animated.View style={[s.wash, { transform: [
      { translateX: phase.interpolate({ inputRange: [0, 1], outputRange: [-45, 45] }) },
      { translateY: phase.interpolate({ inputRange: [0, 1], outputRange: [35, -35] }) },
      { rotate: phase.interpolate({ inputRange: [0, 1], outputRange: ['-18deg', '18deg'] }) },
    ] }]}><LinearGradient colors={[palette[2], palette[0], palette[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} /></Animated.View>
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: phase.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.48] }) }]}>
      <LinearGradient colors={['#FFFFFF00', '#FFF5D7', '#FFFFFF00']} start={{ x: 0, y: 0.2 }} end={{ x: 1, y: 0.9 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
    {[{ x: '12%', y: '16%' }, { x: '78%', y: '24%' }, { x: '18%', y: '68%' }, { x: '80%', y: '76%' }].map((point, i) =>
      <Animated.View key={i} style={{ position: 'absolute', left: point.x as `${number}%`, top: point.y as `${number}%`, opacity: 0.45,
        transform: [{ translateY: phase.interpolate({ inputRange: [0, 1], outputRange: i % 2 ? [-7, 7] : [7, -7] }) }] }}>
        {i % 2 ? <Sparkles size={17} color="#FFF7E8" /> : <Heart size={18} color="#FFF7E8" />}
      </Animated.View>)}
  </View>;
}
const s = StyleSheet.create({ wash: { position: 'absolute', top: -110, bottom: -110, left: -110, right: -110 } });
