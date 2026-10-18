import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Modal,
  Animated,
  Pressable,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useScrollToTop } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme, useSidebar, useUserPreferences, useAuth } from '../../store/hooks';
import { IslamicSect, UserGender } from '../../store/slices/userPreferencesSlice';
import { SECT_METHOD_LABELS } from '../../constants/userPreferences';

// ─── Types ─────────────────────────────────────────────────────────────────────

type Gender = 'Male' | 'Female';
type Sect = 'Sunni' | 'Shia';
type School = 'Hanafi' | "Shafi'i" | "Ja'fari";

interface SheetOption {
  value: string;
  label: string;
  subtitle?: string;
  icon?: string;
}

interface BottomSheetConfig {
  title: string;
  subtitle?: string;
  options: SheetOption[];
  selected: string;
  onSelect: (value: string) => void;
}

// ─── Quick Hub Cards Data ───────────────────────────────────────────────────────

const LEARN_CARDS = [
  {
    id: 'daily_dua',
    label: 'Everyday Duas',
    sublabel: 'Daily supplications',
    icon: 'hands-as-one',
    iconType: 'mci',
    color: '#3B82F6',
    bgLight: '#EFF6FF',
    bgDark: 'rgba(59, 130, 246, 0.15)',
  },
  {
    id: 'occasional_prayers',
    label: 'Occasional Salah',
    sublabel: 'Eid, Janazah & more',
    icon: 'mosque',
    iconType: 'mci',
    color: '#10B981',
    bgLight: '#ECFDF5',
    bgDark: 'rgba(16, 185, 129, 0.15)',
  },
  {
    id: 'essence_salah',
    label: 'Essence of Salah',
    sublabel: 'Spiritual depth',
    icon: 'book-open',
    iconType: 'feather',
    color: '#8B5CF6',
    bgLight: '#F5F3FF',
    bgDark: 'rgba(139, 92, 246, 0.15)',
  },
  {
    id: 'salah_verses',
    label: 'Salah Verses',
    sublabel: 'Quranic recitations',
    icon: 'book',
    iconType: 'feather',
    color: '#F59E0B',
    bgLight: '#FFFBEB',
    bgDark: 'rgba(245, 158, 11, 0.15)',
  },
  {
    id: 'benefits',
    label: 'Blessings',
    sublabel: 'Rewards & virtues',
    icon: 'award',
    iconType: 'feather',
    color: '#EC4899',
    bgLight: '#FDF2F8',
    bgDark: 'rgba(236, 72, 153, 0.15)',
  },
];

const GENDER_OPTIONS: SheetOption[] = [
  { value: 'Male', label: 'Male', subtitle: 'Salah postures tailored for men', icon: '♂' },
  { value: 'Female', label: 'Female', subtitle: 'Salah postures tailored for women', icon: '♀' },
];

