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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';

interface PrayerItem {
  id: string;
  nameEn: string;
  nameUr: string;
  timeDisplay: string;
  icon: string;
  minutes: number;
}

const DAILY_PRAYERS: PrayerItem[] = [
  { id: 'fajr', nameEn: 'Fajr', nameUr: 'فجر', timeDisplay: '05:00 am', icon: 'weather-sunset-up', minutes: 5 * 60 },
  { id: 'sunrise', nameEn: 'Sunrise', nameUr: 'طلوعِ آفتاب', timeDisplay: '06:15 am', icon: 'weather-sunny', minutes: 6 * 60 + 15 },
  { id: 'dhuhr', nameEn: 'Dhuhr', nameUr: 'ظہر', timeDisplay: '12:30 pm', icon: 'weather-sunny-alert', minutes: 12 * 60 + 30 },
  { id: 'asr', nameEn: 'Asr', nameUr: 'عصر', timeDisplay: '04:30 pm', icon: 'weather-partly-cloudy', minutes: 16 * 60 + 30 },
  { id: 'maghrib', nameEn: 'Maghrib', nameUr: 'مغرب', timeDisplay: '06:40 pm', icon: 'weather-sunset-down', minutes: 18 * 60 + 40 },
  { id: 'isha', nameEn: 'Isha', nameUr: 'عشاء', timeDisplay: '08:00 pm', icon: 'weather-night', minutes: 20 * 60 },
];

export interface Challenge {
  id: string;
  title: string;
  daysTotal: number;
  prayersTotal: number;
  badge: string;
  emoji: string;
  description: string;
  isCustom?: boolean;
}

const PREDEFINED_CHALLENGES: Challenge[] = [
  {
    id: '1_day',
    title: 'Istiqamah Starter',
    daysTotal: 1,
    prayersTotal: 5,
    badge: '⚡ STARTER',
    emoji: '⚡',
    description: 'Complete all 5 daily prayers today on time to ignite your habit.',
  },
  {
    id: '3_day',
    title: 'Al-Muhafiz Fortress',
    daysTotal: 3,
    prayersTotal: 15,
    badge: '🛡️ MUHAFIZ',
    emoji: '🛡️',
    description: 'Guard your daily prayers consistently for 3 consecutive days.',
  },
  {
    id: '7_day',
    title: 'As-Salah Champion',
    daysTotal: 7,
    prayersTotal: 35,
    badge: '👑 CHAMPION',
    emoji: '👑',
    description: 'Master 7 full days of unbroken Namaz discipline & track your streak.',
  },
];

interface PrayerTimesScreenProps {
  navigation?: any;
}

