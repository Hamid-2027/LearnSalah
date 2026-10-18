/**
 * Onboarding shared components & style tokens.
 *
 * StarryBackground  – animated deep-space canvas
 * OnboardingProgressBar – luminous top progress indicator
 * BotBubble – glowing assistant chat bubble
 * PillButton – primary / secondary pill-shaped button
 * RadioCard – selectable card with radio circle
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SW, height: SH } = Dimensions.get('window');

// ── Colour tokens ─────────────────────────────────────────────────────────────
export const C = {
  // Backgrounds
  bg: '#060d1f',
  bgCard: '#0d1b35',
  bgCardLight: '#122040',

  // Primary brand / accent
  cyan: '#22d3ee',
  cyanDark: '#0891b2',
  blue: '#2563eb',
  blueBright: '#3b82f6',

  // Text
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.55)',
  textMuted: 'rgba(255,255,255,0.35)',

  // Misc
  border: 'rgba(34,211,238,0.25)',
  borderActive: '#22d3ee',
  gold: '#f59e0b',
} as const;

// ── StarryBackground ──────────────────────────────────────────────────────────
interface StarProps {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

function Star({ x, y, size, delay, duration }: StarProps) {
  const opacity = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: duration * 0.5,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.1,
          duration: duration * 0.5,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#ffffff',
        opacity,
      }}
    />
  );
}

// Pre-generate deterministic star positions (so renders are consistent)
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: ((i * 137.508 * SW) / 360) % SW,
  y: ((i * 97.33 * SH) / 800) % SH,
  size: i % 3 === 0 ? 2.5 : i % 5 === 0 ? 2 : 1.5,
  delay: (i * 200) % 3000,
  duration: 2500 + (i * 300) % 2000,
}));

export function StarryBackground({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        children ? { flex: 1, backgroundColor: C.bg } : StyleSheet.absoluteFillObject,
        { backgroundColor: C.bg },
        style,
      ]}
      pointerEvents={children ? 'auto' : 'none'}
    >
      {STARS.map((s) => (
        <Star key={s.id} x={s.x} y={s.y} size={s.size} delay={s.delay} duration={s.duration} />
      ))}
      {children}
    </View>
  );
}

// ── OnboardingProgressBar ─────────────────────────────────────────────────────
interface ProgressBarProps {
  current: number; // 0-based step index
  total: number;
}

export function OnboardingProgressBar({ current, total }: ProgressBarProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const targetWidth = (current / (total - 1)) * (SW - 80);

  useEffect(() => {
    Animated.spring(progress, {
      toValue: targetWidth,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  }, [current]);

  return (
    <View style={pb.container}>
      <View style={pb.track}>
        <Animated.View style={[pb.fill, { width: progress }]} />
      </View>
    </View>
  );
}

const pb = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 8 },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: C.cyan,
  },
});

// ── BotBubble ─────────────────────────────────────────────────────────────────
interface BotBubbleProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function BotBubble({ children, style }: BotBubbleProps) {
  return (
    <View style={[bb.row, style]}>
      {/* Glowing circular avatar */}
      <View style={bb.avatarWrapper}>
        <View style={bb.avatarGlow} />
        <View style={bb.avatar}>
          {/* Inner badge icon – star/sun symbol */}
          <View style={bb.innerBadge} />
          {/* Ring decoration */}
          <View style={bb.ring} />
        </View>
      </View>

      {/* Speech bubble */}
      <View style={bb.bubble}>
        <Text style={bb.text}>{children}</Text>
      </View>
    </View>
  );
}

const AVATAR_SIZE = 52;
const bb = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlow: {
    position: 'absolute',
    width: AVATAR_SIZE + 10,
    height: AVATAR_SIZE + 10,
    borderRadius: (AVATAR_SIZE + 10) / 2,
    backgroundColor: C.cyan,
    opacity: 0.18,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bgCard,
  },
  innerBadge: {
    width: 24,
    height: 24,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
    backgroundColor: C.cyan,
    opacity: 0.9,
  },
  ring: {
    position: 'absolute',
    width: AVATAR_SIZE - 6,
    height: AVATAR_SIZE - 6,
    borderRadius: (AVATAR_SIZE - 6) / 2,
    borderWidth: 1,
    borderColor: C.cyan,
    opacity: 0.5,
  },
  bubble: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 16,
  },
  text: {
    color: C.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
});

// ── PillButton ────────────────────────────────────────────────────────────────
interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export function PillButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  labelStyle,
}: PillButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

  const handlePressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 6,
    }).start();

  const bgColor =
    disabled
      ? 'rgba(34,211,238,0.2)'
      : variant === 'primary'
      ? C.blueBright
      : variant === 'success'
      ? '#10b981'
      : 'rgba(255,255,255,0.1)';

  return (
    <Animated.View style={{ transform: [{ scale }], ...style }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        style={[
          pill.btn,
          { backgroundColor: bgColor },
          disabled && { opacity: 0.5 },
        ]}
      >
        <Text style={[pill.label, labelStyle]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const pill = StyleSheet.create({
  btn: {
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

// ── RadioCard ─────────────────────────────────────────────────────────────────
interface RadioCardProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function RadioCard({ label, selected, onPress, style }: RadioCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        rc.card,
        selected && rc.cardActive,
        style,
      ]}
    >
      <Text style={[rc.label, selected && rc.labelActive]}>{label}</Text>
      <View style={[rc.radio, selected && rc.radioActive]}>
        {selected && <View style={rc.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

const rc = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.bgCard,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingVertical: 18,
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  cardActive: {
    borderColor: C.cyan,
    backgroundColor: 'rgba(34,211,238,0.08)',
  },
  label: {
    color: C.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  labelActive: {
    color: C.textPrimary,
    fontWeight: '600',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: C.cyan,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.cyan,
  },
});
