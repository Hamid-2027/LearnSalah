/**
 * Step 3 – Gender & Avatar Picker
 * Male/Female illustrated selection cards with animated avatar row reveal.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BotBubble,
  OnboardingProgressBar,
  PillButton,
  C,
} from '../components/OnboardingShared';
import { useOnboarding } from '../../../store/hooks';
import { OnboardingGender, OnboardingAvatar } from '../../../store/slices/onboardingSlice';

const { width: SW } = Dimensions.get('window');

const AVATARS: { id: OnboardingAvatar; label: string; emoji: string; colors: string[] }[] = [
  { id: 'oasis',    label: 'Oasis',    emoji: '🌴', colors: ['#22c55e', '#16a34a'] },
  { id: 'mountain', label: 'Mountain', emoji: '🏔️', colors: ['#64748b', '#334155'] },
  { id: 'sun',      label: 'Sun',      emoji: '☀️', colors: ['#f59e0b', '#d97706'] },
  { id: 'moon',     label: 'Moon',     emoji: '🌙', colors: ['#6366f1', '#4f46e5'] },
  { id: 'olive',    label: 'Olive',    emoji: '🫒', colors: ['#84cc16', '#65a30d'] },
];

interface Props {
  onNext: () => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}

export default function Step3Gender({ onNext, onBack, stepIndex, totalSteps }: Props) {
  const { gender, avatar, saveGender, saveAvatar } = useOnboarding();
  const [localGender, setLocalGender] = useState<OnboardingGender>(gender);
  const [localAvatar, setLocalAvatar] = useState<OnboardingAvatar>(avatar);

  const avatarRowHeight = useRef(new Animated.Value(0)).current;
  const avatarOpacity = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  // Show avatar section when gender is chosen
  useEffect(() => {
    if (localGender !== 'unset') {
      Animated.parallel([
        Animated.spring(avatarRowHeight, {
          toValue: 130,
          useNativeDriver: false,
          tension: 60,
          friction: 10,
        }),
        Animated.timing(avatarOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [localGender]);

  const handleGenderSelect = (g: OnboardingGender) => {
    setLocalGender(g);
    setLocalAvatar('unset');
  };

  const handleNext = () => {
    if (localGender === 'unset') return;
    saveGender(localGender);
    if (localAvatar !== 'unset') saveAvatar(localAvatar);
    onNext();
  };

  const canProceed = localGender !== 'unset';

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
      <OnboardingProgressBar current={stepIndex} total={totalSteps} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BotBubble style={{ marginTop: 24 }}>What is your gender?</BotBubble>

        <Text style={s.subtitle}>
          Please choose accurately as we've built features to represent each gender's prayer journey.
        </Text>

        {/* Gender cards row */}
        <View style={s.genderRow}>
          <GenderCard
            label="Brother"
            sublabel="Male"
            gender="male"
            selected={localGender === 'male'}
            onPress={() => handleGenderSelect('male')}
          />
          <GenderCard
            label="Sister"
            sublabel="Female"
            gender="female"
            selected={localGender === 'female'}
            onPress={() => handleGenderSelect('female')}
          />
        </View>

        {/* Avatar picker – revealed after gender selection */}
        <Animated.View
          style={{ height: avatarRowHeight, opacity: avatarOpacity, overflow: 'hidden' }}
        >
          <Text style={s.avatarTitle}>Choose your avatar</Text>
          <View style={s.avatarRow}>
            {AVATARS.map((av) => (
              <TouchableOpacity
                key={av.id}
                onPress={() => setLocalAvatar(av.id)}
                style={[
                  s.avatarBadge,
                  localAvatar === av.id && s.avatarBadgeActive,
                ]}
              >
                <Text style={s.avatarEmoji}>{av.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={s.footer}>
        <PillButton
          label="Next"
          onPress={handleNext}
          disabled={!canProceed}
          style={s.btn}
        />
      </View>
    </Animated.View>
  );
}

// ── GenderCard sub-component ──────────────────────────────────────────────────
interface GenderCardProps {
  label: string;
  sublabel: string;
  gender: 'male' | 'female';
  selected: boolean;
  onPress: () => void;
}

function GenderCard({ label, sublabel, gender, selected, onPress }: GenderCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 100 }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, gc.wrapper]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={1}
        style={[gc.card, selected && gc.cardActive]}
      >
        {/* Check indicator top-right */}
        <View style={[gc.checkCircle, selected && gc.checkCircleActive]}>
          {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>

        {/* Person illustration */}
        <View style={gc.figure}>
          {gender === 'male' ? (
            <MaleFigure selected={selected} />
          ) : (
            <FemaleFigure selected={selected} />
          )}
        </View>

        <Text style={[gc.label, selected && gc.labelActive]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function MaleFigure({ selected }: { selected: boolean }) {
  const c = selected ? C.cyan : 'rgba(255,255,255,0.35)';
  return (
    <View style={{ alignItems: 'center' }}>
      {/* Head */}
      <View style={[fig.head, { backgroundColor: c, opacity: 0.9 }]} />
      {/* Kufi */}
      <View style={[fig.kufi, { backgroundColor: c }]} />
      {/* Body */}
      <View style={[fig.body, { backgroundColor: c, opacity: 0.7 }]} />
    </View>
  );
}

function FemaleFigure({ selected }: { selected: boolean }) {
  const c = selected ? C.cyan : 'rgba(255,255,255,0.35)';
  return (
    <View style={{ alignItems: 'center' }}>
      {/* Head */}
      <View style={[fig.head, { backgroundColor: c, opacity: 0.9 }]} />
      {/* Hijab */}
      <View style={[fig.hijab, { backgroundColor: c, opacity: 0.85 }]} />
      {/* Body */}
      <View style={[fig.body, { width: 54, backgroundColor: c, opacity: 0.7 }]} />
    </View>
  );
}

const CARD_SIZE = (SW - 56) / 2;

const gc = StyleSheet.create({
  wrapper: { width: CARD_SIZE },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.3,
    backgroundColor: C.bgCard,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardActive: {
    borderColor: C.cyan,
    backgroundColor: 'rgba(34,211,238,0.07)',
  },
  checkCircle: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: C.cyan,
    borderColor: C.cyan,
  },
  figure: { alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  label: { color: C.textSecondary, fontSize: 15, fontWeight: '600', marginTop: 4 },
  labelActive: { color: C.textPrimary },
});

const fig = StyleSheet.create({
  head: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 2,
  },
  kufi: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    opacity: 0.6,
  },
  hijab: {
    position: 'absolute',
    top: 2,
    width: 56,
    height: 48,
    borderRadius: 28,
  },
  body: {
    marginTop: 6,
    width: 46,
    height: 52,
    borderRadius: 12,
  },
});

const s = StyleSheet.create({
  scroll: {
    paddingBottom: 20,
  },
  subtitle: {
    color: C.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 28,
    marginBottom: 28,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  avatarTitle: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
  },
  avatarBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.bgCard,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadgeActive: {
    borderColor: C.cyan,
    backgroundColor: 'rgba(34,211,238,0.1)',
  },
  avatarEmoji: { fontSize: 26 },
  footer: { paddingHorizontal: 20, paddingBottom: 32 },
  btn: { width: '100%' },
});