export const PrayerTimesScreen: React.FC<PrayerTimesScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isDarkMode, colors } = useTheme();

  // Date navigation state (0 = Today, -1 = Yesterday, +1 = Tomorrow)
  const [dayOffset, setDayOffset] = useState(0);

  // Modals state
  const [historyVisible, setHistoryVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Active Challenge state (default null = user has not accepted any challenge yet)
  const [challengesList, setChallengesList] = useState<Challenge[]>(PREDEFINED_CHALLENGES);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [challengeDay, setChallengeDay] = useState(1);
  const [prayersCompletedCount, setPrayersCompletedCount] = useState(0);

  // Custom Challenge Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDays, setNewDays] = useState(5);
  const [newEmoji, setNewEmoji] = useState('🏆');

  // Alarm toggles state
  const [alarms, setAlarms] = useState<Record<string, boolean>>({
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  });

  // Prayer log checkmarks state
  const [completed, setCompleted] = useState<Record<string, boolean>>({
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: false,
    isha: false,
  });

  // Current time state
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleAlarm = (id: string) => {
    setAlarms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCompleted = (id: string) => {
    setCompleted((prev) => {
      const nextState = !prev[id];
      if (nextState) {
        setPrayersCompletedCount((count) => count + 1);
      } else {
        setPrayersCompletedCount((count) => Math.max(0, count - 1));
      }
      return { ...prev, [id]: nextState };
    });
  };

  const startChallenge = (ch: Challenge) => {
    setActiveChallenge(ch);
    setChallengeDay(1);
    setPrayersCompletedCount(0);
  };

  const leaveChallenge = () => {
    setActiveChallenge(null);
  };

  const handleCreateCustomChallenge = () => {
    const titleToUse = newTitle.trim() || `${newDays}-Day Custom Namaz Challenge`;
    const totalPr = newDays * 5;
    const newCh: Challenge = {
      id: `custom_${Date.now()}`,
      title: titleToUse,
      daysTotal: newDays,
      prayersTotal: totalPr,
      badge: `${newEmoji} ${newDays} DAYS`,
      emoji: newEmoji,
      description: `Custom goal to complete ${totalPr} prayers over ${newDays} days.`,
      isCustom: true,
    };

    setChallengesList((prev) => [newCh, ...prev]);
    startChallenge(newCh);
    setNewTitle('');
    setCreateModalVisible(false);
  };

  // Date calculation based on dayOffset
  const displayDate = new Date();
  displayDate.setDate(displayDate.getDate() + dayOffset);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formattedDate = `${days[displayDate.getDay()]}, ${displayDate.getDate()} ${months[displayDate.getMonth()]} ${displayDate.getFullYear()}`;
  const hijriText = `${18 + dayOffset} Rabi' al-Awwal 1448 AH`;

  // Calculate current minutes since midnight
  const currentMins = now.getHours() * 60 + now.getMinutes();

  // Determine current active prayer & next prayer
  let activeIndex = 0;
  for (let i = 0; i < DAILY_PRAYERS.length; i++) {
    if (currentMins >= DAILY_PRAYERS[i].minutes) {
      activeIndex = i;
    }
  }
  const nextIndex = (activeIndex + 1) % DAILY_PRAYERS.length;
  const nextPrayer = DAILY_PRAYERS[nextIndex];

  // Countdown calculation
  let targetMins = nextPrayer.minutes;
  if (targetMins <= currentMins) {
    targetMins += 24 * 60;
  }
  const diffSecs = Math.max(0, targetMins * 60 - (currentMins * 60 + now.getSeconds()));
  const hrs = Math.floor(diffSecs / 3600);
  const mins = Math.floor((diffSecs % 3600) / 60);
  const secs = diffSecs % 60;
  const countdownStr = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const topInsetPadding = Math.max(insets.top, 12);
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

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor={colors.primary} translucent={false} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInsetPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Hero Banner */}
        <LinearGradient
          colors={
            isDarkMode
              ? [colors.primary, colors.primaryDark]
              : [colors.primary, colors.primaryDark]
          }
          style={[styles.heroContainer, { paddingTop: topInsetPadding }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          {/* Top Row Buttons: Qibla & History/Tracker */}
          <View style={styles.topBarRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation?.navigate?.('Qibla')}
              style={styles.heroBtn}
            >
              <FontAwesome5 name="compass" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.heroBtnText}>Qibla</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setHistoryVisible(true)}
              style={styles.heroBtn}
            >
              <Ionicons name="stats-chart" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.heroBtnText}>History</Text>
            </TouchableOpacity>
          </View>

          {/* Next Prayer Target Block */}
          <View style={styles.nextPrayerContainer}>
            <Text style={styles.nextPrayerLabel}>NEXT PRAYER</Text>
            <Text style={styles.nextPrayerName}>{nextPrayer.nameEn}</Text>
            <Text style={styles.nextPrayerTime}>{nextPrayer.timeDisplay}</Text>
          </View>

          {/* Countdown & Location Meta Row */}
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Ionicons name="time-outline" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
              <Text style={styles.metaBadgeText}>{countdownStr}</Text>
            </View>

            <View style={styles.metaBadge}>
              <Ionicons name="location-outline" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
              <Text style={styles.metaBadgeText}>Rawalpindi</Text>
            </View>
          </View>

          {/* Date Navigator Banner */}
          <View style={styles.dateNavRow}>
            <TouchableOpacity
              onPress={() => setDayOffset((prev) => prev - 1)}
              style={styles.dateNavBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.dateNavCenter}>
              <Text style={styles.dateNavTitle}>{formattedDate}</Text>
              <Text style={styles.dateNavHijri}>{hijriText}</Text>
            </View>

            <TouchableOpacity
              onPress={() => setDayOffset((prev) => prev + 1)}
              style={styles.dateNavBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── Active Challenge Tracker Banner (ONLY shown when user accepts a challenge) */}
        {activeChallenge ? (
          <View style={[styles.challengeBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.challengeHeaderRow}>
              <View style={styles.challengeTitleGroup}>
                <Text style={styles.challengeEmoji}>{activeChallenge.emoji || '🔥'}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.challengeTitleText, { color: colors.textPrimary }]}>
                      {activeChallenge.title}
                    </Text>
                    <View style={[styles.activeBadgeTag, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.activeBadgeTagText, { color: colors.primary }]}>{activeChallenge.badge}</Text>
                    </View>
                  </View>
                  <Text style={[styles.challengeSubText, { color: colors.textSecondary }]}>
                    Day {challengeDay} of {activeChallenge.daysTotal} • {prayersCompletedCount}/{activeChallenge.prayersTotal} prayers
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.challengeBtn, { backgroundColor: colors.surfaceSecondary }]}
                onPress={leaveChallenge}
                activeOpacity={0.8}
              >
                <Text style={[styles.challengeBtnText, { color: colors.primary }]}>Leave</Text>
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressTrack, { backgroundColor: colors.surfaceSecondary }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${Math.min(100, (prayersCompletedCount / activeChallenge.prayersTotal) * 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
        ) : (
          /* ── 3 Pre-Defined Challenges + Plus Button Carousel Section */
          <View style={styles.challengesSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>
                Prayer Streak Challenges
              </Text>
              <Text style={[styles.sectionSubtitleText, { color: colors.textSecondary }]}>
                Pick a challenge to start tracking
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.challengesCarouselContainer}
            >
              {/* 3 Pre-Defined Challenge Cards */}
              {challengesList.map((ch) => (
                <TouchableOpacity
                  key={ch.id}
                  activeOpacity={0.8}
                  onPress={() => startChallenge(ch)}
                  style={[
                    styles.challengeCardItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.cardItemTop}>
                    <Text style={{ fontSize: 20 }}>{ch.emoji}</Text>
                    <View style={[styles.cardItemBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.cardItemBadgeText, { color: colors.primary }]}>{ch.badge}</Text>
                    </View>
                  </View>

                  <Text style={[styles.cardItemTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {ch.title}
                  </Text>

                  <Text style={[styles.cardItemDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {ch.description}
                  </Text>

                  <View style={[styles.cardMeta, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={[styles.cardMetaText, { color: colors.textSecondary }]}>
                      {ch.daysTotal} days • {ch.prayersTotal} prayers
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Plus (+) Card for Custom Challenge */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setCreateModalVisible(true)}
                style={[
                  styles.challengeCardItem,
                  styles.plusCardItem,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={[styles.plusIconCircle, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="add" size={24} color={colors.primary} />
                </View>

                <Text style={[styles.cardItemTitle, { color: colors.textPrimary, textAlign: 'center', marginTop: 8 }]}>
                  Create Custom
                </Text>

                <Text style={[styles.cardItemDesc, { color: colors.textSecondary, textAlign: 'center' }]}>
                  Set your own challenge
                </Text>
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

          {DAILY_PRAYERS.map((item, idx) => {
            const isCurrent = idx === activeIndex && dayOffset === 0;
            const isAlarmOn = alarms[item.id];
            const isDone = completed[item.id];

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation?.navigate?.('PrayerGuide')}
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
                  {/* Left Bell Icon */}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleAlarm(item.id);
                    }}
                    style={styles.bellBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isAlarmOn ? 'notifications' : 'notifications-outline'}
                      size={20}
                      color={isAlarmOn ? colors.primary : colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {/* Prayer Icon & Name */}
                  <View style={styles.nameGroup}>
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={22}
                      color={isCurrent ? colors.primary : colors.textSecondary}
                      style={{ marginRight: 10 }}
                    />
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                          style={[
                            styles.prayerName,
                            {
                              color: colors.textPrimary,
                              fontWeight: isCurrent ? '800' : '600',
                            },
                          ]}
                        >
                          {item.nameEn}
                        </Text>
                        {isCurrent && (
                          <View style={[styles.nowBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.nowBadgeText}>NOW</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.prayerUrdu, { color: colors.textSecondary }]}>
                        {item.nameUr}
                      </Text>
                    </View>
                  </View>

                  {/* Prayer Time */}
                  <Text
                    style={[
                      styles.prayerTimeText,
                      {
                        color: isCurrent ? colors.primary : colors.textPrimary,
                        fontWeight: isCurrent ? '800' : '600',
                      },
                    ]}
                  >
                    {item.timeDisplay}
                  </Text>

                  {/* Right Completion Checkbox */}
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
                          borderColor: isDone ? colors.primary : colors.border,
                          backgroundColor: isDone ? colors.primary : 'transparent',
                        },
                      ]}
                    >
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
        style={[styles.floatingHistoryBtn, { bottom: Math.max(insets.bottom, 12) + 70 }]}
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
                <View style={[styles.statBox, { backgroundColor: isDarkMode ? '#222' : '#FBF9F5', borderColor: colors.border }]}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>85%</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Weekly Rate</Text>
                </View>

                <View style={[styles.statBox, { backgroundColor: isDarkMode ? '#222' : '#FBF9F5', borderColor: colors.border }]}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>🔥 3</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
                </View>

                <View style={[styles.statBox, { backgroundColor: isDarkMode ? '#222' : '#FBF9F5', borderColor: colors.border }]}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>38</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Logged</Text>
                </View>
              </View>

              {/* Last 7 Days History Row */}
              <Text style={[styles.sectionHeading, { color: isDarkMode ? '#FFF' : '#1A1A1A' }]}>
                Past 7 Days
              </Text>
              <View style={styles.historyGrid}>
                {past7Days.map((item, i) => (
                  <View
                    key={i}
                    style={[
                      styles.historyDayCard,
                      {
                        backgroundColor: item.completed
                          ? (isDarkMode ? 'rgba(212,175,55,0.15)' : '#FAF6EE')
                          : (isDarkMode ? '#222' : '#F7F7F7'),
                        borderColor: item.isToday ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.historyDayName, { color: isDarkMode ? '#FFF' : '#1A1A1A' }]}>
                      {item.day}
                    </Text>
                    <Text style={[styles.historyDate, { color: colors.textSecondary }]}>{item.date}</Text>
                    <View style={styles.historyStatusBadge}>
                      {item.completed ? (
                        <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                      ) : (
                        <Text style={{ fontSize: 11, color: colors.textSecondary }}>{item.status}</Text>
                      )}
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
                  Set your duration, title & badge emoji
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

              {/* Badge Emoji Selection */}
              <Text style={[styles.formLabel, { color: isDarkMode ? '#FFF' : '#1A1A1A', marginTop: 14 }]}>
                Badge Icon
              </Text>
              <View style={styles.emojiRow}>
                {['🏆', '🔥', '⚡', '👑', '🛡️', '🕌', '💎'].map((em) => {
                  const isSelected = newEmoji === em;
                  return (
                    <TouchableOpacity
                      key={em}
                      onPress={() => setNewEmoji(em)}
                      style={[
                        styles.emojiBtn,
                        {
                          backgroundColor: isSelected ? colors.primary + '22' : (isDarkMode ? '#222' : '#F4EFE6'),
                          borderColor: isSelected ? colors.primary : 'transparent',
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 20 }}>{em}</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 0 },

  // Top Hero Container
  heroContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  topBarRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  heroBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // Next Prayer Info
  nextPrayerContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  nextPrayerLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  nextPrayerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  nextPrayerTime: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
  },

  // Meta Row
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  metaBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },

  // Date Navigator Row
  dateNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 4,
  },
  dateNavBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNavCenter: {
    alignItems: 'center',
  },
  dateNavTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dateNavHijri: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginTop: 1,
  },

  // Active Challenge Banner
  challengeBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  challengeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  challengeTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  challengeEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  challengeTitleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeBadgeTag: {
    marginLeft: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  activeBadgeTagText: {
    fontSize: 8,
    fontWeight: '700',
  },
  challengeSubText: {
    fontSize: 10,
    marginTop: 1,
  },
  challengeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  challengeBtnText: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // ── Challenges Carousel Section
  challengesSection: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  sectionHeaderRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionSubtitleText: {
    fontSize: 10,
    marginTop: 1,
  },
  challengesCarouselContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  challengeCardItem: {
    width: 160,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardItemBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardItemBadgeText: {
    fontSize: 8,
    fontWeight: '700',
  },
  cardItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  cardItemDesc: {
    fontSize: 10,
    lineHeight: 13,
    marginBottom: 8,
  },
  cardMeta: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  cardMetaText: {
    fontSize: 9,
    fontWeight: '500',
  },

  // Plus Custom Card Item
  plusCardItem: {
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  plusIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Daily Prayer Times List
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  prayerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
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
    marginLeft: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  nowBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
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
    width: 20,
    height: 20,
    borderRadius: 10,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingHistoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 5,
  },

  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
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
  emojiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  emojiBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
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
});
