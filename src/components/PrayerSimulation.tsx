import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageAssets, AudioAssets } from '../utils/assetsMap';
import { useTheme } from '../store/hooks';
import { PrayerData, Pose } from './PrayerPlayer';

interface PrayerSimulationProps {
  prayerData: PrayerData;
  onBack?: () => void;
}

export interface SimulationStep {
  globalIndex: number;
  rakatNumber: number;
  pose: Pose;
  durationMs: number;
  typeLabel: string;
}

export { MAJOR_POSES, MajorPoseItem, MajorPoseVerse, MajorPosesModal } from './MajorPosesModal';
import { MajorPosesModal, MAJOR_POSES, MajorPoseItem } from './MajorPosesModal';

function calculatePoseDuration(poseId: string, poseLabelEn: string): { durationMs: number; typeLabel: string } {
  const id = poseId.toLowerCase();
  const label = poseLabelEn.toLowerCase();

  if (id.includes('takbeer') || label.includes('takbeer')) {
    return { durationMs: 1000, typeLabel: 'Takbeer (1s)' };
  }
  if (id.includes('qawma') || label.includes('qawma')) {
    return { durationMs: 1500, typeLabel: 'Qawma (1.5s)' };
  }
  if (id.includes('qiyam') || label.includes('qiyam') || label.includes('standing')) {
    return { durationMs: 3000, typeLabel: 'Qiyam (3s)' };
  }
  if (id.includes('ruku') || label.includes('ruku') || label.includes('bowing')) {
    return { durationMs: 2000, typeLabel: 'Ruku (2s)' };
  }
  if (id.includes('sujood') || id.includes('sajdah') || label.includes('sujood') || label.includes('sajdah')) {
    return { durationMs: 2000, typeLabel: 'Sajood (2s)' };
  }
  if (id.includes('tashahhud') || id.includes('qaidah') || label.includes('tashahhud') || label.includes('sitting')) {
    return { durationMs: 2000, typeLabel: 'Tashahhud (2s)' };
  }
  if (id.includes('salam') || label.includes('salam')) {
    return { durationMs: 2000, typeLabel: 'Salam (2s)' };
  }

  return { durationMs: 1500, typeLabel: 'Transition (1.5s)' };
}

function buildSimulationSteps(prayerData: PrayerData): SimulationStep[] {
  const steps: SimulationStep[] = [];
  let globalIdx = 0;

  if (prayerData.rakats && prayerData.rakats.length > 0) {
    prayerData.rakats.forEach((rakat) => {
      rakat.poses.forEach((pose) => {
        const { durationMs, typeLabel } = calculatePoseDuration(pose.id, pose.label.en);
        steps.push({
          globalIndex: globalIdx++,
          rakatNumber: rakat.rakat_number,
          pose,
          durationMs,
          typeLabel,
        });
      });
    });
  } else if (prayerData.poses && prayerData.poses.length > 0) {
    prayerData.poses.forEach((pose) => {
      const { durationMs, typeLabel } = calculatePoseDuration(pose.id, pose.label.en);
      steps.push({
        globalIndex: globalIdx++,
        rakatNumber: 1,
        pose,
        durationMs,
        typeLabel,
      });
    });
  }

  return steps;
}

