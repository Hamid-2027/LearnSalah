import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageAssets, AudioAssets } from '../utils/assetsMap';
import { PhraseCard } from './PhraseCard';
import { useTheme } from '../context/ThemeContext';

export interface Phrase {
  id: string;
  arabic: string;
  transliteration: string;
  translation_ur: string;
  audio_ar?: string;
}

export interface Pose {
  id: string;
  posture_img: string;
  label: { en: string; ur: string };
  phrases: Phrase[];
}

export interface Rakat {
  rakat_number: number;
  is_final_rakat?: boolean;
  poses: Pose[];
}

export interface PrayerData {
  prayer_id: string;
  title: { en: string; ur: string };
  total_rakats?: number;
  poses?: Pose[];
  rakats?: Rakat[];
}

interface PrayerPlayerProps {
  prayerData: PrayerData;
  onBack: () => void;
  hideHeader?: boolean;
}

const SPEED_OPTIONS = [0.5, 0.6, 0.75, 0.85, 1.0, 1.1, 1.25, 1.5, 1.75, 2.0];

function buildSteps(prayerData: PrayerData) {
  const steps: { poseIndex: number; phraseIndex: number; rakatNumber: number }[] = [];
  if (prayerData.rakats && prayerData.rakats.length > 0) {
    let globalPoseIdx = 0;
    prayerData.rakats.forEach((rakat) => {
      rakat.poses.forEach((pose) => {
        if (pose.phrases.length === 0) {
          steps.push({ poseIndex: globalPoseIdx, phraseIndex: -1, rakatNumber: rakat.rakat_number });
        } else {
          pose.phrases.forEach((_, phi) => {
            steps.push({ poseIndex: globalPoseIdx, phraseIndex: phi, rakatNumber: rakat.rakat_number });
          });
        }
        globalPoseIdx++;
      });
    });
  } else if (prayerData.poses && prayerData.poses.length > 0) {
    prayerData.poses.forEach((pose, pi) => {
      if (pose.phrases.length === 0) {
        steps.push({ poseIndex: pi, phraseIndex: -1, rakatNumber: 1 });
      } else {
        pose.phrases.forEach((_, phi) => {
          steps.push({ poseIndex: pi, phraseIndex: phi, rakatNumber: 1 });
        });
      }
    });
  }
  return steps;
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const PrayerPlayer = ({ prayerData, onBack, hideHeader = false }: PrayerPlayerProps) => {
  const { isDarkMode, colors } = useTheme();

  const poses: Pose[] = (prayerData.poses && prayerData.poses.length > 0)
    ? prayerData.poses
    : (prayerData.rakats ? prayerData.rakats.flatMap((r) => r.poses) : []);

  const insets = useSafeAreaInsets();
  // On Android, gesture nav bar is typically 48dp; fallback ensures controls are never hidden.
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 48 : 20) + 4;

  const steps = buildSteps(prayerData);
  const totalSteps = steps.length;

  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [fontSize, setFontSize] = useState(16);
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioPosition, setAudioPosition] = useState(0);

  const soundRef = useRef<Audio.Sound | null>(null);
  // Incremented every time a new sound is created; callbacks compare against this to detect staleness.
  const soundInstanceIdRef = useRef(0);
  const flatListRef = useRef<FlatList>(null);
  const isPlayingRef = useRef(false);
  const isLoopingRef = useRef(false);
  const stepIndexRef = useRef(0);
  const isMountedRef = useRef(true);
  const playbackRateRef = useRef(1.0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const speedModalAnim = useRef(new Animated.Value(0)).current;

  const playCurrentPhraseRef = useRef<((phrase: Phrase | null, rate: number, autoAdvance: boolean) => Promise<void>) | null>(null);

  const currentStep = steps[stepIndex] ?? steps[0];
  const currentPose = poses[currentStep?.poseIndex ?? 0];
  const currentPhraseIndex = currentStep?.phraseIndex ?? -1;
  const currentRakatNumber = currentStep?.rakatNumber ?? 1;
  const totalRakats = prayerData.total_rakats ?? 2;
  const phrases = currentPose?.phrases || [];
  const currentPhrase = currentPhraseIndex >= 0 ? phrases[currentPhraseIndex] : null;
  const overallProgress = totalSteps > 1 ? stepIndex / (totalSteps - 1) : 0;

  useEffect(() => { playbackRateRef.current = playbackRate; }, [playbackRate]);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const savedFont = await AsyncStorage.getItem('prayer_fontSize');
        if (savedFont !== null) {
          const f = parseInt(savedFont, 10);
          if (!isNaN(f)) setFontSize(f);
        }
      } catch (_) { }
    };
    load();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('prayer_fontSize', fontSize.toString()).catch(() => { });
  }, [fontSize]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: overallProgress,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [overallProgress]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1.0, duration: 150, useNativeDriver: true }).start();
    }
  }, [isPlaying]);

  const openSpeedPicker = () => {
    setShowSpeedPicker(true);
    Animated.spring(speedModalAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }).start();
  };

  const closeSpeedPicker = () => {
    Animated.timing(speedModalAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
      setShowSpeedPicker(false)
    );
  };

  const stopAndUnload = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (_) { }
      soundRef.current = null;
    }
  }, []);

  const playCurrentPhrase = useCallback(async (phrase: Phrase | null, rate: number, autoAdvance: boolean) => {
    // Capture a unique ID for this invocation. Any callback that sees a different
    // ID knows it belongs to a stale sound instance and must be ignored.
    const myId = ++soundInstanceIdRef.current;
    await stopAndUnload();

    if (!phrase || !phrase.audio_ar || !AudioAssets[phrase.audio_ar]) {
      if (autoAdvance && isPlayingRef.current) {
        setTimeout(() => {
          if (!isMountedRef.current || !isPlayingRef.current) return;
          if (soundInstanceIdRef.current !== myId) return; // stale — a newer call already started
          goToStepRef.current?.(stepIndexRef.current + 1, true);
        }, 600);
      }
      return;
    }

    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const { sound } = await Audio.Sound.createAsync(
        AudioAssets[phrase.audio_ar],
        {
          shouldPlay: true,
          rate,
          isLooping: isLoopingRef.current,
          shouldCorrectPitch: true,
          pitchCorrectionQuality: Audio.PitchCorrectionQuality.High,
        }
      );

      // If component unmounted or a newer sound was requested while we were loading, discard.
      if (!isMountedRef.current || soundInstanceIdRef.current !== myId) {
        sound.unloadAsync().catch(() => {});
        return;
      }
      soundRef.current = sound;

      const lastProgressUpdateRef = { current: 0 };

      sound.setOnPlaybackStatusUpdate((status) => {
        // Discard callbacks from stale sound instances.
        if (soundInstanceIdRef.current !== myId) return;
        if (!status.isLoaded || !isMountedRef.current) return;

        if (!isPlayingRef.current && status.isPlaying) {
          // User paused — stop the audio.
          sound.pauseAsync().catch(() => { });
        } else if (!isPlayingRef.current && !status.isPlaying) {
          setIsPlaying(false);
        }

        if (status.durationMillis && status.durationMillis > 0) {
          const pos = status.positionMillis ?? 0;
          if (Math.abs(pos - lastProgressUpdateRef.current) > 120 || pos === 0 || status.didJustFinish) {
            lastProgressUpdateRef.current = pos;
            setAudioDuration(status.durationMillis);
            setAudioPosition(pos);
            setAudioProgress(pos / status.durationMillis);
          }
        }

        if (status.didJustFinish && autoAdvance && isPlayingRef.current && !isLoopingRef.current) {
          goToStepRef.current?.(stepIndexRef.current + 1, true);
        }
      });
    } catch (e) {
      console.log('Audio error', e);
      if (autoAdvance && isPlayingRef.current) {
        setTimeout(() => {
          if (!isMountedRef.current || !isPlayingRef.current) return;
          if (soundInstanceIdRef.current !== myId) return;
          goToStepRef.current?.(stepIndexRef.current + 1, true);
        }, 800);
      }
    }
  }, [stopAndUnload]);

  useEffect(() => {
    playCurrentPhraseRef.current = playCurrentPhrase;
  }, [playCurrentPhrase]);

  const goToStepRef = useRef<((idx: number, autoPlay: boolean) => void) | null>(null);

  const goToStep = useCallback((idx: number, autoPlay: boolean) => {
    if (!isMountedRef.current) return;

    if (idx >= totalSteps) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setAudioProgress(0);
      setAudioDuration(0);
      setAudioPosition(0);
      stepIndexRef.current = 0;
      setStepIndex(0);
      stopAndUnload();
      return;
    }
    if (idx < 0) idx = 0;

    stepIndexRef.current = idx;
    setStepIndex(idx);

    const step = steps[idx];
    const pose = poses[step.poseIndex];
    const phrase = step.phraseIndex >= 0 ? pose?.phrases[step.phraseIndex] : null;

    if (autoPlay) {
      isPlayingRef.current = true;
      setIsPlaying(true);
      setAudioProgress(0);
      setAudioDuration(0);
      setAudioPosition(0);
      playCurrentPhraseRef.current?.(phrase, playbackRateRef.current, true);
    }
  }, [steps, totalSteps, poses, stopAndUnload]);

  useEffect(() => {
    if (
      currentPhraseIndex >= 0 &&
      currentPhraseIndex < phrases.length &&
      flatListRef.current
    ) {
      const timer = setTimeout(() => {
        if (
          flatListRef.current &&
          currentPhraseIndex >= 0 &&
          currentPhraseIndex < phrases.length
        ) {
          try {
            flatListRef.current.scrollToIndex({
              index: currentPhraseIndex,
              animated: true,
              viewPosition: 0.5,
            });
          } catch (_) { }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentPhraseIndex, currentStep?.poseIndex, phrases.length]);

  useEffect(() => {
    goToStepRef.current = goToStep;
  }, [goToStep]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setRateAsync(playbackRate, true, Audio.PitchCorrectionQuality.High).catch(() => { });
    }
  }, [playbackRate]);

  const renderPhraseItem = useCallback(
    ({ item, index }: { item: Phrase; index: number }) => (
      <PhraseCard phrase={item} isActive={index === currentPhraseIndex} fontSize={fontSize} />
    ),
    [currentPhraseIndex, fontSize]
  );

  const keyExtractor = useCallback((item: Phrase, idx: number) => `${item.id}_${idx}`, []);

  const handleScrollToIndexFailed = useCallback(
    (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
      const wait = new Promise((resolve) => setTimeout(resolve, 100));
      wait
        .then(() => {
          if (!flatListRef.current) return;
          const validIndex = Math.max(0, Math.min(info.index, phrases.length - 1));
          if (phrases.length > 0 && validIndex >= 0 && validIndex < phrases.length) {
            try {
              flatListRef.current.scrollToIndex({
                index: validIndex,
                animated: true,
                viewPosition: 0.5,
              });
            } catch (_) {
              const offset = info.averageItemLength * validIndex;
              flatListRef.current.scrollToOffset({ offset, animated: true });
            }
          }
        })
        .catch(() => { });
    },
    [phrases.length]
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopAndUnload();
    };
  }, []);

  const handlePlayPause = async () => {
    if (!isPlaying) {
      isPlayingRef.current = true;
      setIsPlaying(true);
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync().catch(() => null);
        if (status && status.isLoaded && !status.didJustFinish) {
          soundRef.current.playAsync().catch(() => { });
          return;
        }
      }
      playCurrentPhrase(currentPhrase, playbackRate, true);
    } else {
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (soundRef.current) soundRef.current.pauseAsync().catch(() => { });
    }
  };

  const handleNext = () => {
    const next = stepIndexRef.current + 1;
    if (next >= totalSteps) return;
    goToStep(next, isPlayingRef.current);
  };

  const handlePrev = () => {
    const prev = stepIndexRef.current - 1;
    if (prev < 0) return;
    goToStep(prev, isPlayingRef.current);
  };

  const handleSpeedSelect = (speed: number) => {
    setPlaybackRate(speed);
    playbackRateRef.current = speed;
    if (soundRef.current) soundRef.current.setRateAsync(speed, true, Audio.PitchCorrectionQuality.High).catch(() => { });
    setShowSpeedPicker(false);
  };

  const toggleLoop = () => {
    const newLoop = !isLooping;
    setIsLooping(newLoop);
    isLoopingRef.current = newLoop;
    if (soundRef.current) {
      soundRef.current.setIsLoopingAsync(newLoop).catch(() => { });
    }
  };

  const toggleFontSize = () => setFontSize(prev => (prev >= 24 ? 12 : prev + 4));

  const accentColor = colors.primary;
  const progressBarBg = colors.surfaceSecondary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={hideHeader ? ['left', 'right'] : ['top', 'left', 'right']}>
      {!hideHeader && (
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onBack} style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {prayerData.title.en}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Step {stepIndex + 1} of {totalSteps}
            </Text>
          </View>
          <View style={[styles.rakatBadge, { backgroundColor: colors.surfaceSecondary, borderColor: accentColor }]}>
            <Ionicons name="sparkles" size={11} color={accentColor} style={{ marginRight: 4 }} />
            <Text style={[styles.rakatBadgeText, { color: accentColor }]}>
              Rakat {currentRakatNumber}/{totalRakats}
            </Text>
          </View>
        </View>
      )}

      <View style={[styles.progressSection, { backgroundColor: colors.surface }]}>
        <View style={styles.progressLabelRow}>
          <Text style={[styles.progressLabelText, { color: colors.textSecondary }]}>PROGRESS</Text>
          <Text style={[styles.progressLabelText, { color: accentColor, fontWeight: '700' }]}>
            {Math.round(overallProgress * 100)}%
          </Text>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: progressBarBg }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.progressShimmer} />
            <View style={[styles.progressThumb, { backgroundColor: colors.primary, shadowColor: accentColor }]} />
          </Animated.View>
        </View>

        <View style={styles.stepDotsRow}>
          {poses.map((pose, pi) => {
            const isCurrentPose = pi === currentStep.poseIndex;
            const isPastPose = pi < currentStep.poseIndex;
            return (
              <View
                key={`dot_${pi}`}
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: isCurrentPose ? accentColor : isPastPose ? colors.secondary : progressBarBg,
                    flex: 1,
                    height: isCurrentPose ? 5 : 3.5,
                    borderRadius: 2,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Audio micro progress */}
        <View style={[styles.audioProgressRow, { opacity: audioDuration > 0 ? 1 : 0 }]}>
          <Ionicons name="musical-notes" size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
          <View style={[styles.audioTrack, { backgroundColor: progressBarBg }]}>
            <View
              style={[
                styles.audioFill,
                { width: `${Math.min(audioProgress * 100, 100)}%`, backgroundColor: accentColor },
              ]}
            />
          </View>
          <Text style={[styles.audioTimeText, { color: colors.textSecondary }]}>
            {formatMs(audioPosition)}/{formatMs(audioDuration)}
          </Text>
        </View>
      </View>

      {/* Full Posture Image View */}
      <View style={[styles.imageCardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.imageContainer, { backgroundColor: colors.background }]}>
          {currentPose?.posture_img && ImageAssets[currentPose.posture_img] ? (
            <Image source={ImageAssets[currentPose.posture_img]} style={styles.poseImage} resizeMode="contain" />
          ) : (
            <Ionicons name="person" size={80} color={colors.textSecondary} />
          )}
        </View>

        {/* Clean Pose Title Bar below full image */}
        <View style={[styles.poseTitleBar, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <Ionicons name="body-outline" size={15} color={accentColor} style={{ marginRight: 6 }} />
          <Text style={[styles.poseTitleText, { color: colors.textPrimary }]}>
            {currentPose?.label?.en}
          </Text>
        </View>
      </View>

      {/* Phrase List */}
      {phrases.length > 0 ? (
        <FlatList
          key={`pose_list_${currentStep?.poseIndex ?? 0}`}
          ref={flatListRef}
          data={phrases}
          extraData={currentPhraseIndex}
          keyExtractor={keyExtractor}
          renderItem={renderPhraseItem}
          removeClippedSubviews={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding + 80 }]}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyPhrasesContainer}>
          <Ionicons name="time-outline" size={32} color={colors.textSecondary} style={{ marginBottom: 8 }} />
          <Text style={[styles.emptyPhrasesText, { color: colors.textSecondary }]}>Transition — no recitation</Text>
        </View>
      )}

      {/* Compact Floating Speed Toolbar */}
      {showSpeedPicker && (
        <Animated.View
          style={[
            styles.compactSpeedToolbar,
            {
              backgroundColor: colors.surface,
              borderColor: accentColor,
              shadowColor: accentColor,
              bottom: bottomPadding + 62,
            },
          ]}
        >
          <View style={styles.compactSpeedHeaderRow}>
            <Ionicons name="speedometer-outline" size={13} color={accentColor} style={{ marginRight: 4 }} />
            <Text style={[styles.compactSpeedHeaderTitle, { color: colors.textSecondary }]}>SPEED</Text>
          </View>

          <View style={styles.speedScrollWrapper}>
            <Ionicons name="chevron-back" size={16} color={accentColor} style={{ marginRight: 4 }} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.compactSpeedPillsRow}
            >
              {SPEED_OPTIONS.map((speed) => {
                const isSelected = Math.abs(playbackRate - speed) < 0.01;
                return (
                  <TouchableOpacity
                    key={speed}
                    onPress={() => handleSpeedSelect(speed)}
                    style={[
                      styles.compactSpeedPill,
                      {
                        backgroundColor: isSelected ? accentColor : colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.compactSpeedPillText,
                        {
                          color: isSelected ? '#FFFFFF' : colors.textPrimary,
                          fontWeight: isSelected ? '700' : '600',
                        },
                      ]}
                    >
                      {speed % 1 === 0 ? `${speed.toFixed(0)}x` : `${speed}x`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Ionicons name="chevron-forward" size={16} color={accentColor} style={{ marginLeft: 4 }} />
          </View>
        </Animated.View>
      )}

      {/* Controls Bar */}
      <View
        style={[
          styles.controlsContainer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: bottomPadding,
          },
        ]}
      >
        {/* Speed Button */}
        <TouchableOpacity
          onPress={() => setShowSpeedPicker(prev => !prev)}
          style={styles.controlSideButton}
          accessibilityLabel="Playback speed"
        >
          <View style={[styles.speedBadge, { backgroundColor: showSpeedPicker ? accentColor : colors.surfaceSecondary }]}>
            <Text style={[styles.speedBadgeText, { color: showSpeedPicker ? '#FFFFFF' : accentColor }]}>
              {playbackRate % 1 === 0 ? `${playbackRate.toFixed(0)}x` : `${playbackRate}x`}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Previous */}
        <TouchableOpacity
          onPress={handlePrev}
          style={[styles.controlSideButton, { opacity: stepIndex === 0 ? 0.35 : 1 }]}
          disabled={stepIndex === 0}
        >
          <Ionicons name="play-skip-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Play/Pause */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity onPress={handlePlayPause} style={styles.playButtonWrapper}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.playButton}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={30}
                color="#fff"
                style={!isPlaying ? { marginLeft: 3 } : undefined}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Next */}
        <TouchableOpacity
          onPress={handleNext}
          style={[styles.controlSideButton, { opacity: stepIndex >= totalSteps - 1 ? 0.35 : 1 }]}
          disabled={stepIndex >= totalSteps - 1}
        >
          <Ionicons name="play-skip-forward" size={26} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Loop button is only shown on the Pose Simulation screen, not here */}

        {/* Font Size Button */}
        <TouchableOpacity onPress={toggleFontSize} style={styles.controlSideButton}>
          <View style={[styles.speedBadge, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.speedBadgeText, { color: accentColor, fontSize: 12 }]}>
              A {fontSize}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  headerSubtitle: { fontSize: 12, marginTop: 1 },
  rakatBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  rakatBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  // Progress
  progressSection: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabelText: { fontSize: 11, letterSpacing: 0.5 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, overflow: 'hidden', alignItems: 'flex-end', justifyContent: 'center' },
  progressShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.18)' },
  progressThumb: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#fff', marginRight: -7, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 0 }, shadowRadius: 6, elevation: 4 },
  stepDotsRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 8, justifyContent: 'center' },
  stepDot: { borderRadius: 2 },
  audioProgressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  audioTrack: { flex: 1, height: 3, borderRadius: 2, overflow: 'hidden' },
  audioFill: { height: '100%', borderRadius: 2 },
  audioTimeText: { fontSize: 10, marginLeft: 6, minWidth: 50, textAlign: 'right' },

  // Image Card Container & Pose Title Bar
  imageCardContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 175,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  poseImage: {
    width: '100%',
    height: '100%',
  },
  poseTitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  poseTitleText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // List
  listContent: { paddingBottom: 110, paddingTop: 4 },
  emptyPhrasesContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyPhrasesText: { fontSize: 14, fontStyle: 'italic' },

  // Compact Speed Toolbar
  compactSpeedToolbar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 88 : 74,
    left: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
    zIndex: 100,
  },
  compactSpeedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactSpeedHeaderTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  speedScrollWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactSpeedPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 8,
  },
  compactSpeedPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactSpeedPillText: {
    fontSize: 13,
  },

  // Controls
  controlsContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1 },
  controlSideButton: { padding: 6, alignItems: 'center', justifyContent: 'center', minWidth: 44 },
  speedBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  speedBadgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  playButtonWrapper: { shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 8 },
  playButton: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },

  // Speed Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end', paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  speedModal: { marginHorizontal: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden', paddingTop: 4 },
  speedModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth },
  speedModalTitle: { fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  speedOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 13, marginHorizontal: 10, marginVertical: 2, borderRadius: 12, borderWidth: 1 },
  speedOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectedDot: { width: 7, height: 7, borderRadius: 4 },
  speedOptionLabel: { fontSize: 15 },
  speedOptionRight: { flexDirection: 'row', alignItems: 'center' },
  speedValue: { fontSize: 16, fontWeight: '700' },
  speedCancelBtn: { alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, marginTop: 4 },
  speedCancelText: { fontSize: 15, fontWeight: '500' },
});
