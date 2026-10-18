/**
 * OnboardingScreen – master orchestrator
 *
 * Renders the StarryBackground canvas, manages step transitions with a
 * cross-fade animation, and routes each step to its dedicated component.
 * All data is persisted to Redux (onboardingSlice) from within each step.
 *
 * Step map:
 *   0  – Welcome & Spiritual Philosophy
 *   1  – Name Collection
 *   2  – Gender & Avatar
 *   3  – Age (custom keypad)
 *   4  – Daily Prayer Count (snap wheel)
 *   5  – Islamic Journey
 *   6  – Prayer Confidence
 *   7  – Reminder Showcase
 *   8  – Prayer Walkthrough Preview
 *   9  – Community Circle
 *   10 – Notifications Permission
 *   11 – Sacred Pledge & Signature
 */
import React, { useRef, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { StarryBackground, C } from './components/OnboardingShared';
import { useOnboarding } from '../../store/hooks';

import Step1Welcome       from './steps/Step1Welcome';
import Step2Name          from './steps/Step2Name';
import Step3Gender        from './steps/Step3Gender';
import Step4Age           from './steps/Step4Age';
import Step5PrayerCount   from './steps/Step5PrayerCount';
import Step6Journey       from './steps/Step6Journey';
import Step7Confidence    from './steps/Step7Confidence';
import Step8Reminders     from './steps/Step8Reminders';
import Step9PrayerPreview from './steps/Step9PrayerPreview';
import Step10Community    from './steps/Step10Community';
import Step11Permissions  from './steps/Step11Permissions';
import Step12Pledge       from './steps/Step12Pledge';

const TOTAL_STEPS = 12;

interface OnboardingScreenProps {
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const { currentStep, goNext, goPrev, finish, reset } = useOnboarding();

  // Cross-fade transition animation
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateTransition = useCallback((callback: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim]);

  const handleNext = useCallback(() => {
    if (currentStep >= TOTAL_STEPS - 1) {
      // Last step handled internally by Step12Pledge
      return;
    }
    animateTransition(() => goNext());
  }, [currentStep, animateTransition, goNext]);

  const handleBack = useCallback(() => {
    if (currentStep === 0) return;
    animateTransition(() => goPrev());
  }, [currentStep, animateTransition, goPrev]);

  const handleFinish = useCallback(() => {
    finish();
    onFinish();
  }, [finish, onFinish]);

  // Step 0 (welcome) has no header bar
  const showHeader = currentStep > 0;

  const renderStep = () => {
    const commonProps = {
      onNext: handleNext,
      onBack: handleBack,
      stepIndex: currentStep,
      totalSteps: TOTAL_STEPS,
    };

    switch (currentStep) {
      case 0:  return <Step1Welcome onContinue={handleNext} />;
      case 1:  return <Step2Name {...commonProps} />;
      case 2:  return <Step3Gender {...commonProps} />;
      case 3:  return <Step4Age {...commonProps} />;
      case 4:  return <Step5PrayerCount {...commonProps} />;
      case 5:  return <Step6Journey {...commonProps} />;
      case 6:  return <Step7Confidence {...commonProps} />;
      case 7:  return <Step8Reminders {...commonProps} />;
      case 8:  return <Step9PrayerPreview {...commonProps} />;
      case 9:  return <Step10Community {...commonProps} />;
      case 10: return <Step11Permissions {...commonProps} />;
      case 11: return <Step12Pledge {...commonProps} onNext={handleFinish} />;
      default: return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <StarryBackground>
        <SafeAreaView style={s.safeArea}>
          {/* Top navigation header (back arrow) */}
          {showHeader && (
            <View style={s.topBar}>
              <TouchableOpacity onPress={handleBack} style={s.backBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={22} color={C.textPrimary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Step content with cross-fade */}
          <Animated.View style={[s.stepContainer, { opacity: fadeAnim }]}>
            {renderStep()}
          </Animated.View>
        </SafeAreaView>
      </StarryBackground>
    </View>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    height: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    flex: 1,
  },
});
