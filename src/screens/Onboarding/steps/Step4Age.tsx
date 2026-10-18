/**
 * Step 4 – Age Input (custom in-app numeric keypad)
 * Shows a large number display + 10-key grid
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BotBubble,
  OnboardingProgressBar,
  PillButton,
  C,
} from '../components/OnboardingShared';
import { useOnboarding } from '../../../store/hooks';

interface Props {
  onNext: () => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function Step4Age({ onNext, onBack, stepIndex, totalSteps }: Props) {
  const { age, saveAge } = useOnboarding();
  const [digits, setDigits] = useState<string>(age ? String(age) : '');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const numScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const bounce = () =>
    Animated.sequence([
      Animated.timing(numScale, { toValue: 1.15, duration: 80, useNativeDriver: true }),
      Animated.spring(numScale, { toValue: 1, useNativeDriver: true, tension: 120 }),
    ]).start();

  const handleKey = (key: string) => {
    if (key === '⌫') {
      setDigits((d) => d.slice(0, -1));
      bounce();
      return;
    }
    if (key === '') return;
    const next = digits + key;
    if (parseInt(next, 10) > 120) return; // Max age guard
    if (next.length > 3) return;
    setDigits(next);
    bounce();
  };

  const handleNext = () => {
    const parsed = parseInt(digits, 10);
    if (!parsed || parsed < 5 || parsed > 120) return;
    saveAge(parsed);
    onNext();
  };

  const displayAge = digits || '–';
  const isValid = digits.length > 0 && parseInt(digits, 10) >= 5;

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
      <OnboardingProgressBar current={stepIndex} total={totalSteps} />

      <View style={s.content}>
        <BotBubble style={{ marginTop: 24 }}>How old are you?</BotBubble>

        {/* Big age display */}
        <Animated.Text style={[s.bigNum, { transform: [{ scale: numScale }] }]}>
          {displayAge}
        </Animated.Text>

        {/* Custom keypad */}
        <View style={s.keypad}>
          {KEYS.map((key, i) => (
            <KeyButton key={i} label={key} onPress={() => handleKey(key)} />
          ))}
        </View>
      </View>

      <View style={s.footer}>
        <PillButton
          label="Next"
          onPress={handleNext}
          disabled={!isValid}
          style={s.btn}
        />
      </View>
    </Animated.View>
  );
}

function KeyButton({ label, onPress }: { label: string; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.timing(scale, { toValue: 0.9, duration: 60, useNativeDriver: true }).start();

  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 150 }).start();

  if (label === '') {
    return <View style={s.keyEmpty} />;
  }

  return (
    <Animated.View style={[s.keyWrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={s.key}
      >
        {label === '⌫' ? (
          <Ionicons name="backspace-outline" size={24} color={C.textPrimary} />
        ) : (
          <Text style={s.keyLabel}>{label}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  content: { flex: 1 },
  bigNum: {
    color: C.cyan,
    fontSize: 72,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    letterSpacing: -2,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
    justifyContent: 'center',
  },
  keyWrapper: {
    width: '30%',
  },
  key: {
    backgroundColor: C.bgCard,
    borderRadius: 14,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    width: '30%',
  },
  keyLabel: {
    color: C.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  footer: { paddingHorizontal: 20, paddingBottom: 32 },
  btn: { width: '100%' },
});
