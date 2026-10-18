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
      RNStatusBar.setBarStyle('light-content', true);
    }
  }, [isFocused]);

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

  // Bottom Sheet Animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  const openSheet = (title: string, sheetOptions: SheetOption[], type: 'gender' | 'sect' | 'madhab') => {
    setModalTitle(title);
    setOptions(sheetOptions);
    setCurrentType(type);
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
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

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

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
      {isFocused && <StatusBar style="light" backgroundColor="transparent" translucent={true} animated={true} />}

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

          {/* ── Step-by-Step Prayer & Salah Guide Banner (Matching Reference UI) */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation?.navigate?.('Ibadaat')}
            style={localStyles.continueContainer}
          >
            <ImageBackground
              source={salahQuranBg}
              style={localStyles.salahGuideBg}
              imageStyle={{ borderRadius: 20 }}
            >
              <LinearGradient
                colors={[
                  'rgba(27, 62, 43, 0.96)',
                  'rgba(27, 62, 43, 0.65)',
                  'rgba(27, 62, 43, 0.15)',
                ]}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0.5 }}
                style={localStyles.continueLearnGradient}
              >

                {/* Top Row: Badge + Directional Arrow */}
                <View style={localStyles.continueHeaderRow}>
                  <View style={localStyles.learnBadge}>
                    <FontAwesome5 name="graduation-cap" size={11} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={localStyles.learnBadgeText}>
                      {isUrdu ? 'لرننگ اکیڈمی' : 'STEP-BY-STEP ACADEMY'}
                    </Text>
                  </View>

                  <View style={localStyles.arrowCircle}>
                    <Ionicons name="arrow-forward" size={18} color="#1B3E2B" />
                  </View>
                </View>

                {/* Main Content & Illustration */}
                <View style={localStyles.continueMainContent}>
                  <View style={{ flex: 1, paddingRight: 14 }}>
                    <Text style={localStyles.continueTitle}>
                      {isUrdu ? 'طریقۂ نماز کا مکمل سبق' : 'Step-by-Step Prayer & Salah Guide'}
                    </Text>
                    <Text style={localStyles.continueSub}>
                      {isUrdu ? 'مقدمات، وضو اور نماز کے فرائض و سنن سیکھیں' : 'Learn Raka\'at, positional recitations, prerequisites, and purification steps in Learn Hub'}
                    </Text>
                  </View>

                  <View style={localStyles.illustrationCircle}>
                    <MaterialCommunityIcons name="book-open-page-variant" size={26} color="#FFFFFF" />
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>

          {/* Quick Access Grid */}
          <View style={[localStyles.quickAccessCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[localStyles.quickAccessTitle, { color: colors.textPrimary }]}>Quick Access</Text>
            <View style={localStyles.quickAccessGrid}>
              <TouchableOpacity
                style={[localStyles.quickAccessItem, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => navigation?.navigate?.('Ibadaat')}
              >
                <MaterialCommunityIcons name="mosque" size={24} color={colors.primary} />
                <Text style={[localStyles.quickAccessLabel, { color: colors.textPrimary }]}>Step by Step Namaz</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[localStyles.quickAccessItem, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => navigation?.navigate?.('Learn')}
              >
                <Ionicons name="water" size={24} color="#0284C7" />
                <Text style={[localStyles.quickAccessLabel, { color: colors.textPrimary }]}>Wuzu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[localStyles.quickAccessItem, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => navigation?.navigate?.('PrayerTimes')}
              >
                <Ionicons name="time" size={24} color="#D97706" />
                <Text style={[localStyles.quickAccessLabel, { color: colors.textPrimary }]}>Prayer Times</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Today's Prayer Tracker */}
          <View style={[localStyles.trackerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={localStyles.trackerHeaderRow}>
              <View style={localStyles.trackerTitleGroup}>
                <Ionicons name="calendar" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[localStyles.trackerTitle, { color: colors.textPrimary }]}>Today's Prayer Tracker</Text>
              </View>
              <View style={[localStyles.trackerProgressPill, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[localStyles.trackerProgressText, { color: colors.primary }]}>{completedCount}/5 Logged</Text>
              </View>
            </View>

            <View style={localStyles.prayerPillsRow}>
              {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((pName) => {
                const isLogged = prayerLogs[pName];
                return (
                  <TouchableOpacity
                    key={pName}
                    activeOpacity={0.8}
                    onPress={() => togglePrayerLog(pName)}
                    style={[
                      localStyles.prayerLogItem,
                      {
                        backgroundColor: isLogged ? colors.primary : colors.surfaceSecondary,
                        borderColor: isLogged ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={isLogged ? 'checkmark-circle' : 'ellipse-outline'}
                      size={15}
                      color={isLogged ? '#FFFFFF' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        localStyles.prayerLogText,
                        { color: isLogged ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {pName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* ── Preference Selection Bottom Sheet Modal */}
      <Modal
        transparent
        visible={modalVisible}
        onRequestClose={closeSheet}
        animationType="none"
      >
        <Pressable style={localStyles.modalBackdrop} onPress={closeSheet}>
          <Animated.View
            style={[
              localStyles.sheetCard,
              {
                backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={localStyles.sheetHeader}>
              <View style={localStyles.dragHandle} />
              <Text style={[localStyles.sheetTitle, { color: colors.textPrimary }]}>{modalTitle}</Text>
            </View>

            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {options.map((opt) => {
                const isSelected =
                  (currentType === 'gender' && gender === opt.value) ||
                  (currentType === 'sect' && sect === opt.value) ||
                  (currentType === 'madhab' && madhab === opt.value);

                return (
                  <TouchableOpacity
                    key={opt.value}
                    activeOpacity={0.7}
                    onPress={() => handleSelectOption(opt.value)}
                    style={[
                      localStyles.optionItem,
                      {
                        backgroundColor: isSelected
                          ? colors.primary + '15'
                          : isDarkMode
                            ? '#0F172A'
                            : '#F8FAFC',
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View style={localStyles.optionTextGroup}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                          style={[
                            localStyles.optionLabel,
                            { color: isSelected ? colors.primary : colors.textPrimary },
                          ]}
                        >
                          {opt.label}
                        </Text>
                        {opt.badge && (
                          <View style={[localStyles.optBadge, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={[localStyles.optBadgeText, { color: colors.primary }]}>{opt.badge}</Text>
                          </View>
                        )}
                      </View>
                      {opt.subtitle && (
                        <Text style={[localStyles.optionSub, { color: colors.textSecondary }]}>
                          {opt.subtitle}
                        </Text>
                      )}
                    </View>

                    {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={closeSheet}
              style={[localStyles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
            >
              <Text style={[localStyles.closeBtnText, { color: colors.textPrimary }]}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

const localStyles = StyleSheet.create({
  prefContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  prefTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  prefPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prefPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
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
    fontSize: 12,
    fontWeight: '700',
  },

  // Step-by-Step Prayer Guide Card (Matching Reference UI)
  continueContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#1B3E2B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  salahGuideBg: {
    width: '100%',
    minHeight: 165,
  },
  continueLearnGradient: {
    padding: 16,
    borderRadius: 20,
    minHeight: 165,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  continueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    zIndex: 2,
  },
  learnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  learnBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  continueMainContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    zIndex: 2,
    marginTop: 4,
  },
  continueTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  continueSub: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.92)',
    marginTop: 6,
    lineHeight: 16,
    fontWeight: '500',
  },
  illustrationCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.38)',
  },

  // Quick Access
  quickAccessCard: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAccessItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickAccessLabel: {
    fontSize: 12,
    fontWeight: '700',
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
