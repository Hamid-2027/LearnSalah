/**
 * Step 1 – Spiritual Welcome Screen
 * "The 5 daily prayers are a gift from Allah to all of us as Muslims"
 * Shows 5 prayer sky cards + "Tap to continue"
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C } from '../components/OnboardingShared';

const { width: SW } = Dimensions.get('window');

const PRAYERS = [
  {
    name: 'Fajr',
    colors: ['#1a0533', '#7e3b8a', '#f4a261'] as [string, string, string],
    star: true,
  },
  {
    name: 'Dhuhr',
    colors: ['#87ceeb', '#fde68a', '#fff'] as [string, string, string],
    star: false,
  },
  {
    name: 'Asr',
    colors: ['#f97316', '#fb923c', '#fed7aa'] as [string, string, string],
    star: false,
  },
  {
    name: 'Maghrib',
    colors: ['#7f1d1d', '#dc2626', '#fb923c'] as [string, string, string],
    star: false,
  },
  {
    name: 'Isha',
    colors: ['#0c1445', '#1e3a5f', '#374151'] as [string, string, string],
    star: true,
  },
];

interface Props {
  onContinue: () => void;
}

export default function Step1Welcome({ onContinue }: Props) {
  const tapAnim = useRef(new Animated.Value(1)).current;
  const cardsAnim = useRef(PRAYERS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Staggered card entrance
    const anims = cardsAnim.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 300 + i * 100,
        useNativeDriver: true,
      })
    );
    Animated.parallel(anims).start();

    // Pulsing tap indicator
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(tapAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(tapAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <TouchableOpacity activeOpacity={1} onPress={onContinue} style={{ flex: 1 }}>
      {/* Top hero text */}
      <View style={s.heroSection}>
        <Text style={s.heroText}>
          The 5 daily prayers are a gift from{' '}
          <Text style={s.highlight}>Allah</Text> to all of us as{' '}
          <Text style={s.highlight}>Muslims</Text>
        </Text>

        <Text style={s.subText}>
          Our app was designed to help you{' '}
          <Text style={s.highlight}>preserve this gift.</Text>
        </Text>
      </View>

      {/* Prayer sky cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.cardsRow}
        scrollEnabled={false}
      >
        {PRAYERS.map((p, i) => (
          <Animated.View
            key={p.name}
            style={[
              s.card,
              {
                opacity: cardsAnim[i],
                transform: [
                  {
                    translateY: cardsAnim[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={p.colors}
              style={s.cardGradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            >
              {/* Stars for night prayers */}
              {p.star && (
                <>
                  <View style={[s.dot, { top: 10, left: 12, width: 2, height: 2 }]} />
                  <View style={[s.dot, { top: 20, left: 30, width: 1.5, height: 1.5 }]} />
                  <View style={[s.dot, { top: 8, right: 10, width: 2, height: 2 }]} />
                </>
              )}
              {/* Sun for Dhuhr/Asr */}
              {(p.name === 'Dhuhr' || p.name === 'Asr') && (
                <View style={s.sun} />
              )}
              <View style={s.cardNameBg}>
                <Text style={s.cardName}>{p.name}</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Tap to continue */}
      <Animated.Text style={[s.tapLabel, { opacity: tapAnim }]}>
        Tap to continue
      </Animated.Text>
    </TouchableOpacity>
  );
}

const CARD_W = (SW - 60) / 5;
const CARD_H = CARD_W * 1.9;

const s = StyleSheet.create({
  heroSection: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 36,
    alignItems: 'center',
  },
  heroText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 20,
  },
  subText: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 30,
  },
  highlight: {
    color: C.cyan,
  },
  cardsRow: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'flex-end',
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  dot: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 2,
    opacity: 0.8,
  },
  sun: {
    position: 'absolute',
    top: 18,
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowRadius: 8,
    shadowOpacity: 0.9,
    elevation: 4,
  },
  cardNameBg: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  cardName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  tapLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 48,
    letterSpacing: 0.5,
  },
});
