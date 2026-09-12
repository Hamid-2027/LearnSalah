import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import Svg, {
  Path,
  Circle,
  Rect,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  RadialGradient,
} from 'react-native-svg';

interface HeaderBannerProps {
  onOpenSidebar: () => void;
  hijriDate?: string;
  gregorianDate?: string;
  currentPrayer?: string;
  nextPrayer?: string;
  nextPrayerTime?: string;
}

/**
 * 3D White Mosque Dome & Minaret vector illustration matching the reference image.
 * Features 3D shaded white dome, tall minaret tower, and warm golden sunset glow at base.
 */
const WhiteMosqueIllustration = () => (
  <Svg width={68} height={75} viewBox="0 0 68 75" fill="none">
    <Defs>
      {/* Warm Golden/Orange Sunset Glow behind dome base */}
      <RadialGradient id="sunsetGlow" cx="24" cy="58" r="28" gradientUnits="userSpaceOnUse">
        <Stop offset="0%" stopColor="#FFA43A" stopOpacity={0.9} />
        <Stop offset="45%" stopColor="#FF7A30" stopOpacity={0.5} />
        <Stop offset="100%" stopColor="#FF5030" stopOpacity={0} />
      </RadialGradient>

      {/* 3D White/Silver Dome Gradient */}
      <SvgGradient id="dome3D" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFFFFF" />
        <Stop offset="50%" stopColor="#F5F3F8" />
        <Stop offset="85%" stopColor="#DCD6EA" />
        <Stop offset="100%" stopColor="#C4BCDA" />
      </SvgGradient>

      {/* 3D Minaret Tower Gradient */}
      <SvgGradient id="minaret3D" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#FFFFFF" />
        <Stop offset="35%" stopColor="#FAF8FC" />
        <Stop offset="75%" stopColor="#E2DCED" />
        <Stop offset="100%" stopColor="#C5BDD9" />
      </SvgGradient>

      {/* Finial Gold Gradient */}
      <SvgGradient id="goldFinial" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#F5D77F" />
        <Stop offset="100%" stopColor="#B58F38" />
      </SvgGradient>
    </Defs>

    {/* Warm Sunset Glow at Base */}
    <Circle cx="24" cy="56" r="24" fill="url(#sunsetGlow)" />

    {/* 3D White Mosque Main Dome */}
    <Path
      d="M 6 62 C 6 36, 18 25, 25 25 C 32 25, 44 36, 44 62 Z"
      fill="url(#dome3D)"
    />

    {/* Dome Finial & Small Crescent Spire */}
    <Rect x="24" y="19" width="2" height="7" fill="url(#goldFinial)" />
    <Circle cx="25" cy="17.5" r="2" fill="url(#goldFinial)" />

    {/* 3D Tall Minaret Shaft */}
    <Rect x="44" y="24" width="10" height="38" rx="1.5" fill="url(#minaret3D)" />

    {/* Minaret Balconies */}
    <Rect x="42" y="38" width="14" height="3.5" rx="1" fill="#E2DCED" />
    <Rect x="43" y="26" width="12" height="3.5" rx="1" fill="#E2DCED" />

    {/* Minaret Dome Top & Spire */}
    <Path d="M 44 24 C 44 14, 49 10, 49 10 C 49 10, 54 14, 54 24 Z" fill="url(#dome3D)" />
    <Rect x="48.5" y="6" width="1" height="4" fill="url(#goldFinial)" />
    <Circle cx="49" cy="5" r="1.2" fill="url(#goldFinial)" />
  </Svg>
);

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  onOpenSidebar,
  hijriDate = '18 Rabi I, 1448',
  gregorianDate = 'Tue 01-09-26',
  currentPrayer = 'SUNRISE',
  nextPrayer = 'DHUHR',
  nextPrayerTime = '12:08 pm',
}) => {
  return (
    <LinearGradient
      colors={['#C2B0E1', '#D6C3EC', '#E5CEE3', '#F8DAC9']}
      style={styles.gradientHeader}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Top Header Row */}
        <View style={styles.topRow}>
          {/* Hamburger Menu Button */}
          <TouchableOpacity
            style={styles.hamburgerBtn}
            onPress={onOpenSidebar}
            activeOpacity={0.7}
          >
            <Feather name="menu" size={26} color="#1D1A2B" />
          </TouchableOpacity>

          {/* Hijri & Gregorian Dates */}
          <View style={styles.dateContainer}>
            <View style={styles.hijriRow}>
              <Ionicons name="calendar-outline" size={16} color="#2B2342" style={{ marginRight: 6 }} />
              <Text style={styles.hijriText}>{hijriDate}</Text>
            </View>
            <Text style={styles.gregorianText}>{gregorianDate}</Text>
          </View>

          {/* Balance spacer */}
          <View style={styles.rightSpacer} />
        </View>

        {/* Prayer Time Banner Pill Card */}
        <View style={styles.prayerPillWrapper}>
          <View style={styles.prayerPillCard}>
            {/* Left 3D White Mosque Illustration (extending minaret above pill) */}
            <View style={styles.mosqueIllustrationContainer}>
              <WhiteMosqueIllustration />
            </View>

            {/* Prayer Status Info Grid */}
            <View style={styles.prayerInfoContainer}>
              {/* Row 1: Now & Time */}
              <View style={styles.nowRow}>
                <Text style={styles.nowLabel}>Now</Text>
                <Text style={styles.timeText}>{nextPrayerTime}</Text>
              </View>

              {/* Row 2: SUNRISE → DHUHR */}
              <View style={styles.prayerTransitionRow}>
                <Text style={styles.currentPrayerText}>{currentPrayer}</Text>
                <Text style={styles.arrowText}>→</Text>
                <Text style={styles.nextPrayerText}>{nextPrayer}</Text>
              </View>
            </View>

            {/* Red Warning Alert Triangle */}
            <View style={styles.alertContainer}>
              <Ionicons name="warning" size={24} color="#FF1F1F" />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientHeader: {
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  safeArea: {
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateContainer: {
    alignItems: 'center',
  },
  hijriRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hijriText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#241D35',
    letterSpacing: 0.2,
  },
  gregorianText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A4068',
    marginTop: 2,
  },
  rightSpacer: {
    width: 40,
  },

  // Prayer Pill Wrapper & Card
  prayerPillWrapper: {
    marginTop: 14,
    marginHorizontal: 2,
    position: 'relative',
  },
  prayerPillCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 64, // Space reserved for 3D Mosque on left
    paddingRight: 12,
    minHeight: 64,
    position: 'relative',
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#6B4C9A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  mosqueIllustrationContainer: {
    position: 'absolute',
    left: 2,
    bottom: -2,
    zIndex: 10,
  },
  prayerInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingRight: 10,
  },
  nowLabel: {
    fontSize: 13,
    color: '#554A6B',
    fontWeight: '600',
  },
  timeText: {
    fontSize: 13,
    color: '#554A6B',
    fontWeight: '600',
  },
  prayerTransitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  currentPrayerText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#342B48',
    letterSpacing: 0.4,
  },
  arrowText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#342B48',
  },
  nextPrayerText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#342B48',
    letterSpacing: 0.4,
  },
  alertContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
});
