import React, { useState, useEffect, useRef, useMemo, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageAssets } from '../utils/assetsMap';
import { useTheme } from '../store/hooks';
import { PrayerData, Pose } from './PrayerPlayer';

export interface VisualGuideStep {
  globalIndex: number;
  rakatNumber: number;
  pose: Pose;
  durationMs: number;
  typeLabel: string;
}

export interface PrayerStepsBottomSheetHandle {
  open: () => void;
  close: () => void;
}

export interface PrayerStepsBottomSheetProps {
  prayerData: PrayerData;
}

const SPEED_PRESETS = [0.75, 1.0, 1.25, 1.5];

function calcStepTiming(id: string, labelEn: string): { durationMs: number; typeLabel: string } {
  const i = id.toLowerCase();
  const l = labelEn.toLowerCase();
  if (i.includes('takbeer') || l.includes('takbeer')) return { durationMs: 1000, typeLabel: 'Takbeer (1s)' };
  if (i.includes('qawma') || l.includes('qawma')) return { durationMs: 1500, typeLabel: 'Rising up (1.5s)' };
  if (i.includes('qiyam') || l.includes('qiyam') || l.includes('standing')) return { durationMs: 3000, typeLabel: 'Standing (3s)' };
  if (i.includes('ruku') || l.includes('ruku') || l.includes('bowing')) return { durationMs: 2000, typeLabel: 'Bowing (2s)' };
  if (i.includes('sujood') || i.includes('sajdah') || l.includes('sujood') || l.includes('sajdah')) return { durationMs: 2000, typeLabel: 'Prostrating (2s)' };
  if (i.includes('tashahhud') || i.includes('qaidah') || l.includes('tashahhud') || l.includes('sitting')) return { durationMs: 2000, typeLabel: 'Sitting (2s)' };
  if (i.includes('salam') || l.includes('salam')) return { durationMs: 2000, typeLabel: 'Ending (2s)' };
  return { durationMs: 1500, typeLabel: 'Moving (1.5s)' };
}

function buildVisualSteps(prayerData: PrayerData): VisualGuideStep[] {
  const steps: VisualGuideStep[] = [];
  let gi = 0;
  if (prayerData.rakats && prayerData.rakats.length > 0) {
    prayerData.rakats.forEach((r) =>
      r.poses.forEach((p) => {
        const { durationMs, typeLabel } = calcStepTiming(p.id, p.label.en);
        steps.push({
          globalIndex: gi++,
          rakatNumber: r.rakat_number,
          pose: p,
          durationMs,
          typeLabel,
        });
      })
    );
  } else if (prayerData.poses) {
    prayerData.poses.forEach((p) => {
      const { durationMs, typeLabel } = calcStepTiming(p.id, p.label.en);
      steps.push({
        globalIndex: gi++,
        rakatNumber: 1,
        pose: p,
        durationMs,
        typeLabel,
      });
    });
  }
  return steps;
}

