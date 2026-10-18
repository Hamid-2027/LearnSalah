/**
 * Step 2 – Name Collection
 * "What can I call you?" with pill-shaped text input
 */
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { BotBubble, OnboardingProgressBar, PillButton, C } from '../components/OnboardingShared';
import { useOnboarding } from '../../../store/hooks';

interface Props {
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
}

export default function Step2Name({ onNext, stepIndex, totalSteps }: Props) {
  const { name, saveName } = useOnboarding();
  const [localName, setLocalName] = useState(name);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNext = () => {
    const trimmed = localName.trim();
    if (trimmed.length === 0) return;
    saveName(trimmed);
    onNext();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <OnboardingProgressBar current={stepIndex} total={totalSteps} />

      <Animated.View style={[{ flex: 1, paddingTop: 32 }, { opacity: fadeAnim }]}>
        <BotBubble>What can I call you?</BotBubble>

        {/* Input pill */}
        <View style={s.inputWrapper}>
          <TextInput
            style={s.input}
            placeholder="Enter your name"
            placeholderTextColor={C.textMuted}
            value={localName}
            onChangeText={setLocalName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleNext}
            selectionColor={C.cyan}
          />
        </View>
      </Animated.View>

      {/* Next button pinned at bottom */}
      <View style={s.footer}>
        <PillButton
          label="Next"
          onPress={handleNext}
          disabled={localName.trim().length === 0}
          style={s.btn}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  inputWrapper: {
    marginHorizontal: 20,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.bgCard,
    overflow: 'hidden',
  },
  input: {
    color: C.textPrimary,
    fontSize: 17,
    paddingVertical: 18,
    paddingHorizontal: 24,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  btn: { width: '100%' },
});
