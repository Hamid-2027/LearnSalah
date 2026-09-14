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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

import { HeaderBanner } from '../../components/HeaderBanner';
import { SidebarDrawer } from '../../components/SidebarDrawer';
import { CardCornerDecoration } from '../../components/CornerDecoration';
import { styles } from './HomeScreen.styles';
import { useTheme } from '../../context/ThemeContext';

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

interface BottomSheetConfig {
  title: string;
  subtitle?: string;
  options: SheetOption[];
  selected: string;
  onSelect: (value: string) => void;
}

interface HomeScreenProps {
  onResetOnboarding?: () => void;
  navigation?: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onResetOnboarding, navigation }) => {
  const insets = useSafeAreaInsets();
  const { i18n } = useTranslation();
  const { isDarkMode, colors } = useTheme();
  const [lang, setLang] = useState(i18n.language || 'en');
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Preference State
  const [gender, setGender] = useState<Gender>('Male');
  const [sect, setSect] = useState<Sect>('Sunni');
  const [madhab, setMadhab] = useState<Madhab>('Hanafi');

  // Today's Prayer Tracker Log Widget State
  const [prayerLogs, setPrayerLogs] = useState<Record<string, boolean>>({
    fajr: true,
    dhuhr: true,
    asr: false,
    maghrib: false,
    isha: false,
  });

  // Bottom Sheet Modal state
  const [sheetConfig, setSheetConfig] = useState<BottomSheetConfig | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const isUrdu = lang === 'ur';

  const switchLang = (l: string) => {
    i18n.changeLanguage(l);
    setLang(l);
  };

  const togglePrayerLog = (id: string) => {
    setPrayerLogs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Bottom Sheet Handlers
  const openSheet = (config: BottomSheetConfig) => {
    setSheetConfig(config);
    setSheetVisible(true);
    slideAnim.setValue(0);
    backdropAnim.setValue(0);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 1, useNativeDriver: true, tension: 65, friction: 11 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setSheetVisible(false);
      setSheetConfig(null);
    });
  };

  const handleSheetSelect = (value: string) => {
    sheetConfig?.onSelect(value);
    closeSheet();
  };

  const openGenderPicker = () => {
    openSheet({
      title: isUrdu ? 'جنس کا انتخاب کریں' : 'Select Gender',
      subtitle: isUrdu ? 'نماز کے لیے جنس' : 'Choose male or female posture guidance',
      options: [
        { value: 'Male', label: isUrdu ? 'مرد (Male)' : 'Male', subtitle: 'Postures & rulings for men', icon: '♂' },
        { value: 'Female', label: isUrdu ? 'عورت (Female)' : 'Female', subtitle: 'Postures & rulings for women', icon: '♀' },
      ],
      selected: gender,
      onSelect: (v) => setGender(v as Gender),
    });
  };

  const openSchoolPicker = () => {
    openSheet({
      title: isUrdu ? 'فقہ و مذہب کا انتخاب' : 'Select School & Sect',
      subtitle: isUrdu ? 'اپنے فقہ کی ترویج منتخب کریں' : 'Choose your juristic school for variations',
      options: [
        { value: 'Sunni__Hanafi', label: 'Sunni · Hanafi', subtitle: 'Imam Abu Hanifa rulings' },
        { value: 'Sunni__Shafi\'i', label: 'Sunni · Shafi\'i', subtitle: 'Imam Al-Shafi\'i rulings' },
        { value: 'Shia__Ja\'fari', label: 'Shia · Ja\'fari', subtitle: 'Imam Ja\'far Al-Sadiq rulings' },
      ],
      selected: `${sect}__${madhab}`,
      onSelect: (v) => {
        const [s, m] = v.split('__') as [Sect, Madhab];
        setSect(s);
        setMadhab(m);
      },
    });
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  const completedCount = Object.values(prayerLogs).filter(Boolean).length;

  const topHeaderColor = isDarkMode ? '#1E3A8A' : '#1E40AF';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: topHeaderColor }]} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor={topHeaderColor} translucent={false} />

      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Banner (Preserved at Top) */}
          <HeaderBanner
            onOpenSidebar={() => setSidebarVisible(true)}
            lang={lang}
          />

          {/* ── Islamic Preference Quick Selection Bar */}
          <View style={localStyles.prefContainer}>
            <Text style={[localStyles.prefTitle, { color: colors.textSecondary }]}>
              {isUrdu ? 'تنظیماتِ نماز' : 'Prayer Preference Profile'}
            </Text>
            <View style={localStyles.prefPillRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={openGenderPicker}
                style={[localStyles.prefPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[localStyles.prefIconCircle, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name={gender === 'Male' ? 'male' : 'female'} size={14} color={colors.primary} />
                </View>
                <Text style={[localStyles.prefText, { color: colors.textPrimary }]}>{gender}</Text>
                <Ionicons name="chevron-down" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={openSchoolPicker}
                style={[localStyles.prefPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[localStyles.prefIconCircle, { backgroundColor: colors.surfaceSecondary }]}>
                  <FontAwesome5 name="mosque" size={11} color={colors.primary} />
                </View>
                <Text style={[localStyles.prefText, { color: colors.textPrimary }]}>{sect} · {madhab}</Text>
                <Ionicons name="chevron-down" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Continue Learning Widget (Nudge to Learn Tab) */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.('Learn')}
            style={localStyles.continueContainer}
          >
            <LinearGradient
              colors={
                isDarkMode
                  ? ['#1E3A8A', '#1D4ED8', '#2563EB']
                  : ['#1B4D3E', '#2D6A4F', '#40916C']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={localStyles.continueLearnGradient}
            >
              {/* Top Row: Badge + Directional Arrow */}
              <View style={localStyles.continueHeaderRow}>
                <View style={localStyles.learnBadge}>
                  <MaterialCommunityIcons name="school-outline" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                  <Text style={localStyles.learnBadgeText}>
                    {isUrdu ? 'لرننگ اکیڈمی' : 'STEP-BY-STEP ACADEMY'}
                  </Text>
                </View>

                <View style={localStyles.arrowCircle}>
                  <Ionicons name="arrow-forward" size={15} color={isDarkMode ? '#1E3A8A' : '#1B4D3E'} />
                </View>
              </View>

              {/* Main Content & Illustration */}
              <View style={localStyles.continueMainContent}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={localStyles.continueTitle}>
                    {isUrdu ? 'طریقۂ نماز کا مکمل سبق' : 'Step-by-Step Namaz & Wuzu Guide'}
                  </Text>
                  <Text style={localStyles.continueSub}>
                    {isUrdu ? 'مقدمات، وضو اور نماز کے فرائض و سنن سیکھیں' : 'Master posture recitations, Faraiz & purification rules in Learn Hub'}
                  </Text>
                </View>

                <View style={localStyles.illustrationCircle}>
                  <MaterialCommunityIcons name="book-open-page-variant" size={26} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Compact Quick Anchor Cards (Qibla & Tasbeeh with Corner Decoration) */}
          <View style={localStyles.anchorsRow}>
            {/* Qibla Direction Anchor */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation?.navigate?.('Qibla')}
              style={[localStyles.anchorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <CardCornerDecoration color={colors.gold} size={34} offset={2} />
              <View style={[localStyles.anchorIconCircle, { backgroundColor: colors.gold + '1A' }]}>
                <MaterialCommunityIcons name="compass-rose" size={26} color={colors.gold} />
              </View>
              <Text style={[localStyles.anchorTitle, { color: colors.textPrimary }]}>Qibla Direction</Text>
              <Text style={[localStyles.anchorSub, { color: colors.textSecondary }]}>Live Kaaba Compass</Text>
            </TouchableOpacity>

            {/* Digital Tasbeeh Anchor */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation?.navigate?.('More')}
              style={[localStyles.anchorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <CardCornerDecoration color={colors.primary} size={34} offset={2} />
              <View style={[localStyles.anchorIconCircle, { backgroundColor: colors.primary + '1A' }]}>
                <MaterialCommunityIcons name="counter" size={26} color={colors.primary} />
              </View>
              <Text style={[localStyles.anchorTitle, { color: colors.textPrimary }]}>Digital Tasbeeh</Text>
              <Text style={[localStyles.anchorSub, { color: colors.textSecondary }]}>Dhikr & Counter</Text>
            </TouchableOpacity>
          </View>

          {/* Today's 5-Prayer Tracker Mini Log Widget */}
          <View style={[localStyles.trackerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={localStyles.trackerHeaderRow}>
              <View style={localStyles.trackerTitleGroup}>
                <MaterialCommunityIcons name="calendar-check" size={20} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[localStyles.trackerTitle, { color: colors.textPrimary }]}>
                  {isUrdu ? 'آج کی نماز کا جائزہ' : "Today's Prayer Tracker"}
                </Text>
              </View>
              <View style={[localStyles.trackerProgressPill, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[localStyles.trackerProgressText, { color: colors.primary }]}>{completedCount}/5 Logged</Text>
              </View>
            </View>

            <View style={localStyles.prayerPillsRow}>
              {[
                { id: 'fajr', name: 'Fajr', time: '05:00 AM' },
                { id: 'dhuhr', name: 'Dhuhr', time: '12:30 PM' },
                { id: 'asr', name: 'Asr', time: '04:30 PM' },
                { id: 'maghrib', name: 'Maghrib', time: '06:40 PM' },
                { id: 'isha', name: 'Isha', time: '08:00 PM' },
              ].map((p) => {
                const isChecked = prayerLogs[p.id];
                return (
                  <TouchableOpacity
                    key={p.id}
                    activeOpacity={0.75}
                    onPress={() => togglePrayerLog(p.id)}
                    style={[
                      localStyles.prayerLogItem,
                      isChecked
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                    ]}
                  >
                    <Ionicons
                      name={isChecked ? 'checkmark-circle' : 'ellipse-outline'}
                      size={16}
                      color={isChecked ? '#FFFFFF' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        localStyles.prayerLogText,
                        { color: isChecked ? '#FFFFFF' : colors.textPrimary },
                        isChecked && { fontWeight: '800' },
                      ]}
                    >
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Islamic Quote of the Day */}
          <View style={[localStyles.quoteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <CardCornerDecoration color={colors.gold} size={36} offset={2} />
            <View style={localStyles.quoteHeaderRow}>
              <MaterialCommunityIcons name="format-quote-open" size={24} color={colors.gold} />
              <Text style={[localStyles.quoteTag, { color: colors.gold }]}>DAILY ISLAMIC REMINDER</Text>
            </View>
            <Text style={[localStyles.quoteText, { color: colors.textPrimary }]}>
              "Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater."
            </Text>
            <Text style={[localStyles.quoteRef, { color: colors.textSecondary }]}>— Surah Al-Ankabut [29:45]</Text>
          </View>
        </ScrollView>

        {/* Sidebar Drawer */}
        <SidebarDrawer
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          lang={lang}
          onSwitchLang={switchLang}
        />

        {/* Preferences Bottom Sheet Modal */}
        <Modal
          visible={sheetVisible}
          transparent={true}
          animationType="none"
          onRequestClose={closeSheet}
        >
          <Pressable style={localStyles.sheetBackdrop} onPress={closeSheet}>
            <Animated.View style={[localStyles.sheetBackdropFill, { opacity: backdropAnim }]} />
          </Pressable>

          <Animated.View
            style={[
              localStyles.sheetCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={localStyles.sheetHandleBar} />
            {sheetConfig && (
              <>
                <Text style={[localStyles.sheetTitle, { color: colors.textPrimary }]}>{sheetConfig.title}</Text>
                {sheetConfig.subtitle && (
                  <Text style={[localStyles.sheetSubtitle, { color: colors.textSecondary }]}>{sheetConfig.subtitle}</Text>
                )}
                <View style={localStyles.sheetOptionsList}>
                  {sheetConfig.options.map((opt) => {
                    const isSel = sheetConfig.selected === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        activeOpacity={0.7}
                        onPress={() => handleSheetSelect(opt.value)}
                        style={[
                          localStyles.sheetOptionRow,
                          { backgroundColor: isSel ? colors.surfaceSecondary : 'transparent' },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[localStyles.sheetOptLabel, { color: isSel ? colors.primary : colors.textPrimary }]}>
                            {opt.label}
                          </Text>
                          {opt.subtitle && (
                            <Text style={[localStyles.sheetOptSub, { color: colors.textSecondary }]}>{opt.subtitle}</Text>
                          )}
                        </View>
                        {isSel && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </Animated.View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  prefContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  prefTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  prefPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prefPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  prefIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  prefText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },

  // Continue Learn
  continueContainer: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#1B4D3E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  continueLearnGradient: {
    padding: 16,
    borderRadius: 20,
  },
  continueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  learnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  learnBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  continueSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    lineHeight: 17,
  },
  illustrationCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Anchor Cards
  anchorsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    gap: 10,
  },
  anchorCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  anchorIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  anchorTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  anchorSub: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },

  // Tracker
  trackerCard: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  trackerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  trackerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  trackerProgressPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  trackerProgressText: {
    fontSize: 11,
    fontWeight: '800',
  },
  prayerPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  prayerLogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  prayerLogText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Quote
  quoteCard: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  quoteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  quoteTag: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  quoteText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  quoteRef: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },

  // Bottom Sheet Modal
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetBackdropFill: {
    flex: 1,
  },
  sheetCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
  },
  sheetHandleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CCC',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sheetSubtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  sheetOptionsList: {
    gap: 4,
  },
  sheetOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  sheetOptLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  sheetOptSub: {
    fontSize: 11,
    marginTop: 1,
  },
});
