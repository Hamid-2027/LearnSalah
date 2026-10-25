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
import * as Location from 'expo-location';

import { useTheme, useSidebar, usePrayerTimes } from '../../store/hooks';
import { format24To12 } from '../../services/aladhanService';
import majorCities from '../../data/majorCities.json';

const fortressBg = require('../../assets/images/challenge_fortress_bg.jpg');

interface PrayerItem {
  id: string;
  nameEn: string;
  nameUr: string;
  timeDisplay: string;
  icon: string;
}

const PRAYER_META: Omit<PrayerItem, 'timeDisplay'>[] = [
  { id: 'fajr', nameEn: 'Fajr', nameUr: 'فجر', icon: 'weather-sunset-up' },
  { id: 'dhuhr', nameEn: 'Dhuhr', nameUr: 'ظہر', icon: 'weather-sunny-alert' },
  { id: 'asr', nameEn: 'Asr', nameUr: 'عصر', icon: 'weather-partly-cloudy' },
  { id: 'maghrib', nameEn: 'Maghrib', nameUr: 'مغرب', icon: 'weather-sunset-down' },
  { id: 'isha', nameEn: 'Isha', nameUr: 'عشاء', icon: 'weather-night' },
];

// AlAdhan timing key map
const TIMING_KEYS: Record<string, string> = {
  fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
};

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

  // Alarm toggles state (5 prayers)
  const [alarms, setAlarms] = useState<Record<string, boolean>>({
    fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true,
  });

  // Prayer log checkmarks state (5 prayers)
  const [completed, setCompleted] = useState<Record<string, boolean>>({
    fajr: true, dhuhr: true, asr: true, maghrib: false, isha: false,
  });

  const toggleAlarm = (id: string) => setAlarms((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleCompleted = (id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ── Build live 5 prayer list from AlAdhan timings
  const DAILY_PRAYERS: PrayerItem[] = PRAYER_META.map((p) => {
    const apiKey = TIMING_KEYS[p.id];
    const rawTime = selectedDateData?.timings ? (selectedDateData.timings as any)[apiKey] : null;
    const timeDisplay = rawTime ? format24To12(rawTime) : '--:-- --';
    return { ...p, timeDisplay };
  });

  // ── Sunrise timing for embedding with Fajr
  const rawTimings = selectedDateData?.timings as any;
  const sunriseRaw = rawTimings?.Sunrise;
  const sunriseDisplay = sunriseRaw ? format24To12(sunriseRaw) : null;

  // ── Accurate active prayer calculation for the 5 prayers
  const getMinutesFromTime = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const clean = timeStr.split(' ')[0];
    const [h, m] = clean.split(':').map((v) => parseInt(v, 10));
    return (h || 0) * 60 + (m || 0);
  };

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const fMins = getMinutesFromTime(rawTimings?.Fajr);
  const dMins = getMinutesFromTime(rawTimings?.Dhuhr);
  const aMins = getMinutesFromTime(rawTimings?.Asr);
  const mMins = getMinutesFromTime(rawTimings?.Maghrib);
  const iMins = getMinutesFromTime(rawTimings?.Isha);

  let activePrayerId = 'isha';
  if (currentMins >= iMins) {
    activePrayerId = 'isha';
  } else if (currentMins >= mMins) {
    activePrayerId = 'maghrib';
  } else if (currentMins >= aMins) {
    activePrayerId = 'asr';
  } else if (currentMins >= dMins) {
    activePrayerId = 'dhuhr';
  } else if (currentMins >= fMins) {
    activePrayerId = 'fajr';
  } else {
    activePrayerId = 'isha';
  }

  // ── Date display calculations
  const displayDate = new Date();
  displayDate.setDate(displayDate.getDate() + dayOffset);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${dayNames[displayDate.getDay()]}, ${displayDate.getDate()} ${monthNames[displayDate.getMonth()]} ${displayDate.getFullYear()}`;
  const hijriText = selectedDateData?.hijri?.formattedEn || "24 Rabi' al-Thani 1448 AH";

  // ── Active prayer & countdown from context
  const countdownStr = activeStatus.countdownStr;
  const nextTargetName = activeStatus.nextPrayerEn === 'Sunrise' ? 'Dhuhr' : activeStatus.nextPrayerEn;
  const nextPrayer =
    DAILY_PRAYERS.find((p) => p.nameEn.toLowerCase() === nextTargetName?.toLowerCase()) ||
    DAILY_PRAYERS[0];
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

                {/*
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setHistoryVisible(true)}
                  style={styles.heroBtn}
                >
                  <Ionicons name="stats-chart" size={12} color="#60A5FA" style={{ marginRight: 5 }} />
                  <Text style={styles.heroBtnText}>Tracker</Text>
                </TouchableOpacity>
                */}
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

          {DAILY_PRAYERS.map((item) => {
            const isCurrent = item.id === activePrayerId && dayOffset === 0;
            const isAlarmOn = alarms[item.id];
            const isDone = completed[item.id];

            const CardWrapper = isCurrent ? LinearGradient : View;
            const cardWrapperProps = isCurrent
              ? {
                  colors: isDarkMode
                    ? ['rgba(30, 58, 138, 0.42)', 'rgba(15, 23, 42, 0.58)']
                    : ['rgba(239, 246, 255, 0.95)', 'rgba(219, 234, 254, 0.65)'],
                  start: { x: 0, y: 0 },
                  end: { x: 1, y: 0 },
                  style: [
                    styles.prayerCard,
                    {
                      borderColor: isDarkMode ? '#3B82F6' : '#2563EB',
                      borderWidth: 1.5,
                    },
                  ],
                }
              : {
                  style: [
                    styles.prayerCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
                  ],
                };

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation?.navigate?.('PrayerGuide', { prayerId: item.id.toLowerCase() })}
                activeOpacity={0.7}
              >
                <CardWrapper {...(cardWrapperProps as any)}>
                  {isCurrent && (
                    <View
                      style={[
                        styles.activeIndicatorBar,
                        { backgroundColor: isDarkMode ? '#60A5FA' : '#2563EB' },
                      ]}
                    />
                  )}
                  <View style={styles.prayerCardContent}>
                    {/* Alarm Toggle */}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleAlarm(item.id);
                      }}
                      style={[
                        styles.bellBtn,
                        {
                          backgroundColor: isAlarmOn
                            ? isDarkMode
                              ? 'rgba(59, 130, 246, 0.15)'
                              : 'rgba(37, 99, 235, 0.1)'
                            : 'transparent',
                        },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isAlarmOn ? 'notifications' : 'notifications-outline'}
                        size={17}
                        color={isAlarmOn ? (isDarkMode ? '#60A5FA' : colors.primary) : colors.textSecondary}
                      />
                    </TouchableOpacity>

                    {/* Prayer Icon Box */}
                    <View
                      style={[
                        styles.prayerIconBox,
                        {
                          backgroundColor: isCurrent
                            ? isDarkMode
                              ? 'rgba(59, 130, 246, 0.22)'
                              : 'rgba(37, 99, 235, 0.14)'
                            : isDarkMode
                            ? 'rgba(255, 255, 255, 0.05)'
                            : '#F1F5F9',
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={17}
                        color={isCurrent ? (isDarkMode ? '#60A5FA' : colors.primary) : colors.textSecondary}
                      />
                    </View>

                    {/* Prayer Name + Urdu + NOW badge + embedded Sunrise chip */}
                    <View style={styles.nameGroup}>
                      <View style={styles.nameRow}>
                        <Text
                          style={[
                            styles.prayerName,
                            {
                              color: isCurrent
                                ? isDarkMode
                                  ? '#93C5FD'
                                  : colors.primary
                                : colors.textPrimary,
                              fontWeight: isCurrent ? '800' : '600',
                            },
                          ]}
                        >
                          {item.nameEn}
                        </Text>
                        <Text style={[styles.prayerUrdu, { color: colors.textSecondary }]}>
                          {item.nameUr}
                        </Text>
                        {isCurrent && (
                          <View
                            style={[
                              styles.nowBadge,
                              { backgroundColor: isDarkMode ? '#2563EB' : colors.primary },
                            ]}
                          >
                            <View style={styles.nowPulseDot} />
                            <Text style={styles.nowBadgeText}>NOW</Text>
                          </View>
                        )}
                      </View>

                      {/* Creative Embedded Sunrise Chip (only on Fajr) */}
                      {item.id === 'fajr' && !!sunriseDisplay && (
                        <View
                          style={[
                            styles.sunriseInlineChip,
                            {
                              backgroundColor: isDarkMode
                                ? 'rgba(245, 158, 11, 0.14)'
                                : 'rgba(245, 158, 11, 0.1)',
                            },
                          ]}
                        >
                          <MaterialCommunityIcons name="weather-sunset-up" size={10} color="#F59E0B" />
                          <Text style={styles.sunriseInlineText}>
                            Sunrise <Text style={styles.sunriseInlineTime}>{sunriseDisplay}</Text>
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Prayer Time */}
                    <Text
                      style={[
                        styles.prayerTimeText,
                        {
                          color: isCurrent
                            ? isDarkMode
                              ? '#60A5FA'
                              : colors.primary
                            : colors.textPrimary,
                          fontWeight: isCurrent ? '800' : '600',
                        },
                      ]}
                    >
                      {item.timeDisplay}
                    </Text>

                    {/* Completion Checkmark */}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleCompleted(item.id);
                      }}
                      style={styles.checkBtn}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.checkCircle,
                          {
                            borderColor: isDone ? (isDarkMode ? '#60A5FA' : colors.primary) : colors.border,
                            backgroundColor: isDone ? (isDarkMode ? '#2563EB' : colors.primary) : 'transparent',
                          },
                        ]}
                      >
                        {isDone && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                      </View>
                    </TouchableOpacity>
                  </View>
                </CardWrapper>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Tracker & History Button */}
      {/* <TouchableOpacity
        style={[styles.floatingHistoryBtn, { bottom: Math.max(insets.bottom, 4) + 0 }]}
        activeOpacity={0.85}
        onPress={() => setHistoryVisible(true)}
      >
        <View style={[styles.floatingHistoryCircle, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
          <Ionicons name="stats-chart" size={16} color="#FFFFFF" />
          <Text style={styles.floatingHistoryText}>Tracker</Text>
        </View>
      </TouchableOpacity> */}

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

  // Prayer Cards (Compact & Professional)
  prayerCard: {
    borderRadius: 12,
    marginBottom: 6,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeIndicatorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    zIndex: 5,
  },
  prayerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bellBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  prayerIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  nameGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
  nowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    gap: 3,
  },
  nowPulseDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  nowBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  sunriseInlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 3,
  },
  sunriseInlineText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#F59E0B',
  },
  sunriseInlineTime: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FBBF24',
  },
  prayerUrdu: {
    fontSize: 10.5,
    marginLeft: 6,
    opacity: 0.8,
  },
  prayerTimeText: {
    fontSize: 13.5,
    letterSpacing: -0.2,
    marginRight: 10,
  },
  checkBtn: {
    padding: 3,
  },
  checkCircle: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
    borderWidth: 1.5,
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
