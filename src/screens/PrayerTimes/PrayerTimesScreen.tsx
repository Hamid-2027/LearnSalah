import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  ImageBackground,
  FlatList,
  ActivityIndicator,
  StatusBar as RNStatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useScrollToTop } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import * as Location from 'expo-location';

import { useTheme, useSidebar, usePrayerTimes } from '../../store/hooks';
import { format24To12 } from '../../services/aladhanService';
import majorCities from '../../data/majorCities.json';

// Background Image Artworks for Challenges
const starterBg = require('../../assets/images/challenge_starter_bg.jpg');
const fortressBg = require('../../assets/images/challenge_fortress_bg.jpg');
const championBg = require('../../assets/images/challenge_champion_bg.jpg');

// Custom Professional SVG Badge Icons for Challenges
const StarterSvgIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <SvgGradient id="starterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FBBF24" />
        <Stop offset="100%" stopColor="#F59E0B" />
      </SvgGradient>
    </Defs>
    <Path
      d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
      fill="url(#starterGrad)"
      stroke="#D97706"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </Svg>
);

const ShieldSvgIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <SvgGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#60A5FA" />
        <Stop offset="100%" stopColor="#2563EB" />
      </SvgGradient>
    </Defs>
    <Path
      d="M12 2L4 5V11C4 16.55 7.4 21.74 12 23C16.6 21.74 20 16.55 20 11V5L12 2Z"
      fill="url(#shieldGrad)"
      stroke="#1D4ED8"
      strokeWidth="1.2"
    />
    <Path
      d="M12 7L13.2 9.8L16.2 10.1L13.9 12.1L14.6 15L12 13.5L9.4 15L10.1 12.1L7.8 10.1L10.8 9.8L12 7Z"
      fill="#FFFFFF"
      opacity="0.9"
    />
  </Svg>
);

const CrownSvgIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <SvgGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#F59E0B" />
        <Stop offset="100%" stopColor="#D4AF37" />
      </SvgGradient>
    </Defs>
    <Path
      d="M3 18L1 6L7 10L12 3L17 10L23 6L21 18H3Z"
      fill="url(#crownGrad)"
      stroke="#B45309"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="4" r="1.5" fill="#FEF08A" />
    <Circle cx="1" cy="7" r="1.2" fill="#FEF08A" />
    <Circle cx="23" cy="7" r="1.2" fill="#FEF08A" />
    <Rect x="4" y="15.5" width="16" height="2" rx="1" fill="#FEF08A" opacity="0.8" />
  </Svg>
);

const CustomPlusSvgIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" strokeDasharray="3 2" />
    <Path d="M12 7V17M7 12H17" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

interface PrayerItem {
  id: string;
  nameEn: string;
  nameUr: string;
  timeDisplay: string;
  icon: string;
}

const PRAYER_META: Omit<PrayerItem, 'timeDisplay'>[] = [
  { id: 'fajr', nameEn: 'Fajr', nameUr: 'فجر', icon: 'weather-sunset-up' },
  { id: 'sunrise', nameEn: 'Sunrise', nameUr: 'طلوعِ آفتاب', icon: 'weather-sunny' },
  { id: 'dhuhr', nameEn: 'Dhuhr', nameUr: 'ظہر', icon: 'weather-sunny-alert' },
  { id: 'asr', nameEn: 'Asr', nameUr: 'عصر', icon: 'weather-partly-cloudy' },
  { id: 'maghrib', nameEn: 'Maghrib', nameUr: 'مغرب', icon: 'weather-sunset-down' },
  { id: 'isha', nameEn: 'Isha', nameUr: 'عشاء', icon: 'weather-night' },
];

// AlAdhan timing key map
const TIMING_KEYS: Record<string, string> = {
  fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr',
  asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
};

export interface Challenge {
  id: string;
  title: string;
  daysTotal: number;
  prayersTotal: number;
  badge: string;
  iconType: 'starter' | 'shield' | 'crown' | 'custom';
  bgImage?: any;
  gradientColors: [string, string];
  description: string;
  isCustom?: boolean;
}

