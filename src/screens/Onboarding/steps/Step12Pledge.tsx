/**
 * Step 12 – Sacred Pledge & Signature Pad
 *
 * Features:
 * - Hadith Qudsi quote on starry background
 * - Personalised pledge text using the user's saved name
 * - Finger-drawing canvas (PanResponder-based, draws via SVG paths)
 * - "Hold to lock in your Promise!" long-press button with
 *   Animated.View width progress bar + haptic-style pulse
 */
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { C, OnboardingProgressBar } from '../components/OnboardingShared';
import { useOnboarding } from '../../../store/hooks';

const { width: SW } = Dimensions.get('window');
const PAD_W = SW - 48;
const PAD_H = 160;
const HOLD_DURATION = 1500; // ms
const BTN_W = SW - 48;

interface Props {
  onNext: () => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}

// ── SVG path string builder ────────────────────────────────────────────────────
function pointsToPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ` + rest.map((p) => `L ${p.x} ${p.y}`).join(' ');
}

// ── Hold-to-Lock button with animated progress bar ────────────────────────────
function HoldButton({ onHoldComplete }: { onHoldComplete: () => void }) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);

  const startHold = () => {
    if (done) return;
    setHolding(true);

    // Subtle scale press effect
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    animRef.current = Animated.timing(progressAnim, {
      toValue: BTN_W - 4,
      duration: HOLD_DURATION,
      useNativeDriver: false,
    });
    animRef.current.start(({ finished }) => {
      if (finished) {
        setDone(true);
        onHoldComplete();
      }
    });
  };

  const stopHold = () => {
    if (done) return;
    setHolding(false);

    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 6,
    }).start();

    animRef.current?.stop();
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Animated.View style={[hb.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={startHold}
        onPressOut={stopHold}
        style={hb.btn}
      >
        {/* Progress fill */}
        <Animated.View
          style={[
            hb.fill,
            {
              width: progressAnim,
              backgroundColor: done ? '#10b981' : C.cyan,
            },
          ]}
        />
        {/* Label */}
        <Text style={hb.label}>
          {done ? '✓  Promise Locked!' : holding ? 'Keep holding…' : 'Hold to lock in your Promise!'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function Step12Pledge({ onNext, onBack, stepIndex, totalSteps }: Props) {
  const { name, lockPledge, finish } = useOnboarding();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Signature canvas state
  const [paths, setPaths] = useState<{ x: number; y: number }[][]>([]);
  const currentPath = useRef<{ x: number; y: number }[]>([]);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  // Track current live path for re-render
  const [livePath, setLivePath] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // ── PanResponder for finger drawing ──────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (e) => {
        setIsDrawing(true);
        const { locationX, locationY } = e.nativeEvent;
        currentPath.current = [{ x: locationX, y: locationY }];
        setHasSignature(true);
        setLivePath([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        currentPath.current = [...currentPath.current, { x: locationX, y: locationY }];
        setLivePath([...currentPath.current]);
      },
      onPanResponderRelease: () => {
        setIsDrawing(false);
        if (currentPath.current.length > 1) {
          setPaths((prev) => [...prev, [...currentPath.current]]);
        }
        currentPath.current = [];
        setLivePath([]);
      },
      onPanResponderTerminate: () => {
        setIsDrawing(false);
        if (currentPath.current.length > 1) {
          setPaths((prev) => [...prev, [...currentPath.current]]);
        }
        currentPath.current = [];
        setLivePath([]);
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
    })
  ).current;

  const handleClear = () => {
    setPaths([]);
    currentPath.current = [];
    setLivePath([]);
    setHasSignature(false);
    setIsDrawing(false);
  };

  const handleHoldComplete = () => {
    lockPledge();
    finish();
    setTimeout(onNext, 600);
  };

  const displayName = name || 'Friend';

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
      <OnboardingProgressBar current={stepIndex} total={totalSteps} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!isDrawing}
      >
        {/* Hadith Qudsi */}
        <Text style={s.quranLabel}>Allah SWT said:</Text>
        <Text style={s.quote}>
          "If he (my servant) comes to Me walking, I go to him running."
        </Text>
        <Text style={s.reference}>Sahih al-Bukhari (7405)</Text>

        {/* Personalised pledge text */}
        <Text style={s.pledgeText}>
          I, <Text style={s.namePart}>{displayName}</Text>, promise to do
          everything in my power to strive closer to Allah and start praying.{'\n\n'}
          May Allah guide me and others on this journey.
        </Text>

        {/* Signature pad */}
        <View style={s.padWrapper} {...panResponder.panHandlers}>
          <Svg
            width={PAD_W}
            height={PAD_H}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {/* Completed strokes */}
            {paths.map((pts, i) => (
              <Path
                key={i}
                d={pointsToPath(pts)}
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            {/* Live in-progress stroke */}
            {livePath.length > 1 && (
              <Path
                d={pointsToPath(livePath)}
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </Svg>

          {!hasSignature && (
            <Text style={s.padPlaceholder}>Sign here</Text>
          )}

          {/* Base line */}
          <View style={s.padLine} />
        </View>

        {hasSignature && (
          <TouchableOpacity onPress={handleClear} style={s.clearBtn}>
            <Text style={s.clearLabel}>✕  Clear signature</Text>
          </TouchableOpacity>
        )}

        {/* Extra space before button */}
        <View style={{ height: 28 }} />
      </ScrollView>

      {/* Hold-to-lock button pinned at bottom */}
      <View style={s.footer}>
        <HoldButton onHoldComplete={handleHoldComplete} />
      </View>
    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const hb = StyleSheet.create({
  wrapper: {
    marginHorizontal: 24,
  },
  btn: {
    height: 56,
    borderRadius: 50,
    backgroundColor: 'rgba(34,211,238,0.08)',
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 2,
    top: 2,
    bottom: 2,
    borderRadius: 50,
    opacity: 0.25,
  },
  label: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    zIndex: 1,
  },
});

const s = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  quranLabel: {
    color: C.cyan,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  quote: {
    color: C.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 8,
  },
  reference: {
    color: C.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },
  pledgeText: {
    color: C.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  namePart: {
    color: C.textPrimary,
    fontWeight: '700',
  },
  padWrapper: {
    width: PAD_W,
    height: PAD_H,
    backgroundColor: C.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  padPlaceholder: {
    color: C.textMuted,
    fontSize: 15,
    position: 'absolute',
  },
  padLine: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  clearBtn: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearLabel: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 36,
  },
});