const SECT_SCHOOL_OPTIONS: SheetOption[] = [
  { value: 'Sunni__Hanafi', label: 'Hanafi (Sunni)', subtitle: 'Imam Abu Hanifa — Method 1 (Karachi)' },
  { value: "Sunni__Shafi'i", label: "Shafi'i (Sunni)", subtitle: "Imam Al-Shafi'i — Method 1 (Karachi)" },
  { value: "Shia__Ja'fari", label: "Ja'fari (Shia)", subtitle: "Imam Ja'far Al-Sadiq — Method 0 (Leva/Qum)" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const MoreScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { isDarkMode, colors, toggleDarkMode } = useTheme();
  const { openSidebar } = useSidebar();
  const { preferences, updatePreferences } = useUserPreferences();
  const { user, isAuthenticated, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  // Settings state synced with Redux userPreferences
  const gender: Gender = preferences.gender === 'male' ? 'Male' : 'Female';
  const sect: Sect = preferences.sect === 'shia' ? 'Shia' : 'Sunni';

  const setGender = (g: Gender) => {
    updatePreferences({ gender: g.toLowerCase() as UserGender });
  };
  const setSect = (s: Sect) => {
    updatePreferences({ sect: s.toLowerCase() as IslamicSect });
  };

  const [school, setSchool] = useState<School>(sect === 'Shia' ? "Ja'fari" : 'Hanafi');
  const [autoSettings, setAutoSettings] = useState(true);
  const [prayerAlerts, setPrayerAlerts] = useState(true);
  const [translation, setTranslation] = useState('English & Urdu');
  const [azanSound, setAzanSound] = useState('Makkah Azan');
  const [notified, setNotified] = useState(false);

  const handleNotifyPress = () => {
    setNotified(true);
    Alert.alert(
      '🔔 Notification Set!',
      'Thank you for your interest! You will be notified as soon as the More tab features launch.',
      [{ text: 'Great!' }]
    );
  };

  // Bottom sheet state
  const [sheetConfig, setSheetConfig] = useState<BottomSheetConfig | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const accent = isDarkMode ? '#60A5FA' : '#2563EB';
  const accentSoft = isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.08)';
  const bottomPad = Platform.OS === 'android' ? Math.max(insets.bottom, 16) : Math.max(insets.bottom, 12);

  const mainScrollRef = useRef<ScrollView>(null);
  useScrollToTop(mainScrollRef);

  useEffect(() => {
    if (isFocused) {
      RNStatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content', true);
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [isFocused, isDarkMode]);

  // Sync default school with sect change
  useEffect(() => {
    if (sect === 'Shia' && school !== "Ja'fari") {
      setSchool("Ja'fari");
    } else if (sect === 'Sunni' && school === "Ja'fari") {
      setSchool('Hanafi');
    }
  }, [sect]);

  // ── Bottom Sheet Helpers ───────────────────────────────────────────────────

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

  // ── Pickers ───────────────────────────────────────────────────────────────

  const openGenderPicker = () => {
    openSheet({
      title: 'Select Gender',
      subtitle: 'Prayer posture guides will adapt to your selection',
      options: GENDER_OPTIONS,
      selected: gender,
      onSelect: (v) => setGender(v as Gender),
    });
  };

  const openSchoolPicker = () => {
    openSheet({
      title: 'School of Thought & Sect',
      subtitle: 'Prayer calculation method will update automatically',
      options: SECT_SCHOOL_OPTIONS,
      selected: `${sect}__${school}`,
      onSelect: (v) => {
        const [s, m] = v.split('__') as [Sect, School];
        setSect(s);
        setSchool(m);
      },
    });
  };

  // ── Render Helpers ─────────────────────────────────────────────────────────

  const renderIcon = (type: string, name: string, color: string, size: number = 20) => {
    if (type === 'mci') return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
    if (type === 'feather') return <Feather name={name as any} size={size} color={color} />;
    return <Ionicons name={name as any} size={size} color={color} />;
  };

  const renderNavRow = (
    iconName: string,
    iconType: string,
    label: string,
    value?: string,
    onPress?: () => void,
    isLast?: boolean,
    badgeText?: string
  ) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.settingsRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.settingsRowLeft}>
        <View style={[styles.rowIconCircle, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : colors.surfaceSecondary }]}>
          {renderIcon(iconType, iconName, accent, 18)}
        </View>
        <Text style={[styles.settingsRowLabel, { color: colors.textPrimary }]}>{label}</Text>
      </View>

      <View style={styles.settingsRowRight}>
        {badgeText ? (
          <View style={[styles.inlineBadge, { backgroundColor: colors.gold + '20' }]}>
            <Text style={[styles.inlineBadgeText, { color: colors.gold }]}>{badgeText}</Text>
          </View>
        ) : null}
        {value ? <Text style={[styles.settingsRowValue, { color: accent }]}>{value}</Text> : null}
        {onPress && (
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderToggleRow = (
    iconName: string,
    iconType: string,
    label: string,
    value: boolean,
    onChange: (v: boolean) => void,
    isLast?: boolean,
    subtitle?: string
  ) => (
    <View
      style={[
        styles.settingsRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.settingsRowLeft}>
        <View style={[styles.rowIconCircle, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : colors.surfaceSecondary }]}>
          {renderIcon(iconType, iconName, accent, 18)}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.settingsRowLabel, { color: colors.textPrimary }]}>{label}</Text>
          {subtitle ? (
            <Text style={[styles.settingsRowSublabel, { color: colors.textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        thumbColor={value ? (isDarkMode ? '#60A5FA' : '#FFFFFF') : (isDarkMode ? '#64748B' : '#94A3B8')}
        trackColor={{ false: isDarkMode ? '#334155' : '#E2E8F0', true: colors.primary }}
        ios_backgroundColor={isDarkMode ? '#334155' : '#E2E8F0'}
      />
    </View>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitleHeader, { color: colors.textSecondary }]}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );

  const schoolLabel = `${sect} · ${school}`;
  const methodLabel = SECT_METHOD_LABELS[preferences.sect];

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {isFocused && <StatusBar style={isDarkMode ? 'light' : 'dark'} animated={true} />}

      {/* ── Top Header Bar ── */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity activeOpacity={0.7} onPress={openSidebar} style={{ paddingRight: 4, paddingVertical: 2 }}>
            <Ionicons name="menu-outline" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { color: colors.textPrimary }]}>More & Settings</Text>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={styles.proBadge}>
          <LinearGradient
            colors={['#D4AF37', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.proGradient}
          >
            <Ionicons name="sparkles" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.proBadgeText}>PRO</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Main Scrollable Body ── */}
      <ScrollView
        ref={mainScrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile & Sect Banner Card ── */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <LinearGradient
            colors={isDarkMode ? ['#1E293B', '#0F172A'] : ['#F0F7FF', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroLeft}>
              <View style={[styles.avatarCircle, { backgroundColor: accent + '20', borderColor: accent }]}>
                <Ionicons name="person" size={28} color={accent} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={[styles.heroName, { color: colors.textPrimary }]}>
                    {isAuthenticated ? (user?.fullName || user?.email || 'Believer') : 'Islamic Learner (Guest)'}
                  </Text>
                  <View style={[styles.sectPill, { backgroundColor: colors.primary + '18' }]}>
                    <Text style={[styles.sectPillText, { color: colors.primary }]}>{sect}</Text>
                  </View>
                </View>
                <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
                  {schoolLabel} • {gender} Posture
                </Text>
              </View>
            </View>
            
            <TouchableOpacity activeOpacity={0.8} onPress={openSchoolPicker} style={[styles.editPill, { borderColor: accent }]}>
              <Ionicons name="options-outline" size={14} color={accent} />
              <Text style={[styles.editPillText, { color: accent }]}>Change</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Active Calculation Method Info Footer */}
          <View style={[styles.methodBanner, { backgroundColor: isDarkMode ? 'rgba(15,23,42,0.6)' : '#F8FAFC', borderTopColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={15} color={colors.textSecondary} />
            <Text style={[styles.methodBannerText, { color: colors.textSecondary }]} numberOfLines={1}>
              Method: {methodLabel}
            </Text>
          </View>
        </View>

        {/* ── Learn & Explore Hub Grid ── */}
        <View style={{ marginTop: 20 }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitleHeader, { color: colors.textSecondary }]}>LEARN & EXPLORE</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation?.navigate('Learn')}>
              <Text style={[styles.viewAllText, { color: accent }]}>View All →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsHorizontalScroll}>
            {LEARN_CARDS.map((card) => (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.8}
                onPress={() => {
                  if (card.id === 'daily_dua' || card.id === 'salah_verses') {
                    navigation?.navigate('LessonsList', { level: 'starter' });
                  } else {
                    navigation?.navigate('Learn');
                  }
                }}
                style={[
                  styles.hubCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.hubIconBg, { backgroundColor: isDarkMode ? card.bgDark : card.bgLight }]}>
                  {renderIcon(card.iconType, card.icon, card.color, 24)}
                </View>
                <Text style={[styles.hubCardTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {card.label}
                </Text>
                <Text style={[styles.hubCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
                  {card.sublabel}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Settings Categories ── */}

        {/* 1. Personalization & Faith */}
        {renderSection(
          'Personalization & Faith',
          <>
            {renderNavRow('person-outline', 'ion', 'Gender Postures', gender, openGenderPicker)}
            {renderNavRow('book-outline', 'ion', 'School of Thought / Sect', schoolLabel, openSchoolPicker, true)}
          </>
        )}

        {/* 2. Salah & Timing Preferences */}
        {renderSection(
          'Salah & Timing Preferences',
          <>
            {renderToggleRow(
              'location-outline',
              'ion',
              'Auto Location & Timings',
              autoSettings,
              setAutoSettings,
              false,
              'Fetch timing based on current GPS'
            )}
            {renderNavRow(
              'language-outline',
              'ion',
              'Translation & Recitation',
              translation,
              () => {
                const opts = ['English & Urdu', 'English Only', 'Urdu Only'];
                const nextIdx = (opts.indexOf(translation) + 1) % opts.length;
                setTranslation(opts[nextIdx]);
              },
              true
            )}
          </>
        )}

        {/* 3. Notifications & Reminders */}
        {renderSection(
          'Notifications & Reminders',
          <>
            {renderToggleRow(
              'notifications-outline',
              'ion',
              'Prayer Time Azan Alerts',
              prayerAlerts,
              setPrayerAlerts,
              false,
              'Notify before & at prayer time'
            )}
            {renderNavRow(
              'volume-high-outline',
              'ion',
              'Azan Sound',
              azanSound,
              () => {
                const sounds = ['Makkah Azan', 'Madinah Azan', 'Soft Beep'];
                const nextIdx = (sounds.indexOf(azanSound) + 1) % sounds.length;
                setAzanSound(sounds[nextIdx]);
              },
              true
            )}
          </>
        )}

        {/* 4. Appearance & Preferences */}
        {renderSection(
          'Appearance & Preferences',
          <>
            {renderToggleRow(
              'moon-outline',
              'ion',
              'Dark Mode',
              isDarkMode,
              () => toggleDarkMode(),
              false
            )}
            {renderNavRow('globe-outline', 'ion', 'App Language', 'English', undefined, true)}
          </>
        )}

        {/* 5. Account & Security */}
        {renderSection(
          'Account & Cloud Sync',
          <>
            {renderNavRow(
              isAuthenticated ? 'person-circle-outline' : 'sparkles-outline',
              'ion',
              isAuthenticated ? 'Account Profile' : 'Guest Access',
              isAuthenticated ? (user?.fullName || user?.email || 'Logged In') : 'Tap to Sign In / Register',
              () => navigation?.navigate('Auth'),
              !isAuthenticated
            )}
            {isAuthenticated &&
              renderNavRow(
                'log-out-outline',
                'ion',
                'Sign Out',
                undefined,
                () => {
                  Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Sign Out',
                      style: 'destructive',
                      onPress: () => {
                        signOut();
                        navigation?.navigate('Auth');
                      },
                    },
                  ]);
                },
                true
              )}
          </>
        )}

        {/* 6. About & Community */}
        {renderSection(
          'About & Support',
          <>
            {renderNavRow('star-outline', 'ion', 'Rate the App', undefined, () => {})}
            {renderNavRow('share-social-outline', 'ion', 'Share with Family & Friends', undefined, () => {})}
            {renderNavRow('shield-checkmark-outline', 'ion', 'Privacy Policy', undefined, () => {})}
            {renderNavRow('information-circle-outline', 'ion', 'App Version', 'v1.0.0', undefined, true)}
          </>
        )}
      </ScrollView>

      {/* ── Bottom Sheet Modal for Pickers ── */}
      <Modal visible={sheetVisible} transparent animationType="none" statusBarTranslucent onRequestClose={closeSheet}>
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              transform: [{ translateY }],
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: isDarkMode ? '#475569' : '#CBD5E1' }]} />

          {sheetConfig && (
            <>
              <View style={styles.sheetHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sheetTitle, { color: isDarkMode ? '#F8FAFC' : '#0F172A' }]}>
                    {sheetConfig.title}
                  </Text>
                  {sheetConfig.subtitle ? (
                    <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
                      {sheetConfig.subtitle}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={closeSheet}
                  style={[styles.sheetCloseBtn, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}
                >
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={[styles.sheetDivider, { backgroundColor: colors.border }]} />

              <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false} bounces={false}>
                {sheetConfig.options.map((opt, idx) => {
                  const isSelected = opt.value === sheetConfig.selected;
                  const isLast = idx === sheetConfig.options.length - 1;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      activeOpacity={0.7}
                      onPress={() => handleSheetSelect(opt.value)}
                      style={[
                        styles.optionRow,
                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                        isSelected && { backgroundColor: accent + '12' },
                      ]}
                    >
                      <View style={styles.optionLeft}>
                        {opt.icon ? (
                          <View
                            style={[
                              styles.optionIconCircle,
                              { backgroundColor: isSelected ? accent + '20' : isDarkMode ? '#334155' : '#F1F5F9' },
                            ]}
                          >
                            <Text style={[styles.optionIconText, { color: isSelected ? accent : colors.textSecondary }]}>
                              {opt.icon}
                            </Text>
                          </View>
                        ) : null}
                        <View style={styles.optionTextGroup}>
                          <Text
                            style={[
                              styles.optionLabel,
                              {
                                color: isSelected ? accent : colors.textPrimary,
                                fontWeight: isSelected ? '700' : '500',
                              },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {opt.subtitle ? (
                            <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                              {opt.subtitle}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      <View
                        style={[
                          styles.radioOuter,
                          { borderColor: isSelected ? accent : isDarkMode ? '#475569' : '#CBD5E1' },
                        ]}
                      >
                        {isSelected && <View style={[styles.radioInner, { backgroundColor: accent }]} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}
        </Animated.View>
      </Modal>

      {/* ── Glassmorphism Lock Overlay UI ── */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="auto">
        <BlurView
          intensity={Platform.OS === 'ios' ? 70 : 85}
          tint={isDarkMode ? 'dark' : 'light'}
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFillObject}
        />

        {/* Ambient Gradient Backdrop */}
        <LinearGradient
          colors={
            isDarkMode
              ? ['rgba(15, 23, 42, 0.75)', 'rgba(30, 41, 59, 0.82)', 'rgba(15, 23, 42, 0.9)']
              : ['rgba(255, 255, 255, 0.6)', 'rgba(241, 245, 249, 0.75)', 'rgba(255, 255, 255, 0.88)']
          }
          style={[
            styles.glassBackdrop,
            {
              backgroundColor: Platform.OS === 'android'
                ? (isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(241, 245, 249, 0.85)')
                : 'transparent',
            }
          ]}
        >
          {/* Centered Glassmorphic Card */}
          <View style={styles.glassCardContainer}>
            <LinearGradient
              colors={
                isDarkMode
                  ? ['rgba(255, 255, 255, 0.14)', 'rgba(255, 255, 255, 0.04)']
                  : ['rgba(255, 255, 255, 0.88)', 'rgba(255, 255, 255, 0.48)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.glassCard,
                {
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.8)',
                },
              ]}
            >
              {/* Glowing Lock Halo Ring */}
              <View style={styles.lockHaloWrapper}>
                <LinearGradient
                  colors={['#F59E0B', '#D4AF37', '#3B82F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.lockHaloRing}
                >
                  <View style={[styles.lockIconBox, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF' }]}>
                    <Ionicons name="lock-closed" size={36} color={isDarkMode ? '#F59E0B' : '#2563EB'} />
                  </View>
                </LinearGradient>
              </View>

              {/* Coming Soon Badge */}
              <View style={styles.glassBadge}>
                <LinearGradient
                  colors={['#D4AF37', '#F59E0B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.glassBadgeGradient}
                >
                  <Ionicons name="sparkles" size={12} color="#FFFFFF" style={{ marginRight: 5 }} />
                  <Text style={styles.glassBadgeText}>COMING SOON</Text>
                </LinearGradient>
              </View>

              {/* Title */}
              <Text style={[styles.glassTitle, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}>
                More Tab is Locked
              </Text>

              {/* Reduced Minimal Subtitle Message */}
              <Text style={[styles.glassMessage, { color: isDarkMode ? '#CBD5E1' : '#475569' }]}>
                New features & settings are coming soon!
              </Text>

              {/* Action Buttons */}
              <View style={styles.glassActions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleNotifyPress}
                  style={styles.notifyBtn}
                >
                  <LinearGradient
                    colors={notified ? ['#10B981', '#059669'] : ['#2563EB', '#1D4ED8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.notifyBtnGradient}
                  >
                    <Ionicons
                      name={notified ? 'checkmark-circle' : 'notifications-outline'}
                      size={18}
                      color="#FFFFFF"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.notifyBtnText}>
                      {notified ? 'Subscribed!' : 'Notify Me'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {navigation && (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => navigation.navigate('Home')}
                    style={[
                      styles.goHomeBtn,
                      {
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)',
                      },
                    ]}
                  >
                    <Ionicons name="home-outline" size={16} color={isDarkMode ? '#F8FAFC' : '#334155'} style={{ marginRight: 6 }} />
                    <Text style={[styles.goHomeBtnText, { color: isDarkMode ? '#F8FAFC' : '#334155' }]}>
                      Back to Home
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBarTitle: { fontSize: 21, fontWeight: '800', letterSpacing: -0.2 },
  proBadge: { borderRadius: 16, overflow: 'hidden' },
  proGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  proBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 0.6 },

  // Hero Profile Card
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  heroGradient: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: { fontSize: 17, fontWeight: '800' },
  sectPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sectPillText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  heroSub: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  editPillText: { fontSize: 12, fontWeight: '700' },
  methodBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  methodBannerText: { fontSize: 12, fontWeight: '500', flex: 1 },

  // Hub Cards Section
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitleHeader: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 16,
    paddingHorizontal: 2,
  },
  viewAllText: { fontSize: 13, fontWeight: '700' },
  cardsHorizontalScroll: { gap: 12 },
  hubCard: {
    width: 140,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  hubIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  hubCardTitle: { fontSize: 14, fontWeight: '700', width: '100%' },
  hubCardSub: { fontSize: 11, fontWeight: '500', marginTop: 2, width: '100%' },

  // Settings Section Cards
  sectionContainer: { marginTop: 4 },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsRowLabel: { fontSize: 14.5, fontWeight: '600' },
  settingsRowSublabel: { fontSize: 11.5, fontWeight: '400', marginTop: 2 },
  settingsRowRight: { flexDirection: 'row', alignItems: 'center' },
  settingsRowValue: { fontSize: 13.5, fontWeight: '600' },
  inlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  inlineBadgeText: { fontSize: 11, fontWeight: '800' },

  // Bottom Sheet Modal
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 24,
    maxHeight: '80%',
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
  },
  sheetTitle: { fontSize: 19, fontWeight: '800', letterSpacing: -0.2 },
  sheetSubtitle: { fontSize: 13, marginTop: 3, fontWeight: '500' },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetDivider: { height: 1, marginBottom: 4 },
  sheetScroll: { flexGrow: 0 },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  optionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionIconText: { fontSize: 16, fontWeight: '700' },
  optionTextGroup: { flex: 1, paddingRight: 8 },
  optionLabel: { fontSize: 15 },
  optionSubtitle: { fontSize: 12, marginTop: 2, fontWeight: '400' },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 11, height: 11, borderRadius: 6 },

  // ── Glassmorphism UI Lock Overlay Styles ──
  glassBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  glassCardContainer: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  glassCard: {
    width: '100%',
    borderRadius: 26,
    borderWidth: 1.5,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  lockHaloWrapper: {
    marginBottom: 16,
  },
  lockHaloRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  lockIconBox: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassBadge: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },
  glassBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  glassBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  glassTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  glassMessage: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '400',
  },
  glassActions: {
    width: '100%',
    gap: 10,
  },
  notifyBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
  },
  notifyBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
  },
  notifyBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  goHomeBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  goHomeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
