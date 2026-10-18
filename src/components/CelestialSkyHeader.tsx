import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar as RNStatusBar,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

export type PrayerType = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

interface CelestialSkyHeaderProps {
  selectedPrayer: PrayerType;
  onSelectPrayer?: (prayer: PrayerType) => void;
  prayerTime?: string;
  countdownStr?: string;
  locationName?: string;
  gregorianDate?: string;
  hijriDate?: string;
  onPrevDate?: () => void;
  onNextDate?: () => void;
  onOpenLocationModal?: () => void;
}

// ── Theme definitions for each prayer state
interface SkyTheme {
  gradientColors: [string, string, string];
  isDarkContent: boolean; // whether status bar and text should be dark or light
  textColorPrimary: string;
  textColorSecondary: string;
  sunX: number;
  sunY: number; // top offset in pixels
  sunScale: number;
  sunType: 'dawn_sun' | 'midday_sun' | 'golden_sun' | 'dusk_sun' | 'moon';
  sunColor: string;
  rayColor: string;
}

const SKY_THEMES: Record<PrayerType, SkyTheme> = {
  Fajr: {
    gradientColors: ['#2A1B54', '#8B5CF6', '#FDBA74'],
    isDarkContent: false,
    textColorPrimary: '#FFFFFF',
    textColorSecondary: 'rgba(255, 255, 255, 0.82)',
    sunX: 82,
    sunY: 65,
    sunScale: 0.85,
    sunType: 'dawn_sun',
    sunColor: '#FFD166',
    rayColor: 'rgba(255, 209, 102, 0.4)',
  },
  Dhuhr: {
    gradientColors: ['#F59E0B', '#FDE047', '#FEF3C7'],
    isDarkContent: true,
    textColorPrimary: '#1E293B',
    textColorSecondary: '#475569',
    sunX: 80,
    sunY: 15,
    sunScale: 1.15,
    sunType: 'midday_sun',
    sunColor: '#F97316',
    rayColor: 'rgba(249, 115, 22, 0.55)',
  },
  Asr: {
    gradientColors: ['#EA580C', '#FBBF24', '#FEF3C7'],
    isDarkContent: true,
    textColorPrimary: '#1E293B',
    textColorSecondary: '#475569',
    sunX: 82,
    sunY: 42,
    sunScale: 1.0,
    sunType: 'golden_sun',
    sunColor: '#F97316',
    rayColor: 'rgba(249, 115, 22, 0.5)',
  },
  Maghrib: {
    gradientColors: ['#3B0764', '#9D174D', '#FB923C'],
    isDarkContent: false,
    textColorPrimary: '#FFFFFF',
    textColorSecondary: 'rgba(255, 255, 255, 0.85)',
    sunX: 80,
    sunY: 80,
    sunScale: 0.9,
    sunType: 'dusk_sun',
    sunColor: '#FF6B6B',
    rayColor: 'rgba(255, 107, 107, 0.45)',
  },
  Isha: {
    gradientColors: ['#0B132B', '#1C2541', '#3A506B'],
    isDarkContent: false,
    textColorPrimary: '#FFFFFF',
    textColorSecondary: 'rgba(255, 255, 255, 0.8)',
    sunX: 78,
    sunY: 25,
    sunScale: 0.95,
    sunType: 'moon',
    sunColor: '#F1F5F9',
    rayColor: 'rgba(255, 255, 255, 0.3)',
  },
};

// ── Sun / Moon SVG Graphic
const SunGraphic: React.FC<{ type: SkyTheme['sunType']; sunColor: string; rayColor: string }> = ({
  type,
  sunColor,
  rayColor,
}) => {
  if (type === 'moon') {
    return (
      <Svg width={72} height={72} viewBox="0 0 100 100" fill="none">
        <Defs>
          <SvgGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor="#CBD5E1" />
          </SvgGradient>
        </Defs>
        <Path
          d="M60 15C42.3 15 28 29.3 28 47C28 64.7 42.3 79 60 79C64.6 79 68.9 78 72.8 76.2C64.2 82.5 53.5 86 42 86C20.5 86 3 68.5 3 47C3 25.5 20.5 8 42 8C53.5 8 64.2 11.5 72.8 17.8C68.9 16 64.6 15 60 15Z"
          fill="url(#moonGrad)"
        />
        <Path d="M80 18L82 22L86 24L82 26L80 30L78 26L74 24L78 22Z" fill="#FDE047" opacity={0.9} />
        <Path d="M22 10L23.5 13L26.5 14.5L23.5 16L22 19L20.5 16L17.5 14.5L20.5 13Z" fill="#FFFFFF" opacity={0.8} />
        <Path d="M88 60L89.5 62.5L92 63.5L89.5 64.5L88 67L86.5 64.5L84 63.5L86.5 62.5Z" fill="#FDE047" opacity={0.85} />
      </Svg>
    );
  }

  return (
    <Svg width={84} height={84} viewBox="0 0 120 120" fill="none">
      <Defs>
        <SvgGradient id="sunBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFF7ED" />
          <Stop offset="40%" stopColor={sunColor} />
          <Stop offset="100%" stopColor="#EA580C" />
        </SvgGradient>
      </Defs>

      {/* Outer Halo */}
      <Circle cx={60} cy={60} r={50} fill={rayColor} opacity={0.35} />
      <Circle cx={60} cy={60} r={40} fill={rayColor} opacity={0.5} />

      {/* Sun Rays */}
      <G stroke={sunColor} strokeWidth={3.5} strokeLinecap="round" opacity={0.85}>
        <Path d="M60 10L60 2" />
        <Path d="M60 110L60 118" />
        <Path d="M10 60L2 60" />
        <Path d="M110 60L118 60" />

        <Path d="M25 25L19 19" />
        <Path d="M95 95L101 101" />
        <Path d="M25 95L19 101" />
        <Path d="M95 25L101 19" />

        <Path d="M40 17L37 11" />
        <Path d="M80 103L83 109" />
        <Path d="M17 40L11 37" />
        <Path d="M103 80L109 83" />
      </G>

      {/* Main Glowing Sun Body */}
      <Circle cx={60} cy={60} r={24} fill="url(#sunBodyGrad)" />
    </Svg>
  );
};