const PREDEFINED_CHALLENGES: Challenge[] = [
  {
    id: '1_day',
    title: 'Istiqamah Starter',
    daysTotal: 1,
    prayersTotal: 5,
    badge: 'STARTER',
    iconType: 'starter',
    bgImage: starterBg,
    gradientColors: ['#FFF7ED', '#FFEDD5'],
    description: '1 Day • 5 Prayers',
  },
  {
    id: '3_day',
    title: 'Al-Muhafiz Fortress',
    daysTotal: 3,
    prayersTotal: 15,
    badge: 'FORTRESS',
    iconType: 'shield',
    bgImage: fortressBg,
    gradientColors: ['#EFF6FF', '#DBEAFE'],
    description: '3 Days • 15 Prayers',
  },
  {
    id: '7_day',
    title: 'As-Salah Champion',
    daysTotal: 7,
    prayersTotal: 35,
    badge: 'CHAMPION',
    iconType: 'crown',
    bgImage: championBg,
    gradientColors: ['#FEFCE8', '#FEF08A'],
    description: '7 Days • 35 Prayers',
  },
];

interface PrayerTimesScreenProps {
  navigation?: any;
}

export const PrayerTimesScreen: React.FC<PrayerTimesScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isDarkMode, colors } = useTheme();
  const { openSidebar } = useSidebar();
  const {
    locationPref,
    selectedDateData,
    dayOffset,
    setDayOffset,
    isLoading,
    activeStatus,
    updateLocation,
    refreshTimings,
  } = usePrayerTimes();

  // City selector modal state
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  // Modals state
  const [historyVisible, setHistoryVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Active Challenge state
  const [challengesList, setChallengesList] = useState<Challenge[]>(PREDEFINED_CHALLENGES);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [challengeDay, setChallengeDay] = useState(1);
  const [prayersCompletedCount, setPrayersCompletedCount] = useState(0);

  // Custom Challenge Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDays, setNewDays] = useState(5);
  const [selectedIconType, setSelectedIconType] = useState<'starter' | 'shield' | 'crown' | 'custom'>('starter');

  // Alarm toggles state
  const [alarms, setAlarms] = useState<Record<string, boolean>>({
    fajr: true, sunrise: false, dhuhr: true, asr: true, maghrib: true, isha: true,
  });

  // Prayer log checkmarks state
  const [completed, setCompleted] = useState<Record<string, boolean>>({
    fajr: true, sunrise: false, dhuhr: true, asr: true, maghrib: false, isha: false,
  });

  const toggleAlarm = (id: string) => setAlarms((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleCompleted = (id: string) => {
    setCompleted((prev) => {
      const nextState = !prev[id];
      if (nextState) setPrayersCompletedCount((c) => c + 1);
      else setPrayersCompletedCount((c) => Math.max(0, c - 1));
      return { ...prev, [id]: nextState };
    });
  };

  const startChallenge = (ch: Challenge) => { setActiveChallenge(ch); setChallengeDay(1); setPrayersCompletedCount(0); };
  const leaveChallenge = () => setActiveChallenge(null);

  const handleCreateCustomChallenge = () => {
    const titleToUse = newTitle.trim() || `${newDays}-Day Custom Namaz Challenge`;
    const totalPr = newDays * 5;
    const newCh: Challenge = {
      id: `custom_${Date.now()}`, title: titleToUse, daysTotal: newDays,
      prayersTotal: totalPr, badge: `${newDays} DAYS`, iconType: selectedIconType,
      bgImage: starterBg, gradientColors: ['#EFF6FF', '#DBEAFE'],
      description: `${newDays} Days • ${totalPr} Prayers`, isCustom: true,
    };
    setChallengesList((prev) => [newCh, ...prev]);
    startChallenge(newCh);
    setNewTitle('');
    setCreateModalVisible(false);
  };

  // ── Build live prayer list from AlAdhan timings
  const DAILY_PRAYERS: PrayerItem[] = PRAYER_META.map((p) => {
    const apiKey = TIMING_KEYS[p.id];
    const rawTime = selectedDateData?.timings ? (selectedDateData.timings as any)[apiKey] : null;
    const timeDisplay = rawTime ? format24To12(rawTime) : '--:-- --';
    return { ...p, timeDisplay };
  });

  // ── Date display calculations
  const displayDate = new Date();
  displayDate.setDate(displayDate.getDate() + dayOffset);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${dayNames[displayDate.getDay()]}, ${displayDate.getDate()} ${monthNames[displayDate.getMonth()]} ${displayDate.getFullYear()}`;
  const hijriText = selectedDateData?.hijri?.formattedEn || "24 Rabi' al-Thani 1448 AH";

  // ── Active prayer & countdown from context
  const countdownStr = activeStatus.countdownStr;
  const nextPrayer = DAILY_PRAYERS.find((p) => p.nameEn === activeStatus.nextPrayerEn) || DAILY_PRAYERS[0];
  const activeIndex = activeStatus.activeIndex;
  const locationLabel = locationPref.isGPS
    ? 'GPS Location'
    : `${locationPref.cityName}, ${locationPref.countryName}`;

  // ── City selector logic
  const filteredCities = (majorCities as any[]).filter(
    (c) =>
      c.city.toLowerCase().includes(citySearch.toLowerCase()) ||
      c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleSelectCity = async (item: { city: string; country: string; lat: number; lon: number }) => {
    await updateLocation({
      isGPS: false,
      cityName: item.city,
      countryName: item.country,
      lat: item.lat,
      lon: item.lon,
    });
    setCityModalVisible(false);
    setCitySearch('');
  };

  const handleUseGPS = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await updateLocation({
        isGPS: true,
        lat: loc.coords.latitude,
        lon: loc.coords.longitude,
        cityName: 'GPS',
        countryName: '',
      });
      setCityModalVisible(false);
    } catch (e) {
      console.log('GPS error', e);
    }
  };

  const topInset = insets.top > 0 ? insets.top : (Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 44);
  const topInsetPadding = topInset + 6;
  const bottomInsetPadding = Math.max(insets.bottom, 12) + 120;

  // History past 7 days mock log
  const past7Days = [
    { day: 'Mon', date: '7 Sep', status: '5/5', completed: true },
    { day: 'Tue', date: '8 Sep', status: '5/5', completed: true },
    { day: 'Wed', date: '9 Sep', status: '3/5', completed: false, isToday: true },
    { day: 'Thu', date: '10 Sep', status: '-/5', completed: false },
    { day: 'Fri', date: '11 Sep', status: '-/5', completed: false },
    { day: 'Sat', date: '12 Sep', status: '-/5', completed: false },
    { day: 'Sun', date: '13 Sep', status: '-/5', completed: false },
  ];

  const isFocused = useIsFocused();

  const mainScrollRef = React.useRef<ScrollView>(null);
  useScrollToTop(mainScrollRef);

  useEffect(() => {
    if (isFocused) {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [isFocused]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {isFocused && <StatusBar style="light" backgroundColor="transparent" translucent={true} animated={true} />}

      <ScrollView
        ref={mainScrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInsetPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Executive Hero Banner WITH BLUE ARTWORK BG */}
        <ImageBackground
          source={fortressBg}
          style={{ width: '100%', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden' }}
          imageStyle={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24, opacity: 0.95 }}
        >
          <LinearGradient
            colors={
              isDarkMode
                ? ['rgba(7, 13, 24, 0.75)', 'rgba(15, 26, 46, 0.85)']
                : ['rgba(14, 55, 122, 0.65)', 'rgba(29, 78, 216, 0.78)']
            }
            style={[styles.heroContainer, { paddingTop: topInsetPadding }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Top Bar Row: Location & Actions */}
            <View style={styles.topBarRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={openSidebar}
                  style={{ paddingRight: 10, paddingVertical: 4 }}
                >
                  <Ionicons name="menu" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setCityModalVisible(true)}
                  style={styles.locationChip}
                >
                  <View style={styles.locationDot} />
                  <Ionicons name="location-sharp" size={13} color="#E2B842" style={{ marginRight: 4 }} />
                  <Text style={styles.locationChipText} numberOfLines={1}>{locationLabel}</Text>
                  <Ionicons name="chevron-down" size={11} color="#E2B842" style={{ marginLeft: 3 }} />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation?.navigate?.('Qibla')}
                  style={styles.heroBtn}
                >
                  <FontAwesome5 name="compass" size={12} color="#E2B842" style={{ marginRight: 5 }} />
                  <Text style={styles.heroBtnText}>Qibla</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setHistoryVisible(true)}
                  style={styles.heroBtn}
                >
                  <Ionicons name="stats-chart" size={12} color="#60A5FA" style={{ marginRight: 5 }} />
                  <Text style={styles.heroBtnText}>Tracker</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Next Prayer Highlight Card */}
            <View style={styles.heroGlassCard}>
              <View style={styles.glassCardTopRow}>
                <View style={styles.liveNextBadge}>
                  <View style={styles.greenPulseDot} />
                  <Text style={styles.liveNextBadgeText}>NEXT PRAYER</Text>
                </View>

                <View style={styles.countdownPill}>
                  <Ionicons name="time-outline" size={12} color="#E2B842" style={{ marginRight: 4 }} />
                  <Text style={styles.countdownPillText}>{countdownStr}</Text>
                </View>
              </View>

              <View style={styles.heroMainRow}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                    <Text style={styles.nextPrayerTitle}>{activeStatus.nextPrayerEn}</Text>
                    <Text style={styles.nextPrayerUrdu}>{activeStatus.nextPrayerUr}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.nextPrayerTimeBig}>{activeStatus.nextPrayerTimeDisplay}</Text>
                    {isLoading && <ActivityIndicator size="small" color="#E2B842" />}
                  </View>
                </View>

                <View style={styles.prayerIconCircle}>
                  <MaterialCommunityIcons
                    name={(nextPrayer?.icon ?? 'weather-night') as any}
                    size={28}
                    color="#E2B842"
                  />
                </View>
              </View>
            </View>

            {/* Date Navigator Ribbon */}
            <View style={styles.dateNavRibbon}>
              <TouchableOpacity
                onPress={() => setDayOffset(dayOffset - 1)}
                style={styles.dateNavBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.dateNavCenter}>
                <Text style={styles.dateNavTitle}>{formattedDate}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1, gap: 4 }}>
                  <MaterialCommunityIcons name="star-crescent" size={11} color="#E2B842" />
                  <Text style={styles.dateNavHijri}>{hijriText}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setDayOffset(dayOffset + 1)}
                style={styles.dateNavBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* ── Active Challenge Tracker Banner (WITH RICH VISIBLE ARTWORK BG) */}
        {activeChallenge ? (
          <View style={styles.activeChallengeWrapper}>
            <ImageBackground
              source={activeChallenge.bgImage || starterBg}
              style={styles.activeChallengeBg}
              imageStyle={{ borderRadius: 20, opacity: 0.95 }}
            >
              <LinearGradient
                colors={['rgba(7, 13, 24, 0.82)', 'rgba(15, 26, 46, 0.9)']}
                style={styles.activeChallengeCardOverlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.activeChallengeHeader}>
                  <View style={styles.activeSvgIconBox}>
                    {activeChallenge.iconType === 'starter' && <StarterSvgIcon size={26} />}
                    {activeChallenge.iconType === 'shield' && <ShieldSvgIcon size={26} />}
                    {activeChallenge.iconType === 'crown' && <CrownSvgIcon size={26} />}
                    {(!activeChallenge.iconType || activeChallenge.iconType === 'custom') && <CustomPlusSvgIcon size={26} color="#60A5FA" />}
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.activeChallengeTitle}>
                        {activeChallenge.title}
                      </Text>
                      <View style={styles.activeLevelPill}>
                        <Text style={styles.activeLevelText}>{activeChallenge.badge}</Text>
                      </View>
                    </View>

                    <Text style={styles.activeChallengeSubtitle}>
                      Day {challengeDay} of {activeChallenge.daysTotal} • {prayersCompletedCount}/{activeChallenge.prayersTotal} Prayers Done
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.leaveChallengeBtn}
                    onPress={leaveChallenge}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.leaveChallengeText}>Leave</Text>
                  </TouchableOpacity>
                </View>

                {/* Gamified Animated Progress Track */}
                <View style={styles.activeProgressContainer}>
                  <View style={styles.progressTrack}>
                    <LinearGradient
                      colors={['#3B82F6', '#60A5FA', '#E2B842']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(100, Math.max(5, (prayersCompletedCount / activeChallenge.prayersTotal) * 100))}%`,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.progressFooterRow}>
                    <Text style={styles.progressPctText}>
                      {Math.round((prayersCompletedCount / activeChallenge.prayersTotal) * 100)}% Complete
                    </Text>
                    <Text style={styles.streakText}>
                      ⚡ {prayersCompletedCount} Completed
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </View>
        ) : (
          /* ── Compact Executive Challenge Tags Carousel with VIBRANT ARTWORK BGs */
          <View style={styles.challengesSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="trophy" size={16} color="#F59E0B" />
                <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>
                  Prayer Streak Challenges
                </Text>
              </View>
              <Text style={[styles.sectionSubtitleText, { color: colors.textSecondary }]}>
                Tap a tag to start
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.challengesTagCarouselContainer}
            >
              {challengesList.map((ch) => (
                <TouchableOpacity
                  key={ch.id}
                  activeOpacity={0.8}
                  onPress={() => startChallenge(ch)}
                  style={styles.challengeTagCardWrapper}
                >
                  <ImageBackground
                    source={ch.bgImage || starterBg}
                    style={styles.challengeTagCardBg}
                    imageStyle={{ borderRadius: 18, opacity: 0.95 }}
                  >
                    <LinearGradient
                      colors={['rgba(7, 13, 24, 0.75)', 'rgba(15, 26, 46, 0.85)']}
                      style={styles.tagCardOverlay}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.tagSvgIconBadge}>
                        {ch.iconType === 'starter' && <StarterSvgIcon size={22} />}
                        {ch.iconType === 'shield' && <ShieldSvgIcon size={22} />}
                        {ch.iconType === 'crown' && <CrownSvgIcon size={22} />}
                        {(!ch.iconType || ch.iconType === 'custom') && <CustomPlusSvgIcon size={22} color="#60A5FA" />}
                      </View>

                      <View style={styles.tagTextGroup}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.tagTitleText} numberOfLines={1}>
                            {ch.title}
                          </Text>
                          <View style={styles.tagBadgePill}>
                            <Text style={styles.tagBadgePillText}>{ch.daysTotal}d</Text>
                          </View>
                        </View>
                        <Text style={styles.tagSubText}>
                          {ch.prayersTotal} prayers streak
                        </Text>
                      </View>

                      <View style={styles.tagArrowBox}>
                        <Ionicons name="chevron-forward" size={13} color="#FFFFFF" />
                      </View>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              ))}

              {/* Plus Custom Challenge Tag Pill */}
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={() => setCreateModalVisible(true)}
                style={[
                  styles.plusCustomTagCard,
                  {
                    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                    borderColor: colors.primary + '60',
                  },
                ]}
              >
                <View style={[styles.tagSvgIconBadgeCustom, { backgroundColor: colors.primary + '15' }]}>
                  <CustomPlusSvgIcon size={20} color={colors.primary} />
                </View>

                <View style={styles.tagTextGroup}>
                  <Text style={[styles.tagTitleTextCustom, { color: colors.primary }]}>Create Custom</Text>
                  <Text style={[styles.tagSubTextCustom, { color: colors.textSecondary }]}>Set custom goal</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* ── Daily Prayer Times List */}
        <View style={styles.listContainer}>
          <View style={styles.listHeaderRow}>
            <Text style={[styles.listHeaderTitle, { color: colors.textPrimary }]}>
              Daily Prayer Schedule
            </Text>

            {dayOffset !== 0 && (
              <TouchableOpacity onPress={() => setDayOffset(0)} activeOpacity={0.8}>
                <Text style={[styles.todayResetText, { color: colors.primary }]}>Today</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Method badge */}
          {selectedDateData?.methodName && (
            <View style={[styles.methodBadge, { backgroundColor: colors.surfaceSecondary }]}>
              <Ionicons name="compass-outline" size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.methodBadgeText, { color: colors.textSecondary }]} numberOfLines={1}>
                {selectedDateData.methodName}
              </Text>
            </View>
          )}

          {DAILY_PRAYERS.map((item, idx) => {
            const isCurrent = idx === activeIndex && dayOffset === 0;
            const isAlarmOn = alarms[item.id];
            const isDone = completed[item.id];

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation?.navigate?.('PrayerGuide', { prayerId: item.id.toLowerCase() })}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.prayerCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isCurrent ? colors.primary : colors.border,
                      borderWidth: isCurrent ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.prayerCardContent}>
                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); toggleAlarm(item.id); }}
                      style={styles.bellBtn} activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isAlarmOn ? 'notifications' : 'notifications-outline'}
                        size={20}
                        color={isAlarmOn ? colors.primary : colors.textSecondary}
                      />
                    </TouchableOpacity>

                    <View style={styles.nameGroup}>
                      <MaterialCommunityIcons
                        name={item.icon as any} size={22}
                        color={isCurrent ? colors.primary : colors.textSecondary}
                        style={{ marginRight: 10 }}
                      />
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={[styles.prayerName, { color: colors.textPrimary, fontWeight: isCurrent ? '800' : '600' }]}>
                            {item.nameEn}
                          </Text>
                          {isCurrent && (
                            <View style={[styles.nowBadge, { backgroundColor: colors.primary }]}>
                              <Text style={styles.nowBadgeText}>NOW</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.prayerUrdu, { color: colors.textSecondary }]}>{item.nameUr}</Text>
                      </View>
                    </View>

                    <Text style={[styles.prayerTimeText, { color: isCurrent ? colors.primary : colors.textPrimary, fontWeight: isCurrent ? '800' : '600' }]}>
                      {item.timeDisplay}
                    </Text>

                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); toggleCompleted(item.id); }}
                      style={styles.checkBtn} activeOpacity={0.7}
                    >
                      <View style={[styles.checkCircle, { borderColor: isDone ? colors.primary : colors.border, backgroundColor: isDone ? colors.primary : 'transparent' }]}>
                        {isDone && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Tracker & History Button */}
      <TouchableOpacity
        style={[styles.floatingHistoryBtn, { bottom: Math.max(insets.bottom, 4) + 0 }]}
        activeOpacity={0.85}
        onPress={() => setHistoryVisible(true)}
      >
        <View style={[styles.floatingHistoryCircle, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
          <Ionicons name="stats-chart" size={16} color="#FFFFFF" />
          <Text style={styles.floatingHistoryText}>Tracker</Text>
        </View>
      </TouchableOpacity>

      {/* ── 1. Prayer History & Analytics Modal ────────────────────────────── */}
      <Modal
        visible={historyVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHistoryVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDarkMode ? '#171717' : '#FFFFFF' }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFF' : '#1A1A1A' }]}>
                  Prayer Tracker & History
                </Text>
                <Text style={[styles.modalSubtitle, { color: isDarkMode ? '#A59B85' : '#665C4D' }]}>
                  Track your daily prayers and streak consistency
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setHistoryVisible(false)}
                style={[styles.modalCloseBtn, { backgroundColor: isDarkMode ? '#282828' : '#F4EFE6' }]}
              >
                <Ionicons name="close" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Stats Overview Grid */}
              <View style={styles.statsRow}>
                <View style={[styles.statBox, { backgroundColor: isDarkMode ? '#222' : '#F8FAFC', borderColor: colors.border }]}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>86%</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Weekly Completion</Text>
                </View>

                <View style={[styles.statBox, { backgroundColor: isDarkMode ? '#222' : '#F8FAFC', borderColor: colors.border }]}>
                  <Text style={[styles.statNumber, { color: '#F59E0B' }]}>7 Days</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Current Streak</Text>
                </View>

                <View style={[styles.statBox, { backgroundColor: isDarkMode ? '#222' : '#F8FAFC', borderColor: colors.border }]}>
                  <Text style={[styles.statNumber, { color: '#10B981' }]}>28/35</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed Prayers</Text>
                </View>
              </View>

              <Text style={[styles.sectionHeading, { color: isDarkMode ? '#FFF' : '#1A1A1A' }]}>
                Past 7 Days
              </Text>

              <View style={styles.historyGrid}>
                {past7Days.map((item, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.historyDayCard,
                      {
                        backgroundColor: item.isToday
                          ? colors.primary + '15'
                          : isDarkMode
                            ? '#222'
                            : '#F9FAFB',
                        borderColor: item.isToday ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.historyDayName, { color: isDarkMode ? '#FFF' : '#1A1A1A' }]}>
                      {item.day}
                    </Text>
                    <Text style={[styles.historyDate, { color: colors.textSecondary }]}>{item.date}</Text>
                    <View style={styles.historyStatusBadge}>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: item.completed ? '#10B981' : colors.textSecondary,
                        }}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── 2. Create Custom Challenge Modal ──────────────────────────────── */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDarkMode ? '#171717' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFF' : '#1A1A1A' }]}>
                  Create Custom Challenge
                </Text>
                <Text style={[styles.modalSubtitle, { color: isDarkMode ? '#A59B85' : '#665C4D' }]}>
                  Set your duration, title & badge icon
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCreateModalVisible(false)}
                style={[styles.modalCloseBtn, { backgroundColor: isDarkMode ? '#282828' : '#F4EFE6' }]}
              >
                <Ionicons name="close" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 6 }}>
              {/* Challenge Name Input */}
              <Text style={[styles.formLabel, { color: isDarkMode ? '#FFF' : '#1A1A1A' }]}>Challenge Name</Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: isDarkMode ? '#222' : '#FBFBFB',
                    color: isDarkMode ? '#FFF' : '#1A1A1A',
                    borderColor: colors.border,
                  },
                ]}
                placeholder="e.g. My 5-Day Fajr Discipline"
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              {/* Number of Days Selection Chips */}
              <Text style={[styles.formLabel, { color: isDarkMode ? '#FFF' : '#1A1A1A', marginTop: 14 }]}>
                Duration (Days)
              </Text>
              <View style={styles.chipRow}>
                {[1, 3, 5, 7, 14, 21, 30].map((d) => {
                  const isSelected = newDays === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setNewDays(d)}
                      style={[
                        styles.chipBtn,
                        {
                          backgroundColor: isSelected ? colors.primary : (isDarkMode ? '#222' : '#F4EFE6'),
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.chipText, { color: isSelected ? '#FFF' : (isDarkMode ? '#FFF' : '#1A1A1A') }]}>
                        {d} {d === 1 ? 'Day' : 'Days'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* SVG Icon Badge Selection */}
              <Text style={[styles.formLabel, { color: isDarkMode ? '#FFF' : '#1A1A1A', marginTop: 14 }]}>
                Select Badge Style
              </Text>
              <View style={styles.svgIconRow}>
                {(['starter', 'shield', 'crown', 'custom'] as const).map((iconKey) => {
                  const isSelected = selectedIconType === iconKey;
                  return (
                    <TouchableOpacity
                      key={iconKey}
                      onPress={() => setSelectedIconType(iconKey)}
                      style={[
                        styles.svgIconSelectBtn,
                        {
                          backgroundColor: isSelected ? colors.primary + '20' : (isDarkMode ? '#222' : '#F4EFE6'),
                          borderColor: isSelected ? colors.primary : 'transparent',
                        },
                      ]}
                    >
                      {iconKey === 'starter' && <StarterSvgIcon size={22} />}
                      {iconKey === 'shield' && <ShieldSvgIcon size={22} />}
                      {iconKey === 'crown' && <CrownSvgIcon size={22} />}
                      {iconKey === 'custom' && <CustomPlusSvgIcon size={22} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCreateCustomChallenge}
                style={[styles.submitChallengeBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.submitChallengeBtnText}>Create & Start Challenge</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* ── 3. City Selector Modal ──────────────────────────────────────── */}
      <Modal
        visible={cityModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDarkMode ? '#171717' : '#FFFFFF', maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFF' : '#1A1A1A' }]}>
                  Select City
                </Text>
                <Text style={[styles.modalSubtitle, { color: isDarkMode ? '#A59B85' : '#665C4D' }]}>
                  For accurate prayer times
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCityModalVisible(false)}
                style={[styles.modalCloseBtn, { backgroundColor: isDarkMode ? '#282828' : '#F4EFE6' }]}
              >
                <Ionicons name="close" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* GPS Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleUseGPS}
              style={[styles.gpsBtn, { borderColor: colors.primary, backgroundColor: colors.primary + '15' }]}
            >
              <Ionicons name="navigate" size={16} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.gpsBtnText, { color: colors.primary }]}>Use Current GPS Location</Text>
            </TouchableOpacity>

            {/* Search Input */}
            <View style={[styles.citySearchBox, { backgroundColor: isDarkMode ? '#242424' : '#F5F5F5', borderColor: colors.border }]}>
              <Ionicons name="search" size={15} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.citySearchInput, { color: isDarkMode ? '#FFF' : '#1A1A1A' }]}
                placeholder="Search city or country..."
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                value={citySearch}
                onChangeText={setCitySearch}
                autoCapitalize="words"
              />
              {citySearch.length > 0 && (
                <TouchableOpacity onPress={() => setCitySearch('')}>
                  <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* City FlatList */}
            <FlatList
              data={filteredCities}
              keyExtractor={(item, idx) => `${item.city}_${item.country}_${idx}`}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ marginTop: 8 }}
              renderItem={({ item }) => {
                const isSelected = !locationPref.isGPS &&
                  locationPref.cityName === item.city &&
                  locationPref.countryName === item.country;
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSelectCity(item)}
                    style={[
                      styles.cityListItem,
                      {
                        backgroundColor: isSelected ? colors.primary + '15' : 'transparent',
                        borderColor: isSelected ? colors.primary + '40' : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={isSelected ? colors.primary : colors.textSecondary}
                      style={{ marginRight: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cityItemName, { color: isSelected ? colors.primary : (isDarkMode ? '#FFF' : '#1A1A1A'), fontWeight: isSelected ? '700' : '500' }]}>
                        {item.city}
                      </Text>
                      <Text style={[styles.cityItemCountry, { color: colors.textSecondary }]}>
                        {item.country}
                      </Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 0 },

  // Top Executive Hero Container
  heroContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topBarRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  locationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  locationChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // Hero Glass Card
  heroGlassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    marginBottom: 12,
  },
  glassCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  liveNextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 5,
  },
  liveNextBadgeText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countdownPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Hero Main Content inside Glass Card
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextPrayerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  nextPrayerUrdu: {
    color: '#E2B842',
    fontSize: 16,
    fontWeight: '700',
  },
  nextPrayerTimeBig: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
  },
  prayerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Date Navigator Ribbon
  dateNavRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  dateNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNavCenter: {
    alignItems: 'center',
  },
  dateNavTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  dateNavHijri: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
  },

  // Active Challenge Card with Artwork BG
  activeChallengeWrapper: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  activeChallengeBg: {
    width: '100%',
  },
  activeChallengeCardOverlay: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  activeChallengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeSvgIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeChallengeTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  activeLevelPill: {
    backgroundColor: 'rgba(226, 184, 66, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(226, 184, 66, 0.4)',
  },
  activeLevelText: {
    color: '#E2B842',
    fontSize: 9,
    fontWeight: '800',
  },
  activeChallengeSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  leaveChallengeBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  leaveChallengeText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '700',
  },
  activeProgressContainer: {
    marginTop: 6,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  progressPctText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '800',
  },
  streakText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '800',
  },

  // ── Challenge Tag Cards Section with Vibrant Artwork BGs
  challengesSection: {
    paddingTop: 14,
    paddingBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionSubtitleText: {
    fontSize: 11,
    fontWeight: '500',
  },
  challengesTagCarouselContainer: {
    paddingHorizontal: 16,
    paddingVertical: 2,
    gap: 10,
  },
  challengeTagCardWrapper: {
    minWidth: 220,
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  challengeTagCardBg: {
    width: '100%',
    height: '100%',
  },
  tagCardOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  plusCustomTagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    minWidth: 165,
  },
  tagSvgIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tagSvgIconBadgeCustom: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  tagTextGroup: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  tagTitleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  tagTitleTextCustom: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  tagBadgePill: {
    backgroundColor: 'rgba(226, 184, 66, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(226, 184, 66, 0.4)',
  },
  tagBadgePillText: {
    color: '#E2B842',
    fontSize: 9,
    fontWeight: '800',
  },
  tagSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  tagSubTextCustom: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  tagArrowBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Daily Prayer Times List
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  listHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  todayResetText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Prayer Cards
  prayerCard: {
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 0,
  },
  prayerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bellBtn: {
    padding: 5,
    marginRight: 6,
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  prayerName: {
    fontSize: 14,
  },
  nowBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nowBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  prayerUrdu: {
    fontSize: 10,
    marginTop: 1,
  },
  prayerTimeText: {
    fontSize: 14,
    marginRight: 12,
  },
  checkBtn: {
    padding: 3,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Floating Tracker Button
  floatingHistoryBtn: {
    position: 'absolute',
    right: 16,
    zIndex: 100,
  },
  floatingHistoryCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  floatingHistoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },

  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  historyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  historyDayCard: {
    width: '31%',
    borderRadius: 10,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
  },
  historyDayName: {
    fontSize: 11,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 9,
    marginTop: 1,
  },
  historyStatusBadge: {
    marginTop: 4,
  },

  // Form Controls
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  formInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  svgIconRow: {
    flexDirection: 'row',
    gap: 10,
  },
  svgIconSelectBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitChallengeBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitChallengeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Method badge (under list header)
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  methodBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // City Selector Modal styles
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  gpsBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  citySearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  citySearchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 2,
  },
  cityListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 4,
  },
  cityItemName: {
    fontSize: 14,
  },
  cityItemCountry: {
    fontSize: 11,
    marginTop: 1,
  },
});
