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
import { useTheme } from '../context/ThemeContext';
import Svg, {
  Path,
  Circle,
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
  lang?: string;
}

import { getPrayerScheduleForNow } from '../utils/prayerTimes';

/**
 * Mosque illustration using vector path
 */
const WhiteMosqueIllustration = () => (
  <Svg
    width={47}
    height={73}
    viewBox="0 0 7700 12800"
    fill="none"
  >
    <Defs>
      <SvgGradient id="mosqueBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFFFFF" />
        <Stop offset="60%" stopColor="#EFF6FF" />
        <Stop offset="100%" stopColor="#DBEAFE" />
      </SvgGradient>
    </Defs>

    <Path
      transform="translate(0, 12800) scale(1, -1)"
      d="M976 12730 c-86 -92 -121 -140 -161 -223 -101 -207 -58 -496 104
-707 72 -93 70 -106 -27 -239 -139 -188 -220 -349 -241 -481 -7 -42 -11 -357
-11 -877 l0 -813 -60 0 -60 0 0 35 0 35 -50 0 -50 0 0 -208 0 -208 90 -100 89
-99 1 -807 0 -808 -115 0 -115 0 0 30 0 30 -65 0 -65 0 0 -197 0 -198 150
-261 150 -261 0 -1024 c0 -563 -5 -1087 -10 -1165 -11 -172 -32 -264 -82 -358
-68 -125 -99 -196 -120 -275 -21 -72 -22 -105 -27 -646 l-6 -570 -34 0 c-28 0
-38 6 -51 30 -31 56 -77 45 -167 -38 l-43 -40 0 -1143 0 -1144 3850 0 3850 0
0 880 0 880 -35 0 -35 0 0 223 c0 122 -5 239 -10 259 -15 53 -56 97 -115 124
-49 24 -54 24 -402 24 -194 0 -353 3 -353 6 0 3 18 27 41 52 102 116 208 306
264 475 129 385 84 858 -112 1188 -149 251 -473 578 -864 874 -246 186 -363
258 -708 442 -366 194 -505 278 -564 340 l-27 29 2 244 3 243 63 20 c117 37
190 127 200 244 9 119 -38 204 -149 270 -87 51 -108 52 -55 3 88 -81 120 -201
73 -271 -50 -74 -143 -106 -281 -96 -99 7 -179 44 -207 97 -22 40 -25 106 -7
147 21 49 72 115 108 139 48 33 21 30 -48 -5 -78 -40 -136 -92 -162 -146 -18
-38 -21 -59 -18 -123 4 -89 23 -136 76 -187 41 -39 86 -63 152 -80 l45 -11 3
-251 2 -251 -57 -46 c-77 -61 -212 -140 -488 -286 -373 -198 -553 -311 -789
-494 -265 -207 -587 -514 -718 -686 -203 -267 -288 -528 -288 -885 0 -84 7
-190 15 -240 40 -247 140 -475 296 -671 l59 -74 -410 0 -410 0 0 488 c0 610
-9 673 -118 872 -59 107 -76 149 -98 241 -17 68 -18 166 -21 1226 l-4 1153
151 261 150 261 0 194 0 195 -67 -3 c-66 -3 -68 -4 -71 -30 l-3 -28 -110 0
-109 0 0 809 0 809 90 100 90 100 0 206 0 206 -55 0 -55 0 0 -35 0 -35 -60 0
-60 0 0 843 c0 792 -1 846 -19 907 -37 132 -103 249 -267 479 -56 79 -55 95
16 187 28 37 62 87 75 113 60 118 88 277 74 409 -17 153 -58 229 -225 416
l-51 57 -67 -71z m-208 -2952 l2 -378 -30 0 -30 0 0 381 0 380 28 -3 27 -3 3
-377z m345 -1 l2 -377 -87 0 -88 0 0 373 c0 206 3 377 7 381 4 4 42 5 85 4
l79 -3 2 -378z m237 3 l0 -380 -30 0 -30 0 0 380 0 380 30 0 30 0 0 -380z"
      fill="url(#mosqueBody)"
    />
  </Svg>
);

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  onOpenSidebar,
  hijriDate,
  gregorianDate,
  currentPrayer,
  nextPrayer,
  nextPrayerTime,
  lang = 'en',
}) => {
  const { isDarkMode, colors } = useTheme();
  const [schedule, setSchedule] = React.useState(() => getPrayerScheduleForNow(lang));

  React.useEffect(() => {
    const updateSchedule = () => setSchedule(getPrayerScheduleForNow(lang));
    updateSchedule();
    const interval = setInterval(updateSchedule, 30000);
    return () => clearInterval(interval);
  }, [lang]);

  const displayHijri = hijriDate || schedule.hijriDate;
  const displayGregorian = gregorianDate || schedule.gregorianDate;
  const displayCurrent = currentPrayer || schedule.currentPrayer;
  const displayNext = nextPrayer || schedule.nextPrayer;
  const displayNextTime = nextPrayerTime || schedule.nextPrayerTime;

  return (
    <LinearGradient
      colors={
        isDarkMode
          ? ['#1E3A8A', '#1D4ED8', '#2563EB', '#3B82F6']
          : ['#1E40AF', '#1D4ED8', '#2563EB', '#3B82F6']
      }
      style={styles.gradientHeader}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? 8 : 4 }]}>
        {/* Top Header Row */}
        <View style={styles.topRow}>
          {/* Hamburger Menu Button */}
          <TouchableOpacity
            style={styles.hamburgerBtn}
            onPress={onOpenSidebar}
            activeOpacity={0.7}
          >
            <Feather name="menu" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Hijri & Gregorian Dates */}
          <View style={styles.dateContainer}>
            <View style={styles.hijriRow}>
              <Ionicons name="calendar-outline" size={16} color="rgba(255, 255, 255, 0.85)" style={{ marginRight: 6 }} />
              <Text style={[styles.hijriText, { color: '#FFFFFF' }]}>{displayHijri}</Text>
            </View>
            <Text style={[styles.gregorianText, { color: 'rgba(255, 255, 255, 0.8)' }]}>{displayGregorian}</Text>
          </View>

          {/* Balance spacer */}
          <View style={styles.rightSpacer} />
        </View>

        {/* Prayer Time Banner Pill Card */}
        <View style={styles.prayerPillWrapper}>
          <View style={styles.prayerPillCard}>
            <View style={{ width: 47, marginRight: 10 }} />

            <View style={styles.prayerInfoContainer}>
              <View style={styles.nowRow}>
                <Text style={[styles.nowLabel, { color: 'rgba(255, 255, 255, 0.8)' }]}>Now</Text>
                <Text style={[styles.timeText, { color: 'rgba(255, 255, 255, 0.8)' }]}>{displayNextTime}</Text>
              </View>

              <View style={styles.prayerTransitionRow}>
                <Text style={[styles.currentPrayerText, { color: '#FFFFFF' }]}>{displayCurrent}</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={styles.arrowIcon} />
                <Text style={[styles.nextPrayerText, { color: '#FFFFFF' }]}>{displayNext}</Text>
              </View>
            </View>

            <View style={styles.alertContainer}>
              <Ionicons name="warning" size={22} color="#FF1F1F" />
            </View>
          </View>


          {/* Left 3D White Mosque Illustration (extending minaret above pill) */}
          <View style={styles.mosqueIllustrationContainer}>
            <WhiteMosqueIllustration />
          </View>
        </View>
      </View>
    </LinearGradient >
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 22,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 12,
    minHeight: 64,
    overflow: 'hidden',
  },
  mosqueIllustrationContainer: {
    position: 'absolute',
    left: 10,
    bottom: 12,
    zIndex: 100,
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
  arrowIcon: {
    marginHorizontal: 6,
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
