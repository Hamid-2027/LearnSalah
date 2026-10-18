/**
 * Step 9 – Prayer Walkthrough Preview
 * "I can walk you through any prayer, step by step"
 * Shows 3 pose cards (Ruku, Qiyam, Sujood) + Arabic/transliteration/English
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { C, OnboardingProgressBar, PillButton } from '../components/OnboardingShared';

const { width: SW } = Dimensions.get('window');

interface Props {
  onNext: () => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}

// Pose data using existing body pose assets
const POSES = [
  {
    key: 'ruku',
    image: require('../../../assets/images/salahBodyPose/ruku_male.jpeg'),
  },
  {
    key: 'standing',
    image: require('../../../assets/images/salahBodyPose/standing_takbeer_male.jpeg'),
  },
  {
    key: 'sujood',
    image: require('../../../assets/images/salahBodyPose/sujood_male.jpeg'),
  },
];

export default function Step9PrayerPreview({ onNext, onBack, stepIndex, totalSteps }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(POSES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    const stagger = cardAnims.map((a, i) =>
      Animated.timing(a, { toValue: 1, duration: 360, delay: 200 + i * 120, useNativeDriver: true })
    );
    Animated.parallel(stagger).start();
  }, []);

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
      <OnboardingProgressBar current={stepIndex} total={totalSteps} />

      <View style={s.content}>
        {/* Bot bubble */}
        <View style={s.botRow}>
          <View style={s.botAvatar}><View style={s.botInner} /></View>
          <View style={s.botBubble}>
            <Text style={s.botText}>
              I can walk you through any prayer, step by step, anytime you want.
            </Text>
          </View>
        </View>

        {/* 3 pose cards */}
        <View style={s.posesRow}>
          {POSES.map((pose, i) => {
            const isCenter = i === 1;
            return (
              <Animated.View
                key={pose.key}
                style={[
                  s.poseCard,
                  isCenter && s.poseCardCenter,
                  {
                    opacity: cardAnims[i],
                    transform: [{
                      translateY: cardAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, isCenter ? -8 : 8],
                      }),
                    }],
                  },
                ]}
              >
                <Image
                  source={pose.image}
                  style={[s.poseImage, isCenter && s.poseImageCenter]}
                  resizeMode="cover"
                />
              </Animated.View>
            );
          })}
        </View>

        {/* Step details */}
        <View style={s.detailBox}>
          <Text style={s.stepName}>Takbeer</Text>
          <Text style={s.arabic}>اللهُ أَكْبَرُ</Text>
          <Text style={s.transliteration}>Allahu Akbar</Text>
          <Text style={s.translation}>God is the Greatest</Text>
        </View>
      </View>

      <View style={s.footer}>
        <PillButton label="Next" onPress={onNext} style={s.btn} />
      </View>
    </Animated.View>
  );
}

const CARD_W = (SW - 64) / 3;

const s = StyleSheet.create({
  content: { flex: 1, paddingTop: 24 },
  botRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  botAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: C.cyan,
    backgroundColor: C.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  botInner: {
    width: 22,
    height: 22,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
    backgroundColor: C.cyan,
    opacity: 0.9,
  },
  botBubble: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 14,
  },
  botText: {
    color: C.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  posesRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 24,
  },
  poseCard: {
    width: CARD_W,
    height: CARD_W * 1.45,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: C.bgCard,
    opacity: 0.75,
  },
  poseCardCenter: {
    width: CARD_W * 1.12,
    height: CARD_W * 1.6,
    opacity: 1,
    borderWidth: 1.5,
    borderColor: C.cyan,
  },
  poseImage: {
    width: '100%',
    height: '100%',
  },
  poseImageCenter: {},
  detailBox: { alignItems: 'center', paddingHorizontal: 20 },
  stepName: {
    color: C.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  arabic: {
    color: C.textPrimary,
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 6,
    fontFamily: 'System', // Use system Arabic font
  },
  transliteration: {
    color: C.textSecondary,
    fontSize: 15,
    marginBottom: 2,
  },
  translation: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  footer: { paddingHorizontal: 20, paddingBottom: 32 },
  btn: { width: '100%' },
});
