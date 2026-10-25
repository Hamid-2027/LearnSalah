import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Pressable,
  StyleSheet,
  Platform,
  ImageBackground,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useScrollToTop } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

import { HeaderBanner } from '../../components/HeaderBanner';
import { CardCornerDecoration } from '../../components/CornerDecoration';
import { AppOptionPickerSheet } from '../../components/common/AppOptionPickerSheet';
import { styles } from './HomeScreen.styles';
import { useTheme, useSidebar } from '../../store/hooks';

const salahQuranBg = require('../../assets/images/stepbystep_ref_img.png');

type Gender = 'Male' | 'Female';
type Sect = 'Sunni' | 'Shia';
type Madhab = 'Hanafi' | "Shafi'i" | "Ja'fari";

interface SheetOption {
  value: string;
  label: string;
  subtitle?: string;
  badge?: string;
  icon?: string;
}

const GENDER_OPTIONS: SheetOption[] = [
  { value: 'Male', label: 'Male', subtitle: 'Standard positions and postures', icon: 'male' },
  { value: 'Female', label: 'Female', subtitle: 'Adapted posture guidance for women', icon: 'female' },
];

const SECT_OPTIONS: SheetOption[] = [
  { value: 'Sunni', label: 'Sunni', subtitle: 'Includes Hanafi, Shafi’i, Maliki, Hanbali methods', icon: 'mosque' },
  { value: 'Shia', label: 'Shia', subtitle: 'Ja’fari jurisprudence & recitations', icon: 'star' },
];

const SUNNI_MADHAB_OPTIONS: SheetOption[] = [
  { value: 'Hanafi', label: 'Hanafi', subtitle: 'Witr 3 Raka’at, Asr later time calculation', badge: 'Popular' },
  { value: "Shafi'i", label: "Shafi'i", subtitle: 'Raf-al-Yadayn, Qunut in Fajr prayer', badge: 'Standard' },
];

const SHIA_MADHAB_OPTIONS: SheetOption[] = [
  { value: "Ja'fari", label: "Ja'fari", subtitle: 'Combining Dhuhr/Asr & Maghrib/Isha', badge: 'Default' },
];



