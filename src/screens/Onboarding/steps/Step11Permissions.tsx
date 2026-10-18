/**
 * Step 11 – Permissions: Notification Reminders
 * "Allow notifications so we can remind you to pray"
 * Tapping "Allow" triggers the OS permission dialog.
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  C,
  OnboardingProgressBar,
  PillButton,
} from '../components/OnboardingShared';
import { useOnboarding } from '../../../store/hooks';

interface Props {
  onNext: () => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}

export default function Step11Permissions({ onNext, onBack, stepIndex, totalSteps }: Props) {
  const { saveRemindersEnabled } = useOnboarding();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const handleAllow = async () => {
    // On real device, you'd call expo-notifications here.
    // For now we simply save that user agreed and move on.
    saveRemindersEnabled(true);
    onNext();
  };

  const handleSkip = () => {
    saveRemindersEnabled(false);
    onNext();
  };

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
      <OnboardingProgressBar current={stepIndex} total={totalSteps} />

      <View style={s.content}>
        {/* Icon */}
        <View style={s.iconWrapper}>
          <View style={s.iconGlow} />
          <Ionicons name="notifications" size={52} color={C.cyan} />
        </View>

        {/* Headline */}
        <Text style={s.headline}>
          {Platform.OS === 'android' ? (
            <>
              <Text style={s.highlight}>Android</Text> puts apps to sleep,{'\n'}
              which can hold your prayer reminders back.
            </>
          ) : (
            'Never miss a prayer again'
          )}
        </Text>

        <Text style={s.body}>
          Allowing notifications lets the app wake up at each prayer time, so your
          reminders still arrive even when your phone has been sitting idle.
        </Text>

        {/* Buttons */}
        <View style={s.buttons}>
          <PillButton
            label="Allow Notifications"
            onPress={handleAllow}
            variant="success"
            style={s.btn}
          />
        </View>
      </View>

      <View style={s.footer}>
        <PillButton
          label="Next"
          onPress={handleSkip}
          variant="secondary"
          style={s.btn}
        />
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  content: { flex: 1, paddingTop: 48, alignItems: 'center', paddingHorizontal: 28 },
  iconWrapper: { marginBottom: 32, alignItems: 'center', justifyContent: 'center' },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.cyan,
    opacity: 0.12,
  },
  headline: {
    color: C.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 16,
  },
  highlight: { color: C.cyan },
  body: {
    color: C.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  buttons: { width: '100%', gap: 12 },
  btn: { width: '100%' },
  footer: { paddingHorizontal: 20, paddingBottom: 32 },
});
