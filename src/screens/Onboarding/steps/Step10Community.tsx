/**
 * Step 10 – Community Circle Motivation
 * "Tracking your prayers with others in a circle can help you stay motivated."
 * Shows animated 8-point Islamic geometric star with avatar badges.
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { C, OnboardingProgressBar, PillButton } from '../components/OnboardingShared';

const { width: SW } = Dimensions.get('window');

interface Props {
  onNext: () => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}

const CIRCLE_MEMBERS = [
  { emoji: '🌠', streak: 31, angle: 0 },
  { emoji: '🌴', streak: 29, angle: 90 },
  { emoji: '🫒', streak: 12, angle: 180 },
  { emoji: '🌙', streak: 89, angle: 270 },
];

export default function Step10Community({ onNext, onBack, stepIndex, totalSteps }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // Slow gentle star rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Pulsing tap label
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const RADIUS = 110;
  const CENTER = SW / 2 - 40;

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
      <OnboardingProgressBar current={stepIndex} total={totalSteps} />

      <View style={s.content}>
        {/* Headline */}
        <Text style={s.headline}>
          Tracking your prayers with others in a{' '}
          <Text style={s.highlight}>circle</Text> can help you and them stay motivated.
        </Text>

        {/* Islamic star + avatar badges */}
        <View style={s.starContainer}>
          {/* Rotating geometric star (8-point) */}
          <Animated.View style={[s.star, { transform: [{ rotate: spin }] }]}>
            {/* Outer square */}
            <View style={s.starSquare} />
            {/* Rotated inner square */}
            <View style={[s.starSquare, { transform: [{ rotate: '45deg' }] }]} />
            {/* Center octagon */}
            <View style={s.starCenter} />
          </Animated.View>

          {/* Fixed avatar badges orbiting the star */}
          {CIRCLE_MEMBERS.map((member, i) => {
            const rad = (member.angle * Math.PI) / 180;
            const x = CENTER + RADIUS * Math.sin(rad) - 28;
            const y = CENTER + RADIUS * -Math.cos(rad) - 28;
            return (
              <View
                key={i}
                style={[s.avatarBadge, { left: x, top: y }]}
              >
                <Text style={s.avatarEmoji}>{member.emoji}</Text>
                <View style={s.streakBadge}>
                  <Text style={s.streakText}>{member.streak}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Tap to continue */}
      <TouchableOpacity onPress={onNext} style={s.tapButton} activeOpacity={0.7}>
        <Animated.Text style={[s.tapLabel, { opacity: pulseAnim }]}>
          Tap to continue
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const STAR_SIZE = 160;

const s = StyleSheet.create({
  content: { flex: 1, paddingTop: 28 },
  headline: {
    color: C.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 34,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  highlight: { color: C.cyan },
  starContainer: {
    width: SW - 80,
    height: SW - 80,
    alignSelf: 'center',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    width: STAR_SIZE,
    height: STAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starSquare: {
    position: 'absolute',
    width: STAR_SIZE * 0.75,
    height: STAR_SIZE * 0.75,
    borderWidth: 2.5,
    borderColor: C.cyan,
    borderRadius: 6,
  },
  starCenter: {
    width: STAR_SIZE * 0.32,
    height: STAR_SIZE * 0.32,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: C.cyan,
    transform: [{ rotate: '22.5deg' }],
  },
  avatarBadge: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.bgCard,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 26 },
  streakBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#f97316',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  streakText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  tapButton: { paddingBottom: 36, alignItems: 'center' },
  tapLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '600' },
});