const SPEED_PRESETS = [0.75, 1.0, 1.25, 1.5];
const MODAL_SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export const PrayerSimulation: React.FC<PrayerSimulationProps> = ({ prayerData }) => {
  const { isDarkMode, colors } = useTheme();
  const steps = useMemo(() => buildSimulationSteps(prayerData), [prayerData]);
  const totalSteps = steps.length;
  const totalRakats = prayerData.total_rakats ?? 2;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [stepProgressRatio, setStepProgressRatio] = useState(0);

  // Standalone Major Poses Modal State
  const [showMajorPosesModal, setShowMajorPosesModal] = useState(false);
  const [selectedInitialPoseId, setSelectedInitialPoseId] = useState<string>('takbeer');

  const isPlayingRef = useRef(false);
  const speedRef = useRef(1.0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const currentStep = steps[currentIndex] ?? steps[0];

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  // Smooth video transition between steps
  useEffect(() => {
    setStepProgressRatio(0);

    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.35, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1.0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [currentIndex]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1.0, duration: 150, useNativeDriver: true }).start();
    }
  }, [isPlaying]);

  const clearCurrentTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  const scheduleNextStep = (stepIdx: number) => {
    clearCurrentTimers();

    if (stepIdx >= totalSteps) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setCurrentIndex(0);
      setStepProgressRatio(0);
      return;
    }

    const step = steps[stepIdx];
    const targetDuration = step.durationMs / speedRef.current;
    startTimeRef.current = Date.now();

    const updateStepProgress = () => {
      if (!isPlayingRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const ratio = Math.min(elapsed / targetDuration, 1);
      setStepProgressRatio(ratio);

      if (ratio < 1) {
        animFrameRef.current = requestAnimationFrame(updateStepProgress);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateStepProgress);

    timerRef.current = setTimeout(() => {
      if (!isPlayingRef.current) return;
      const nextIdx = stepIdx + 1;
      if (nextIdx < totalSteps) {
        setCurrentIndex(nextIdx);
        scheduleNextStep(nextIdx);
      } else {
        setIsPlaying(false);
        isPlayingRef.current = false;
        setCurrentIndex(0);
        setStepProgressRatio(0);
      }
    }, targetDuration);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      clearCurrentTimers();
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;
      scheduleNextStep(currentIndex);
    }
  };

  const handleNext = () => {
    clearCurrentTimers();
    const nextIdx = currentIndex + 1;
    if (nextIdx < totalSteps) {
      setCurrentIndex(nextIdx);
      if (isPlayingRef.current) scheduleNextStep(nextIdx);
    }
  };

  const handlePrev = () => {
    clearCurrentTimers();
    const prevIdx = currentIndex - 1;
    if (prevIdx >= 0) {
      setCurrentIndex(prevIdx);
      if (isPlayingRef.current) scheduleNextStep(prevIdx);
    }
  };

  const toggleSpeed = () => {
    const currentSpeedIdx = SPEED_PRESETS.indexOf(speedMultiplier);
    const nextSpeedIdx = (currentSpeedIdx + 1) % SPEED_PRESETS.length;
    const newSpeed = SPEED_PRESETS[nextSpeedIdx];
    setSpeedMultiplier(newSpeed);
    speedRef.current = newSpeed;

    if (isPlayingRef.current) scheduleNextStep(currentIndex);
  };

  const openPoseGuide = (poseId?: string) => {
    if (isPlaying) {
      clearCurrentTimers();
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
    if (poseId) {
      setSelectedInitialPoseId(poseId);
    }
    setShowMajorPosesModal(true);
  };

  useEffect(() => {
    return () => {
      clearCurrentTimers();
    };
  }, []);

  const accentColor = colors.primary;
  const progressBarBg = colors.surfaceSecondary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Video Simulation Viewport */}
        <View style={[styles.videoViewportContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Live Video Header Overlay */}
          <View style={styles.videoHeaderOverlay}>
            <View style={[styles.liveTag, { backgroundColor: colors.surfaceSecondary, borderColor: accentColor }]}>
              <View style={[styles.liveDot, { backgroundColor: isPlaying ? '#4CD964' : '#FF9500' }]} />
              <Text style={[styles.liveTagText, { color: accentColor }]}>
                {isPlaying ? 'AUTOPLAYING' : 'PAUSED'}
              </Text>
            </View>

            <View style={[styles.ratioTag, { backgroundColor: accentColor }]}>
              <Ionicons name="timer-outline" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={[styles.ratioTagText, { color: '#FFFFFF' }]}>
                {currentStep.typeLabel}
              </Text>
            </View>
          </View>

          {/* Smooth Video Image Display */}
          <Animated.View style={[styles.videoFrame, { opacity: fadeAnim }]}>
            {currentStep.pose.posture_img && ImageAssets[currentStep.pose.posture_img] ? (
              <Image
                source={ImageAssets[currentStep.pose.posture_img]}
                style={styles.videoImage}
                resizeMode="contain"
              />
            ) : (
              <Ionicons name="person" size={100} color={colors.textSecondary} />
            )}
          </Animated.View>

          {/* Pose Countdown Line */}
          <View style={[styles.poseTimerTrack, { backgroundColor: progressBarBg }]}>
            <View
              style={[
                styles.poseTimerFill,
                {
                  width: `${Math.min(stepProgressRatio * 100, 100)}%`,
                  backgroundColor: accentColor,
                },
              ]}
            />
          </View>

          {/* Video Title Bar */}
          <View style={[styles.videoTitleBar, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <View style={styles.titleTextRow}>
              <Text style={[styles.videoTitleText, { color: colors.textPrimary }]}>
                {currentStep.pose.label.en}
              </Text>

              <Text style={[styles.videoStepText, { color: colors.textSecondary }]}>
                Rakat {currentStep.rakatNumber}/{totalRakats} • Step {currentIndex + 1} of {totalSteps}
              </Text>
            </View>

            {/* Video Inline Controls */}
            <View style={styles.inlineControlsRow}>
              <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0} style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}>
                <Ionicons name="play-skip-back" size={20} color={colors.textPrimary} />
              </TouchableOpacity>

              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity onPress={togglePlayPause} style={styles.playButtonWrapper}>
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    style={styles.inlinePlayBtn}
                  >
                    <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#fff" style={!isPlaying ? { marginLeft: 2 } : undefined} />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity onPress={handleNext} disabled={currentIndex >= totalSteps - 1} style={{ opacity: currentIndex >= totalSteps - 1 ? 0.3 : 1 }}>
                <Ionicons name="play-skip-forward" size={20} color={colors.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleSpeed} style={[styles.speedPillBtn, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.speedPillText, { color: accentColor }]}>{speedMultiplier}x</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Compact Reference & Recitation Guide Shortcut Card */}
        <View style={styles.compactReferenceSection}>
          <View style={[styles.shortcutBannerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.shortcutHeaderRow}>
              <View style={[styles.shortcutIconWrap, { backgroundColor: colors.surfaceSecondary }]}>
                <MaterialCommunityIcons name="book-open-page-variant-outline" size={20} color={accentColor} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.shortcutTitle, { color: colors.textPrimary }]}>
                    Major Poses & Recitations
                  </Text>
                  <View style={[styles.guidePill, { backgroundColor: isDarkMode ? '#1E2D4A' : '#EFF6FF' }]}>
                    <Text style={[styles.guidePillText, { color: accentColor }]}>Audio Guide</Text>
                  </View>
                </View>
                <Text style={[styles.shortcutSubtitle, { color: colors.textSecondary }]}>
                  مکمل عربی تلاوت، اعراب اور آڈیو سنیں
                </Text>
              </View>
            </View>

            {/* Horizontal Mini Posture Preview Avatars */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.postureMiniRow}
            >
              {MAJOR_POSES.map((pose) => (
                <TouchableOpacity
                  key={pose.id}
                  activeOpacity={0.7}
                  onPress={() => openPoseGuide(pose.id)}
                  style={[styles.miniAvatarCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                >
                  <Image source={ImageAssets[pose.image]} style={styles.miniAvatarImg} resizeMode="contain" />
                  <Text style={[styles.miniAvatarLabel, { color: colors.textPrimary }]} numberOfLines={1}>
                    {pose.title.en.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openPoseGuide()}
              style={[styles.openGuideBtn, { backgroundColor: colors.surfaceSecondary, borderColor: accentColor }]}
            >
              <Ionicons name="volume-medium-outline" size={16} color={accentColor} style={{ marginRight: 6 }} />
              <Text style={[styles.openGuideBtnText, { color: accentColor }]}>
                Open Complete Recitations & Audio Controls
              </Text>
              <Ionicons name="chevron-forward" size={16} color={accentColor} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Standalone Major Poses Recitation Modal */}
      <MajorPosesModal
        visible={showMajorPosesModal}
        onClose={() => setShowMajorPosesModal(false)}
        initialPoseId={selectedInitialPoseId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  videoViewportContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  videoHeaderOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 10,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ratioTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratioTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  videoFrame: {
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  videoImage: {
    width: '100%',
    height: '100%',
  },
  poseTimerTrack: {
    height: 4,
    width: '100%',
  },
  poseTimerFill: {
    height: '100%',
  },
  videoTitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
  },
  titleTextRow: {
    flex: 1,
    marginRight: 8,
  },
  videoTitleText: {
    fontSize: 15,
    fontWeight: '700',
  },
  videoStepText: {
    fontSize: 11,
    marginTop: 2,
  },
  inlineControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playButtonWrapper: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  inlinePlayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedPillBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },
  speedPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Compact Reference Shortcut Card
  compactReferenceSection: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  shortcutBannerCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  shortcutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shortcutIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  guidePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  guidePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  shortcutSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  postureMiniRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    gap: 10,
  },
  miniAvatarCard: {
    width: 68,
    alignItems: 'center',
    padding: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  miniAvatarImg: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  miniAvatarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  openGuideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  openGuideBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
