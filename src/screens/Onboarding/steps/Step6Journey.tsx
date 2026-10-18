/**
 * Step 6 – Islamic Journey
 * "What's your personal journey with Islam?"
 * Born Muslim | I reverted to Islam
 * Auto-advances on selection.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import {
  BotBubble,
  OnboardingProgressBar,
  RadioCard,
  C,
} from '../components/OnboardingShared';
import { useOnboarding } from '../../../store/hooks';
import { IslamicJourney } from '../../../store/slices/onboardingSlice';

interface Props {
  onNext: () => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}

const OPTIONS: { id: IslamicJourney; label: string }[] = [
  { id: 'born_muslim', label: 'Born Muslim' },
  { id: 'reverted',    label: 'I reverted to Islam' },
];

export default function Step6Journey({ onNext, onBack, stepIndex, totalSteps }: Props) {
  const { islamicJourney, saveIslamicJourney } = useOnboarding();
  const [selected, setSelected] = useState<IslamicJourney>(islamicJourney);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const handleSelect = (id: IslamicJourney) => {
    setSelected(id);
    saveIslamicJourney(id);
    // Short delay then auto-advance
    setTimeout(onNext, 350);
  };

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
      <OnboardingProgressBar current={stepIndex} total={totalSteps} />

      <View style={s.content}>
        <BotBubble style={{ marginTop: 24 }}>
          What's your personal journey with Islam?
        </BotBubble>

        <View style={s.options}>
          {OPTIONS.map((opt) => (
            <RadioCard
              key={opt.id}
              label={opt.label}
              selected={selected === opt.id}
              onPress={() => handleSelect(opt.id)}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  content: { flex: 1, paddingTop: 24 },
  options: { paddingHorizontal: 20, marginTop: 8 },
});