export const CelestialSkyHeader: React.FC<CelestialSkyHeaderProps> = ({
  selectedPrayer,
  onSelectPrayer,
  prayerTime = '03:39 pm',
  countdownStr = '03:13:01',
  locationName = 'Rawalpindi',
  gregorianDate = 'Tue, 8 Sep 2026',
  hijriDate = "24 Rabi' al-Thani 1448 AH",
  onPrevDate,
  onNextDate,
  onOpenLocationModal,
}) => {
  const insets = useSafeAreaInsets();
  const theme = SKY_THEMES[selectedPrayer] || SKY_THEMES.Dhuhr;

  // Animation Refs
  const sunYAnim = useRef(new Animated.Value(theme.sunY)).current;
  const sunScaleAnim = useRef(new Animated.Value(theme.sunScale)).current;
  const rayRotateAnim = useRef(new Animated.Value(0)).current;

  // Continuous Sun Ray Rotation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rayRotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rayRotateAnim]);

  // Smooth Transition on Prayer Change
  useEffect(() => {
    Animated.parallel([
      Animated.timing(sunYAnim, {
        toValue: theme.sunY,
        duration: 650,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(sunScaleAnim, {
        toValue: theme.sunScale,
        duration: 650,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Sync hardware status bar text color
    RNStatusBar.setBarStyle(theme.isDarkContent ? 'dark-content' : 'light-content', true);
  }, [selectedPrayer, theme, sunYAnim, sunScaleAnim]);

  const spinRays = rayRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const topInset = insets.top > 0 ? insets.top : Platform.OS === 'android' ? RNStatusBar.currentHeight || 24 : 44;

  return (
    <LinearGradient
      colors={theme.gradientColors}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.headerContainer, { paddingTop: topInset + 8 }]}
    >
      {/* Dynamic Animated Sun / Moon Graphic */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.celestialWrapper,
          {
            top: topInset + 10,
            transform: [{ translateY: sunYAnim }, { scale: sunScaleAnim }, { rotate: spinRays }],
          },
        ]}
      >
        <SunGraphic type={theme.sunType} sunColor={theme.sunColor} rayColor={theme.rayColor} />
      </Animated.View>

      {/* Main Content Info */}
      <View style={styles.contentWrapper}>
        {/* Next Prayer Label */}
        <Text style={[styles.nextPrayerLabel, { color: theme.textColorSecondary }]}>
          Next prayer
        </Text>

        {/* Selected Prayer Name */}
        <Text style={[styles.prayerTitle, { color: theme.textColorPrimary }]}>
          {selectedPrayer}
        </Text>

        {/* Prayer Main Time */}
        <Text style={[styles.prayerTimeText, { color: theme.textColorPrimary }]}>
          {prayerTime}
        </Text>

        {/* Live Countdown & Location Row */}
        <View style={styles.metaRow}>
          {/* Live Countdown */}
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={17} color={theme.textColorPrimary} style={{ marginRight: 6 }} />
            <Text style={[styles.metaText, { color: theme.textColorPrimary }]}>{countdownStr}</Text>
          </View>

          {/* Location Chip */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenLocationModal}
            style={styles.metaItem}
          >
            <Ionicons name="location-outline" size={17} color={theme.textColorPrimary} style={{ marginRight: 5 }} />
            <Text style={[styles.metaText, { color: theme.textColorPrimary }]}>{locationName}</Text>
          </TouchableOpacity>
        </View>

        {/* Interactive Date Navigation Row */}
        <View style={styles.dateNavRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPrevDate}
            style={[styles.arrowBtn, { backgroundColor: theme.isDarkContent ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.2)' }]}
          >
            <Ionicons name="chevron-back" size={18} color={theme.textColorPrimary} />
          </TouchableOpacity>

          <View style={styles.dateCenterInfo}>
            <Text style={[styles.gregorianDateText, { color: theme.textColorPrimary }]}>
              {gregorianDate}
            </Text>
            <Text style={[styles.hijriDateText, { color: theme.textColorSecondary }]}>
              {hijriDate}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onNextDate}
            style={[styles.arrowBtn, { backgroundColor: theme.isDarkContent ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.2)' }]}
          >
            <Ionicons name="chevron-forward" size={18} color={theme.textColorPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  celestialWrapper: {
    position: 'absolute',
    right: 24,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 2,
  },
  nextPrayerLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  prayerTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  prayerTimeText: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dateNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenterInfo: {
    alignItems: 'center',
  },
  gregorianDateText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  hijriDateText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
