import { useFocusEffect } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, StyleSheet, View } from 'react-native';

// Four hearts on each of the original concentric arcs. Sample the curves once;
// the native animation driver moves them without React renders each frame.
const samples = Array.from({ length: 25 }, (_, i) => i / 24);
const hearts = Array.from({ length: 8 }, (_, i) => {
  const inner = i >= 4;
  const radius = inner ? 90 : 130;
  const angle = 116 + (i % 4) * 40;
  const radians = samples.map(p => (angle + (p - 0.5) * (inner ? -24 : 24)) * Math.PI / 180);
  return {
    size: inner ? 15 : 20,
    color: i % 2 ? '#FFD9BB' : '#FFE9EF',
    x: radians.map(a => radius * Math.cos(a)),
    y: radians.map(a => radius * Math.sin(a)),
  };
});

export default function OrbitHearts() {
  const progress = useRef(new Animated.Value(0.5)).current;
  const [focused, setFocused] = useState(false);
  useFocusEffect(useCallback(() => {
    setFocused(true);
    return () => setFocused(false);
  }, []));
  const [active, setActive] = useState(AppState.currentState === 'active');
  // Stay still until the accessibility preference is known.
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    let mounted = true;
    let preferenceChanged = false;
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', value => {
      preferenceChanged = true;
      setReduceMotion(value);
    });
    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (mounted && !preferenceChanged) setReduceMotion(value);
    }).catch(() => {});
    const app = AppState.addEventListener('change', state => setActive(state === 'active'));
    return () => { mounted = false; motion.remove(); app.remove(); };
  }, []);

  useEffect(() => {
    if (!focused || !active || reduceMotion) {
      progress.setValue(0.5);
      return;
    }
    const timing = (toValue: number, duration: number) => Animated.timing(progress, {
      toValue, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true,
      isInteraction: false,
    });
    const animation = Animated.sequence([
      timing(1, 3500),
      Animated.loop(Animated.sequence([timing(0, 7000), timing(1, 7000)]), { resetBeforeIteration: false }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [active, focused, progress, reduceMotion]);

  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.track}>
    {hearts.map((heart, i) => <Animated.View key={i} style={[s.heart, {
      opacity: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: i % 2 ? [0.22, 0.36, 0.22] : [0.36, 0.22, 0.36] }),
      transform: [
        { translateX: progress.interpolate({ inputRange: samples, outputRange: heart.x }) },
        { translateY: progress.interpolate({ inputRange: samples, outputRange: heart.y }) },
        { rotate: i % 2 ? '12deg' : '-12deg' },
        { scale: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: i % 2 ? [0.9, 1.08, 0.9] : [1.08, 0.9, 1.08] }) },
      ],
    }]}><Heart size={heart.size} color={heart.color} fill={i % 2 ? 'transparent' : heart.color} strokeWidth={1.6} /></Animated.View>)}
  </View>;
}

const s = StyleSheet.create({
  track: { position: 'absolute', right: -10, top: 140, width: 0, height: 0 },
  heart: { position: 'absolute', left: -12, top: -12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
});
