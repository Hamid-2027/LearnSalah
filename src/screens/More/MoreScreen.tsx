import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

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

// ─── Dummy Data ────────────────────────────────────────────────────────────────

const LEARN_CARDS_ROW1 = [
  { id: 'daily_dua',          label: 'Everyday\nDua',         emoji: '🤲', color: '#4A90D9' },
  { id: 'occasional_prayers', label: 'Occasional\nPrayers',   emoji: '🕌', color: '#27AE60' },
  { id: 'essence_salah',      label: 'Essence of\nSalah',     emoji: '📖', color: '#8E44AD' },
];

const LEARN_CARDS_ROW2 = [
  { id: 'salah_verses', label: 'Salah\nVerses',        emoji: '📚', color: '#E67E22' },
  { id: 'benefits',     label: 'Benefits &\nBlessings', emoji: '🎁', color: '#E74C3C' },
];

const GENDER_OPTIONS: SheetOption[] = [
  { value: 'Male',   label: 'Male',   subtitle: 'Salah postures for men',   icon: '♂' },
  { value: 'Female', label: 'Female', subtitle: 'Salah postures for women', icon: '♀' },
];

const SECT_SCHOOL_OPTIONS: Record<Sect, SheetOption[]> = {
  Sunni: [
    { value: 'Hanafi',  label: 'Hanafi',  subtitle: 'Sunni — Imam Abu Hanifa' },
    { value: "Shafi'i", label: "Shafi'i", subtitle: "Sunni — Imam Al-Shafi'i" },
  ],
  Shia: [
    { value: "Ja'fari", label: "Ja'fari", subtitle: "Shia — Imam Ja'far Al-Sadiq" },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

export const MoreScreen: React.FC = () => {
  const { isDarkMode, colors, toggleDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  // Settings state
  const [gender, setGender] = useState<Gender>('Female');
  const [sect, setSect] = useState<Sect>('Sunni');
  const [school, setSchool] = useState<School>("Shafi'i");
  const [autoSettings, setAutoSettings] = useState(true);
  const [prayerAlerts, setPrayerAlerts] = useState(true);

  // Bottom sheet state
  const [sheetConfig, setSheetConfig] = useState<BottomSheetConfig | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const accent = isDarkMode ? '#39A6A0' : '#147D7A';
  const accentSoft = isDarkMode ? 'rgba(57,166,160,0.15)' : 'rgba(20,125,122,0.1)';
  const bottomPad = Platform.OS === 'android'
    ? Math.max(insets.bottom, 12)
    : Math.max(insets.bottom, 8);

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
      subtitle: 'Prayer postures will be shown accordingly',
      options: GENDER_OPTIONS,
      selected: gender,
      onSelect: (v) => setGender(v as Gender),
    });
  };

  const openSchoolPicker = () => {
    // First pick sect, then school — we combine into one sheet
    const allOptions: SheetOption[] = [
      { value: 'Sunni__Hanafi',  label: 'Hanafi',  subtitle: 'Sunni · Imam Abu Hanifa' },
      { value: "Sunni__Shafi'i", label: "Shafi'i", subtitle: "Sunni · Imam Al-Shafi'i" },
      { value: "Shia__Ja'fari",  label: "Ja'fari",  subtitle: "Shia · Imam Ja'far Al-Sadiq" },
    ];
    openSheet({
      title: 'School of Thought',
      subtitle: 'Select your sect and madhab',
      options: allOptions,
      selected: `${sect}__${school}`,
      onSelect: (v) => {
        const [s, m] = v.split('__') as [Sect, School];
        setSect(s);
        setSchool(m);
      },
    });
  };

  // ── Renderers ─────────────────────────────────────────────────────────────

  const renderLearnCard = (
    item: { id: string; label: string; emoji: string; color: string },
    flex: number,
  ) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.75}
      style={[styles.learnCard, { flex, backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.learnEmojiCircle, { backgroundColor: item.color + '22' }]}>
        <Text style={styles.learnEmoji}>{item.emoji}</Text>
      </View>
      <Text style={[styles.learnCardLabel, { color: colors.textPrimary }]}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderNavRow = (
    label: string,
    value?: string,
    onPress?: () => void,
    isLast?: boolean,
  ) => (
    <TouchableOpacity
      activeOpacity={0.65}
      onPress={onPress}
      style={[
        styles.settingsRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
    >
      <Text style={[styles.settingsRowLabel, { color: colors.textPrimary }]}>{label}</Text>
      <View style={styles.settingsRowRight}>
        {value ? <Text style={[styles.settingsRowValue, { color: accent }]}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={{ marginLeft: 4 }} />
      </View>
    </TouchableOpacity>
  );

  const renderToggleRow = (
    label: string,
    value: boolean,
    onChange: (v: boolean) => void,
    isLast?: boolean,
  ) => (
    <View
      style={[
        styles.settingsRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
    >
      <Text style={[styles.settingsRowLabel, { color: colors.textPrimary }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        thumbColor={value ? accent : (isDarkMode ? '#555' : '#ccc')}
        trackColor={{ false: isDarkMode ? '#333' : '#ddd', true: accentSoft }}
        ios_backgroundColor={isDarkMode ? '#333' : '#ddd'}
      />
    </View>
  );

  const renderSection = (icon: React.ReactNode, title: string, children: React.ReactNode) => (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
        <View style={[styles.sectionIconCircle, { backgroundColor: accentSoft }]}>{icon}</View>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      </View>
      {children}
    </View>
  );

  // ── School label for display
  const schoolLabel = `${sect} · ${school}`;

  // ── Bottom Sheet translate Y
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.topBarTitle, { color: colors.textPrimary }]}>More</Text>
        <TouchableOpacity activeOpacity={0.8} style={styles.proBadge}>
          <Text style={styles.proBadgeText}>PRO ✦</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Learn & Explore */}
        <Text style={[styles.pageSection, { color: colors.textPrimary }]}>Learn & Explore</Text>

        <View style={styles.learnRow}>
          {LEARN_CARDS_ROW1.map((item) => renderLearnCard(item, 1))}
        </View>
        <View style={styles.learnRow}>
          {LEARN_CARDS_ROW2.map((item) => renderLearnCard(item, 1))}
        </View>

        {/* ── Settings */}
        <Text style={[styles.pageSection, { color: colors.textPrimary, marginTop: 24 }]}>Settings</Text>

        {renderSection(
          <Ionicons name="settings-outline" size={18} color={accent} />,
          'General',
          <>
            {renderNavRow('Gender', gender, openGenderPicker)}
            {renderNavRow('School of Thought', schoolLabel, openSchoolPicker)}
            {renderNavRow('Help', undefined, () => {}, true)}
          </>,
        )}

        {renderSection(
          <MaterialCommunityIcons name="mosque" size={18} color={accent} />,
          'Salah',
          <>
            {renderToggleRow('Auto Settings', autoSettings, setAutoSettings)}
            {renderNavRow('Translation', 'English', () => {}, true)}
          </>,
        )}

        {renderSection(
          <Ionicons name="notifications-outline" size={18} color={accent} />,
          'Notifications',
          <>
            {renderToggleRow('Prayer Time Alerts', prayerAlerts, setPrayerAlerts)}
            {renderNavRow('Alert Sound', 'Default', () => {}, true)}
          </>,
        )}

        {renderSection(
          <Ionicons name="moon-outline" size={18} color={accent} />,
          'Appearance',
          <>
            {renderToggleRow('Dark Mode', isDarkMode, () => toggleDarkMode())}
            {renderNavRow('Language', 'English', () => {}, true)}
          </>,
        )}

        {renderSection(
          <Ionicons name="information-circle-outline" size={18} color={accent} />,
          'About',
          <>
            {renderNavRow('Rate the App', undefined, () => {})}
            {renderNavRow('Share App', undefined, () => {})}
            {renderNavRow('Privacy Policy', undefined, () => {})}
            {renderNavRow('Version', '1.0.0', undefined, true)}
          </>,
        )}
      </ScrollView>

      {/* ── Bottom Sheet Modal ─────────────────────────────────────────────── */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeSheet}
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
              transform: [{ translateY }],
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
        >
          {/* Handle bar */}
          <View style={[styles.sheetHandle, { backgroundColor: isDarkMode ? '#48484A' : '#D1D1D6' }]} />

          {/* Sheet header */}
          {sheetConfig && (
            <>
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={[styles.sheetTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                    {sheetConfig.title}
                  </Text>
                  {sheetConfig.subtitle ? (
                    <Text style={[styles.sheetSubtitle, { color: isDarkMode ? '#8E8E93' : '#6C6C70' }]}>
                      {sheetConfig.subtitle}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity onPress={closeSheet} style={[styles.sheetCloseBtn, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7' }]}>
                  <Ionicons name="close" size={18} color={isDarkMode ? '#AEAEB2' : '#6C6C70'} />
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={[styles.sheetDivider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7' }]} />

              {/* Options list */}
              <ScrollView
                style={styles.sheetScroll}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {sheetConfig.options.map((opt, idx) => {
                  const isSelected = opt.value === sheetConfig.selected;
                  const isLast = idx === sheetConfig.options.length - 1;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      activeOpacity={0.6}
                      onPress={() => handleSheetSelect(opt.value)}
                      style={[
                        styles.optionRow,
                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: isDarkMode ? '#2C2C2E' : '#E5E5EA' },
                        isSelected && { backgroundColor: isDarkMode ? 'rgba(57,166,160,0.08)' : 'rgba(20,125,122,0.05)' },
                      ]}
                    >
                      {/* Left: icon + text */}
                      <View style={styles.optionLeft}>
                        {opt.icon ? (
                          <View style={[styles.optionIconCircle, { backgroundColor: isSelected ? accent + '20' : isDarkMode ? '#2C2C2E' : '#F2F2F7' }]}>
                            <Text style={[styles.optionIcon, { color: isSelected ? accent : isDarkMode ? '#8E8E93' : '#6C6C70' }]}>
                              {opt.icon}
                            </Text>
                          </View>
                        ) : null}
                        <View style={styles.optionTextGroup}>
                          <Text style={[styles.optionLabel, { color: isDarkMode ? '#FFFFFF' : '#000000', fontWeight: isSelected ? '700' : '500' }]}>
                            {opt.label}
                          </Text>
                          {opt.subtitle ? (
                            <Text style={[styles.optionSubtitle, { color: isDarkMode ? '#8E8E93' : '#6C6C70' }]}>
                              {opt.subtitle}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      {/* Right: radio indicator */}
                      <View style={[
                        styles.radioOuter,
                        { borderColor: isSelected ? accent : isDarkMode ? '#48484A' : '#C7C7CC' },
                      ]}>
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
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBarTitle: { fontSize: 22, fontWeight: '800', letterSpacing: 0.2 },
  proBadge: {
    backgroundColor: '#F5A623',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  // Page section heading
  pageSection: { fontSize: 18, fontWeight: '800', letterSpacing: 0.1, marginTop: 16, marginBottom: 12 },

  // Learn Cards
  learnRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  learnCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 108,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  learnEmojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  learnEmoji: { fontSize: 26 },
  learnCardLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center', lineHeight: 17 },

  // Settings Section Card
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700' },

  // Settings Rows
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingsRowLabel: { fontSize: 14, fontWeight: '500' },
  settingsRowRight: { flexDirection: 'row', alignItems: 'center' },
  settingsRowValue: { fontSize: 14, fontWeight: '600' },

  // ── Bottom Sheet ──────────────────────────────────────────────────────────
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 24,
    maxHeight: '75%',
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  sheetSubtitle: {
    fontSize: 12,
    marginTop: 3,
    letterSpacing: 0.1,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetDivider: {
    height: 6,
    marginBottom: 4,
  },
  sheetScroll: {
    flexGrow: 0,
  },

  // ── Option Rows ───────────────────────────────────────────────────────────
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionTextGroup: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    letterSpacing: 0.1,
  },
  optionSubtitle: {
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
});
