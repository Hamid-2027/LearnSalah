/**
 * Step 7 – Prayer Confidence
 * "How confident are you that you pray correctly?"
 * 4 tier radio-card options.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import {
  BotBubble,
  OnboardingProgressBar,
  RadioCard,
  PillButton,
  C,
} from '../components/OnboardingShared';
import { useOnboarding } from '../../../store/hooks';
import { PrayerConfidence } from '../../../store/slices/onboardingSlice';

interface Props {
  onNext: () => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}

const OPTIONS: { id: PrayerConfidence; label: string }[] = [
  { id: 'very_confident',  label: 'Very confident' },
  { id: 'second_guess',    label: 'I second-guess myself' },
  { id: 'mostly_gaps',     label: 'Mostly, with a few gaps' },
  { id: 'never_learned',   label: "I've never really learned" },
];

export default function Step7Confidence({ onNext, onBack, stepIndex, totalSteps }: Props) {
  const { prayerConfidence, savePrayerConfidence } = useOnboarding();
  const [selected, setSelected] = useState<PrayerConfidence>(prayerConfidence);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const handleNext = () => {
    if (!selected) return;
    savePrayerConfidence(selected);
    onNext();
  };

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
      <OnboardingProgressBar current={stepIndex} total={totalSteps} />

      <View style={s.content}>
        <BotBubble style={{ marginTop: 24 }}>
          How confident are you that you pray correctly?
        </BotBubble>

        <View style={s.options}>
          {OPTIONS.map((opt) => (
            <RadioCard
              key={opt.id}
              label={opt.label}
              selected={selected === opt.id}
              onPress={() => setSelected(opt.id)}
            />
          ))}
        </View>
      </View>

      <View style={s.footer}>
        <PillButton
          label="Next"
          onPress={handleNext}
          disabled={!selected}
          style={s.btn}
        />
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  content: { flex: 1, paddingTop: 24 },
  options: { paddingHorizontal: 20, marginTop: 8 },
  footer: { paddingHorizontal: 20, paddingBottom: 32 },
  btn: { width: '100%' },
});