export const HomeScreen: React.FC<{ navigation?: any; onResetOnboarding?: () => void }> = ({ navigation, onResetOnboarding }) => {
  const { i18n } = useTranslation();
  const { isDarkMode, colors } = useTheme();
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      RNStatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content', true);
    }
  }, [isFocused, isDarkMode]);

  // Selected Preferences State
  const [gender, setGender] = useState<Gender>('Male');
  const [sect, setSect] = useState<Sect>('Sunni');
  const [madhab, setMadhab] = useState<Madhab>('Hanafi');

  // Modal Sheet State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [options, setOptions] = useState<SheetOption[]>([]);
  const [currentType, setCurrentType] = useState<'gender' | 'sect' | 'madhab'>('gender');

  const { openSidebar } = useSidebar();

  const openSheet = (title: string, sheetOptions: SheetOption[], type: 'gender' | 'sect' | 'madhab') => {
    setModalTitle(title);
    setOptions(sheetOptions);
    setCurrentType(type);
    setModalVisible(true);
  };

  const closeSheet = () => {
    setModalVisible(false);
  };

  const handleSelectOption = (value: string) => {
    if (currentType === 'gender') {
      setGender(value as Gender);
    } else if (currentType === 'sect') {
      const nextSect = value as Sect;
      setSect(nextSect);
      if (nextSect === 'Shia') {
        setMadhab("Ja'fari");
      } else {
        setMadhab('Hanafi');
      }
    } else if (currentType === 'madhab') {
      setMadhab(value as Madhab);
    }
    closeSheet();
  };

  const openGenderPicker = () => openSheet('Select Prayer Gender Profile', GENDER_OPTIONS, 'gender');
  const openSchoolPicker = () => {
    if (sect === 'Sunni') {
      openSheet('Select Sunni School of Thought (Madhab)', SUNNI_MADHAB_OPTIONS, 'madhab');
    } else {
      openSheet('Select Shia Jurisprudence', SHIA_MADHAB_OPTIONS, 'madhab');
    }
  };

  // Prayer Tracker Checkmarks State
  const [prayerLogs, setPrayerLogs] = useState<Record<string, boolean>>({
    Fajr: true,
    Dhuhr: true,
    Asr: false,
    Maghrib: false,
    Isha: false,
  });

  const togglePrayerLog = (name: string) => {
    setPrayerLogs((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isUrdu = i18n.language === 'ur';

  const completedCount = Object.values(prayerLogs).filter(Boolean).length;

  const mainScrollRef = useRef<ScrollView>(null);
  useScrollToTop(mainScrollRef);

  React.useEffect(() => {
    if (isFocused) {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [isFocused]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {isFocused && (
        <StatusBar
          style={isDarkMode ? 'light' : 'dark'}
          backgroundColor="transparent"
          translucent={true}
          animated={true}
        />
      )}

      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          ref={mainScrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Banner (Preserved at Top) */}
          <HeaderBanner
            onOpenSidebar={openSidebar}
            lang={i18n.language}
          />

          {/* ── 1. Today's Prayers Tracker & Streak (Engaging, rewarding habit builder) */}
          <View
            style={[
              localStyles.card,
              {
                backgroundColor: isDarkMode ? '#05142E' : colors.surface,
                borderColor: isDarkMode ? '#183B70' : colors.border,
              },
            ]}
          >
            <View style={localStyles.trackerHeaderRow}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="checkmark-done-circle" size={17} color={isDarkMode ? '#60A5FA' : colors.primary} />
                  <Text style={[localStyles.cardTitle, { color: isDarkMode ? '#FFFFFF' : colors.textPrimary }]}>
                    {isUrdu ? 'آج کی نمازیں' : "Today's Prayers"}
                  </Text>
                </View>
                <Text style={[localStyles.cardSub, { color: isDarkMode ? '#94A3B8' : colors.textSecondary }]}>
                  {completedCount === 5
                    ? (isUrdu ? 'ماشاءاللہ! تمام نمازیں مکمل ہیں' : 'All 5 prayers completed! MashaAllah')
                    : `${completedCount} of 5 completed · ${completedCount >= 3 ? 'Great momentum!' : 'Tap to mark done'}`}
                </Text>
              </View>

              {/* Progress Percentage Badge */}
              <View
                style={[
                  localStyles.progressPill,
                  {
                    backgroundColor: completedCount === 5
                      ? 'rgba(16, 185, 129, 0.15)'
                      : (isDarkMode ? 'rgba(59, 130, 246, 0.15)' : colors.primary + '14'),
                  },
                ]}
              >
                <Text
                  style={[
                    localStyles.progressPillText,
                    {
                      color: completedCount === 5
                        ? '#10B981'
                        : (isDarkMode ? '#60A5FA' : colors.primary),
                    },
                  ]}
                >
                  {Math.round((completedCount / 5) * 100)}%
                </Text>
              </View>
            </View>

            {/* Smooth Micro Progress Bar */}
            <View style={[localStyles.progressBarTrack, { backgroundColor: isDarkMode ? '#091E42' : '#F1F5F9' }]}>
              <View
                style={[
                  localStyles.progressBarFill,
                  {
                    width: `${(completedCount / 5) * 100}%`,
                    backgroundColor: completedCount === 5 ? '#10B981' : (isDarkMode ? '#3B82F6' : colors.primary),
                  },
                ]}
              />
            </View>

            {/* 5 Quick Prayer Toggle Chips - Improved Layout */}
            <View style={localStyles.prayerRow}>
              {[
                { name: 'Fajr', ur: 'فجر', icon: 'weather-sunset-up' },
                { name: 'Dhuhr', ur: 'ظہر', icon: 'weather-sunny' },
                { name: 'Asr', ur: 'عصر', icon: 'weather-partly-cloudy' },
                { name: 'Maghrib', ur: 'مغرب', icon: 'weather-sunset-down' },
                { name: 'Isha', ur: 'عشاء', icon: 'weather-night' },
              ].map((p) => {
                const isLogged = prayerLogs[p.name];
                return (
                  <TouchableOpacity
                    key={p.name}
                    activeOpacity={0.7}
                    onPress={() => togglePrayerLog(p.name)}
                    style={[
                      localStyles.prayerChip,
                      {
                        backgroundColor: isLogged
                          ? (isDarkMode ? '#2563EB' : colors.primary)
                          : (isDarkMode ? '#091E42' : colors.surfaceSecondary),
                        borderColor: isLogged
                          ? (isDarkMode ? '#3B82F6' : colors.primary)
                          : (isDarkMode ? 'rgba(255,255,255,0.08)' : colors.border),
                        shadowColor: isLogged ? (isDarkMode ? '#3B82F6' : colors.primary) : 'transparent',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isLogged ? 0.3 : 0,
                        shadowRadius: 4,
                        elevation: isLogged ? 3 : 0,
                      },
                    ]}
                  >
                    <View style={[
                      localStyles.prayerIconWrapper,
                      { backgroundColor: isLogged ? 'rgba(255,255,255,0.2)' : (isDarkMode ? 'rgba(59, 130, 246, 0.1)' : colors.primary + '10') }
                    ]}>
                      <MaterialCommunityIcons
                        name={p.icon as any}
                        size={16}
                        color={isLogged ? '#FFFFFF' : (isDarkMode ? '#60A5FA' : colors.primary)}
                      />
                    </View>
                    <Text
                      style={[
                        localStyles.prayerChipText,
                        { color: isLogged ? '#FFFFFF' : (isDarkMode ? '#E2E8F0' : colors.textPrimary) },
                      ]}
                    >
                      {p.name}
                    </Text>
                    {isLogged && (
                      <View style={localStyles.checkmarkBadge}>
                        <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── 2. Starter Spotlight: "Learn How to Pray" (Non-intimidating & inviting) */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.('Prayer')}
            style={localStyles.spotlightWrapper}
          >
            <ImageBackground
              source={salahQuranBg}
              style={localStyles.spotlightBg}
              imageStyle={{ borderRadius: 18 }}
            >
              <LinearGradient
                colors={
                  isDarkMode
                    ? ['rgba(2, 11, 28, 0.94)', 'rgba(5, 20, 46, 0.82)', 'rgba(2, 11, 28, 0.3)']
                    : ['rgba(14, 55, 122, 0.94)', 'rgba(29, 78, 216, 0.8)', 'rgba(29, 78, 216, 0.25)']
                }
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0.3 }}
                style={localStyles.spotlightGradient}
              >
                <View style={localStyles.spotlightTopRow}>
                  <View style={localStyles.starterBadge}>
                    <FontAwesome5 name="seedling" size={10} color="#10B981" style={{ marginRight: 5 }} />
                    <Text style={localStyles.starterBadgeText}>
                      {isUrdu ? 'ابتدائی رہنما' : 'STARTER GUIDE'}
                    </Text>
                  </View>
                  <View style={localStyles.spotlightArrowCircle}>
                    <Ionicons name="arrow-forward" size={16} color={isDarkMode ? '#020B1C' : '#1D4ED8'} />
                  </View>
                </View>

                <View style={localStyles.spotlightBottomRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={localStyles.spotlightTitle}>
                      {isUrdu ? 'نماز پڑھنا سیکھیں' : 'Learn Step-by-Step Salah'}
                    </Text>
                    <Text style={localStyles.spotlightSub}>
                      {isUrdu
                        ? 'وضو، رکعات اور تمام ارکان کی آسان تصویری رہنمائی'
                        : 'Visual postures, audio recitation & meanings made simple.'}
                    </Text>
                  </View>
                  <View style={localStyles.spotlightIconBox}>
                    <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#FFFFFF" />
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>

          {/* ── 3. Quick Essentials (Intuitive 2x2 Grid) */}
          <View style={localStyles.essentialsSection}>
            <Text style={[localStyles.sectionHeader, { color: isDarkMode ? '#FFFFFF' : colors.textPrimary }]}>
              {isUrdu ? 'ضروری رہنمائی' : 'Quick Essentials'}
            </Text>

            <View style={localStyles.essentialsGrid}>
              {/* Item 1: Wudu */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => navigation?.navigate?.('Learn')}
                style={[
                  localStyles.essentialCard,
                  {
                    backgroundColor: isDarkMode ? '#05142E' : colors.surface,
                    borderColor: isDarkMode ? '#183B70' : colors.border,
                  },
                ]}
              >
                <View style={[localStyles.essentialIconWrap, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                  <Ionicons name="water" size={19} color="#38BDF8" />
                </View>
                <View style={localStyles.essentialTextWrap}>
                  <Text style={[localStyles.essentialTitle, { color: isDarkMode ? '#FFFFFF' : colors.textPrimary }]}>
                    {isUrdu ? 'وضو کا طریقہ' : 'How to do Wudu'}
                  </Text>
                  <Text style={[localStyles.essentialSub, { color: isDarkMode ? '#94A3B8' : colors.textSecondary }]}>
                    {isUrdu ? 'مکمل طہارت کا طریقہ' : 'Simple purification guide'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={isDarkMode ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>

              {/* Item 2: Qibla Finder */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => navigation?.navigate?.('Qibla')}
                style={[
                  localStyles.essentialCard,
                  {
                    backgroundColor: isDarkMode ? '#05142E' : colors.surface,
                    borderColor: isDarkMode ? '#183B70' : colors.border,
                  },
                ]}
              >
                <View style={[localStyles.essentialIconWrap, { backgroundColor: 'rgba(226, 184, 66, 0.15)' }]}>
                  <FontAwesome5 name="compass" size={17} color="#E2B842" />
                </View>
                <View style={localStyles.essentialTextWrap}>
                  <Text style={[localStyles.essentialTitle, { color: isDarkMode ? '#FFFFFF' : colors.textPrimary }]}>
                    {isUrdu ? 'قبلہ رخ' : 'Qibla Finder'}
                  </Text>
                  <Text style={[localStyles.essentialSub, { color: isDarkMode ? '#94A3B8' : colors.textSecondary }]}>
                    {isUrdu ? 'کعبہ کی سمت' : 'Compass to Makkah'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={isDarkMode ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>

              {/* Item 3: Full Prayer Timetable */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => navigation?.navigate?.('PrayerTimes')}
                style={[
                  localStyles.essentialCard,
                  {
                    backgroundColor: isDarkMode ? '#05142E' : colors.surface,
                    borderColor: isDarkMode ? '#183B70' : colors.border,
                  },
                ]}
              >
                <View style={[localStyles.essentialIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="time" size={19} color="#F59E0B" />
                </View>
                <View style={localStyles.essentialTextWrap}>
                  <Text style={[localStyles.essentialTitle, { color: isDarkMode ? '#FFFFFF' : colors.textPrimary }]}>
                    {isUrdu ? 'نماز کے اوقات' : 'Prayer Times'}
                  </Text>
                  <Text style={[localStyles.essentialSub, { color: isDarkMode ? '#94A3B8' : colors.textSecondary }]}>
                    {isUrdu ? 'مکمل شیڈول اور الارم' : 'Full daily timetable'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={isDarkMode ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>

              {/* Item 4: Daily Duas & Dhikr */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => navigation?.navigate?.('Learn')}
                style={[
                  localStyles.essentialCard,
                  {
                    backgroundColor: isDarkMode ? '#05142E' : colors.surface,
                    borderColor: isDarkMode ? '#183B70' : colors.border,
                  },
                ]}
              >
                <View style={[localStyles.essentialIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <MaterialCommunityIcons name="hands-pray" size={19} color="#10B981" />
                </View>
                <View style={localStyles.essentialTextWrap}>
                  <Text style={[localStyles.essentialTitle, { color: isDarkMode ? '#FFFFFF' : colors.textPrimary }]}>
                    {isUrdu ? 'دعائیں و اذکار' : 'Daily Duas'}
                  </Text>
                  <Text style={[localStyles.essentialSub, { color: isDarkMode ? '#94A3B8' : colors.textSecondary }]}>
                    {isUrdu ? 'صبح اور شام کے اذکار' : 'Morning & night prayers'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={isDarkMode ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── 4. Daily Inspiration Quote */}
          <View
            style={[
              localStyles.inspirationCard,
              {
                backgroundColor: isDarkMode ? '#05142E' : colors.surface,
                borderColor: isDarkMode ? '#183B70' : colors.border,
              },
            ]}
          >
            <View style={localStyles.inspirationHeader}>
              <View style={localStyles.inspirationBadge}>
                <Ionicons name="sparkles" size={11} color="#E2B842" style={{ marginRight: 4 }} />
                <Text style={localStyles.inspirationBadgeText}>DAILY REMINDER</Text>
              </View>
            </View>
            <Text style={[localStyles.inspirationQuote, { color: isDarkMode ? '#FFFFFF' : colors.textPrimary }]}>
              {isUrdu
                ? '”بے شک نماز بے حیائی اور برائی سے روکتی ہے۔“'
                : '“Indeed, prayer prohibits immorality and wrongdoing.”'}
            </Text>
            <Text style={[localStyles.inspirationSource, { color: isDarkMode ? '#94A3B8' : colors.textSecondary }]}>
              {isUrdu ? 'سورۃ العنکبوت (۲۹:۴۵)' : 'Surah Al-Ankabut (29:45)'}
            </Text>
          </View>

          {/* ── 5. Subtle Prayer Profile Footer Chip (Kept accessible, non-intrusive) */}
          <View style={localStyles.profileFooter}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={openGenderPicker}
              style={[
                localStyles.profilePill,
                {
                  backgroundColor: isDarkMode ? '#091E42' : colors.surfaceSecondary,
                  borderColor: isDarkMode ? '#183B70' : colors.border,
                },
              ]}
            >
              <Ionicons name={gender === 'Male' ? 'male' : 'female'} size={12} color={isDarkMode ? '#60A5FA' : colors.primary} />
              <Text style={[localStyles.profilePillText, { color: isDarkMode ? '#E2E8F0' : colors.textPrimary }]}>
                {gender}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={openSchoolPicker}
              style={[
                localStyles.profilePill,
                {
                  backgroundColor: isDarkMode ? '#091E42' : colors.surfaceSecondary,
                  borderColor: isDarkMode ? '#183B70' : colors.border,
                },
              ]}
            >
              <FontAwesome5 name="mosque" size={10} color={isDarkMode ? '#60A5FA' : colors.primary} />
              <Text style={[localStyles.profilePillText, { color: isDarkMode ? '#E2E8F0' : colors.textPrimary }]}>
                {sect} · {madhab}
              </Text>
              <Ionicons name="chevron-down" size={12} color={isDarkMode ? '#60A5FA' : colors.primary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* ── Preference Selection Bottom Sheet Modal using @gorhom/bottom-sheet */}
      <AppOptionPickerSheet
        visible={modalVisible}
        onClose={closeSheet}
        title={modalTitle}
        options={options}
        selected={
          currentType === 'gender' ? gender : currentType === 'sect' ? sect : madhab
        }
        onSelect={handleSelectOption}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  // Card Base
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  cardSub: {
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: '500',
  },
  trackerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  progressPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  prayerChip: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 65,
    position: 'relative',
  },
  prayerIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  prayerChipText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Starter Spotlight Guide
  spotlightWrapper: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  spotlightBg: {
    width: '100%',
    minHeight: 140,
  },
  spotlightGradient: {
    padding: 14,
    borderRadius: 18,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  spotlightTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  starterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  starterBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  spotlightArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  spotlightTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  spotlightSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    lineHeight: 15,
    fontWeight: '500',
  },
  spotlightIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Essentials Section
  essentialsSection: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  essentialsGrid: {
    gap: 8,
  },
  essentialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  essentialIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  essentialTextWrap: {
    flex: 1,
  },
  essentialTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  essentialSub: {
    fontSize: 11,
    marginTop: 1.5,
    fontWeight: '500',
  },

  // Daily Inspiration Card
  inspirationCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  inspirationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inspirationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(226, 184, 66, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inspirationBadgeText: {
    color: '#E2B842',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  inspirationQuote: {
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 18,
    fontWeight: '500',
  },
  inspirationSource: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 4,
  },

  // Profile Footer
  profileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 8,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 5,
  },
  profilePillText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Sheet Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionTextGroup: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  optBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  optBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  optionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
