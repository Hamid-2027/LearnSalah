/**
 * Step 8 – Reminder Showcase
 * Demonstrates the 3-stage notification system for every prayer.
 * "I can remind you up to three times…"
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
import { Ionicons } from '@expo/vector-icons';
import { C, OnboardingProgressBar } from '../components/OnboardingShared';

const { width: SW } = Dimensions.get('window');

interface Props {
  onNext: () => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}

const NOTIFICATIONS = [
  {
    icon: 'notifications-outline' as const,
    title: 'Asr is in 10 minutes',
    body: 'Get ready to pray',
  },
  {
    icon: 'notifications' as const,
    title: "It's time to pray Asr",
    body: 'Just Pray Asr',
  },
  {
    icon: 'alert-circle-outline' as const,
    title: 'Asr was 30 minutes ago',
    body: "You still haven't prayed",
  },
];

export default function Step8Reminders({ onNext, onBack, stepIndex, totalSteps }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cardAnims = useRef(NOTIFICATIONS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    const cards = cardAnims.map((a, i) =>
      Animated.timing(a, { toValue: 1, duration: 380, delay: 200 + i * 150, useNativeDriver: true })
    );
    Animated.parallel(cards).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
      <OnboardingProgressBar current={stepIndex} total={totalSteps} />

      <View style={s.content}>
        {/* Hero headline */}
        <View style={s.heroSection}>
          <Text style={s.heroText}>
            I can <Text style={s.highlight}>remind you</Text> up to three times for every prayer
            so you never forget again!
          </Text>
        </View>

        {/* Notification cards */}
        {NOTIFICATIONS.map((notif, i) => (
          <Animated.View
            key={i}
            style={[
              s.notifCard,
              {
                opacity: cardAnims[i],
                transform: [{
                  translateX: cardAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-40, 0],
                  }),
                }],
              },
            ]}
          >
            <View style={s.notifIcon}>
              <Ionicons name={notif.icon} size={20} color="#fff" />
            </View>
            <View style={s.notifBody}>
              <Text style={s.notifTitle}>{notif.title}</Text>
              <Text style={s.notifSub}>{notif.body}</Text>
            </View>
            <Text style={s.notifTime}>now</Text>
          </Animated.View>
        ))}

        {/* Quranic reference */}
        <View style={s.quranBox}>
          <Text style={s.quranLabel}>Allah SWT said:</Text>
          <Text style={s.quranText}>
            "So remind, if the reminder should benefit."
          </Text>
          <Text style={s.quranRef}>— Surah Al-A'la (87:9)</Text>
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

const s = StyleSheet.create({
  content: { flex: 1, paddingTop: 24 },
  heroSection: { paddingHorizontal: 28, marginBottom: 28 },
  heroText: {
    color: C.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
  },
  highlight: { color: C.cyan },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bgCard,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBody: { flex: 1 },
  notifTitle: {
    color: C.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  notifSub: { color: C.textSecondary, fontSize: 12 },
  notifTime: { color: C.textMuted, fontSize: 12 },
  quranBox: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(34,211,238,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.15)',
    alignItems: 'center',
  },
  quranLabel: { color: C.cyan, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  quranText: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  quranRef: { color: C.textSecondary, fontSize: 12, marginTop: 6 },
  tapButton: { paddingBottom: 36, alignItems: 'center' },
  tapLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '600' },
});