export const PrayerStepsBottomSheet = forwardRef<PrayerStepsBottomSheetHandle, PrayerStepsBottomSheetProps>(
  ({ prayerData }, ref) => {
  const { colors, isDarkMode } = useTheme();
  const accent = colors.primary;

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['82%', '94%'], []);

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetModalRef.current?.present(),
    close: () => bottomSheetModalRef.current?.dismiss(),
  }));

  const steps = useMemo(() => buildVisualSteps(prayerData), [prayerData]);
  const totalSteps = steps.length;
  const totalRakats = prayerData.total_rakats ?? 2;

  const [curIdx, setCurIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [stepProgress, setStepProgress] = useState(0);

  const isPlayingRef = useRef(false);
  const speedRef = useRef(1.0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const curStep = steps[curIdx] ?? steps[0];

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    clearTimers();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurIdx(0);
    setStepProgress(0);
  }, [clearTimers]);

  // Step change transition
  useEffect(() => {
    setStepProgress(0);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.35, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1.0, duration: 240, useNativeDriver: true }),
    ]).start();
  }, [curIdx]);

  // Pulse animation for play button
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

  const scheduleStep = useCallback(
    (idx: number) => {
      clearTimers();
      if (idx >= totalSteps) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        setCurIdx(0);
        setStepProgress(0);
        return;
      }
      const step = steps[idx];
      const dur = step.durationMs / speedRef.current;
      startRef.current = Date.now();

      const tick = () => {
        if (!isPlayingRef.current) return;
        const ratio = Math.min((Date.now() - startRef.current) / dur, 1);
        setStepProgress(ratio);
        if (ratio < 1) {
          frameRef.current = requestAnimationFrame(tick);
        }
      };
      frameRef.current = requestAnimationFrame(tick);

      timerRef.current = setTimeout(() => {
        if (!isPlayingRef.current) return;
        const next = idx + 1;
        if (next < totalSteps) {
          setCurIdx(next);
          scheduleStep(next);
        } else {
          setIsPlaying(false);
          isPlayingRef.current = false;
          setCurIdx(0);
          setStepProgress(0);
        }
      }, dur);
    },
    [clearTimers, steps, totalSteps]
  );

  const togglePlay = () => {
    if (isPlaying) {
      clearTimers();
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;
      scheduleStep(curIdx);
    }
  };

  const handleNext = () => {
    clearTimers();
    const n = curIdx + 1;
    if (n < totalSteps) {
      setCurIdx(n);
      if (isPlayingRef.current) scheduleStep(n);
    }
  };

  const handlePrev = () => {
    clearTimers();
    const p = curIdx - 1;
    if (p >= 0) {
      setCurIdx(p);
      if (isPlayingRef.current) scheduleStep(p);
    }
  };

  const cycleSpeed = () => {
    const ni = (SPEED_PRESETS.indexOf(speed) + 1) % SPEED_PRESETS.length;
    const newSpeed = SPEED_PRESETS[ni];
    setSpeed(newSpeed);
    speedRef.current = newSpeed;
    if (isPlayingRef.current) scheduleStep(curIdx);
  };

  const handleDismiss = useCallback(() => {
    resetState();
  }, [resetState]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.65}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={[
        styles.sheetBackground,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      handleIndicatorStyle={[
        styles.handleIndicator,
        { backgroundColor: isDarkMode ? '#475569' : '#CBD5E1' },
      ]}
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIconWrap, { backgroundColor: accent + '18' }]}>
              <Ionicons name="sparkles" size={17} color={accent} />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
                Visual Step Guide
              </Text>
              <Text style={[styles.sheetSub, { color: colors.textSecondary }]}>
                {prayerData.title.en} • Interactive Movements
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              bottomSheetModalRef.current?.dismiss();
            }}
            style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={17} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Status Chips */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusTag,
              {
                backgroundColor: isPlaying
                  ? (isDarkMode ? 'rgba(76,217,100,0.15)' : '#DCFCE7')
                  : colors.surfaceSecondary,
                borderColor: isPlaying ? '#4CD964' : colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isPlaying ? '#4CD964' : '#F59E0B' },
              ]}
            />
            <Text
              style={[
                styles.statusTagText,
                { color: isPlaying ? '#22C55E' : colors.textSecondary },
              ]}
            >
              {isPlaying ? 'AUTOPLAYING' : 'PAUSED'}
            </Text>
          </View>

          <View style={[styles.statusTag, { backgroundColor: accent }]}>
            <Ionicons name="timer-outline" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={[styles.statusTagText, { color: '#FFFFFF' }]}>
              {curStep?.typeLabel ?? ''}
            </Text>
          </View>

          <View
            style={[
              styles.statusTag,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statusTagText, { color: colors.textSecondary }]}>
              Rakat {curStep?.rakatNumber ?? 1} of {totalRakats}
            </Text>
          </View>
        </View>

        {/* Posture Illustration */}
        <Animated.View style={[styles.imageFrame, { opacity: fadeAnim }]}>
          {curStep?.pose?.posture_img && ImageAssets[curStep.pose.posture_img] ? (
            <Image
              source={ImageAssets[curStep.pose.posture_img]}
              style={styles.poseImage}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="person" size={88} color={colors.textSecondary} />
          )}
        </Animated.View>

        {/* Progress Countdown Bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceSecondary }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(stepProgress * 100, 100)}%`,
                backgroundColor: accent,
              },
            ]}
          />
        </View>

        {/* Posture Name & Metadata */}
        <View style={styles.labelRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.poseLabel, { color: colors.textPrimary }]}>
              {curStep?.pose?.label?.en ?? ''}
            </Text>
            <Text style={[styles.poseMeta, { color: colors.textSecondary }]}>
              Step {curIdx + 1} of {totalSteps} • Rakat {curStep?.rakatNumber}
            </Text>
          </View>
        </View>

        {/* Playback Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={handlePrev}
            disabled={curIdx === 0}
            style={[styles.controlBtn, { opacity: curIdx === 0 ? 0.3 : 1 }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="play-skip-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity onPress={togglePlay} activeOpacity={0.85} style={styles.playBtnWrap}>
              <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.playBtn}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={26}
                  color="#FFFFFF"
                  style={!isPlaying ? { marginLeft: 3 } : undefined}
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            onPress={handleNext}
            disabled={curIdx >= totalSteps - 1}
            style={[styles.controlBtn, { opacity: curIdx >= totalSteps - 1 ? 0.3 : 1 }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="play-skip-forward" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={cycleSpeed}
            activeOpacity={0.7}
            style={[styles.speedPill, { backgroundColor: colors.surfaceSecondary }]}
          >
            <Text style={[styles.speedPillText, { color: accent }]}>{speed}x</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
  },
  handleIndicator: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    marginTop: 6,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sheetSub: {
    fontSize: 11.5,
    marginTop: 1.5,
    fontWeight: '500',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    paddingTop: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  statusTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  imageFrame: {
    height: 200,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poseImage: {
    width: '100%',
    height: '100%',
  },
  progressTrack: {
    height: 4,
    marginTop: 8,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 2,
  },
  poseLabel: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  poseMeta: {
    fontSize: 12,
    marginTop: 2.5,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    paddingTop: 16,
  },
  controlBtn: {
    padding: 6,
  },
  playBtnWrap: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  speedPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
