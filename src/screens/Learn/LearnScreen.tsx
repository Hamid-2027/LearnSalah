import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useIsFocused, useScrollToTop } from '@react-navigation/native';
import { useTheme, useSidebar } from '../../store/hooks';
import { CardCornerDecoration } from '../../components/CornerDecoration';

type CurriculumLevel = 'starter' | 'mastery' | 'explorer';

interface CurriculumModule {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  duration: string;
  lessonsCount: number;
  iconName: string;
  iconFamily: 'mci' | 'ion' | 'feather';
  accentColor: string;
  screen: string;
  params?: any;
}

const LEVEL_MODULES: Record<CurriculumLevel, { title: string; subtitle: string; modules: CurriculumModule[] }> = {
  starter: {
    title: 'Starter Foundations',
    subtitle: 'Core Salah postures, purification, and daily essentials',
    modules: [
      {
        id: 'step_namaz',
        title: 'Step-by-Step Namaz',
        subtitle: 'Complete visual postures with audio recitations',
        badge: 'Essential',
        duration: '15 mins',
        lessonsCount: 8,
        iconName: 'mosque',
        iconFamily: 'mci',
        accentColor: '#2563EB',
        screen: 'PrayerGuide',
      },
      {
        id: 'wuzu_guide',
        title: 'Wuzu & Purification',
        subtitle: 'Sunnah method of ablution & cleanliness rules',
        badge: '4 Farz',
        duration: '8 mins',
        lessonsCount: 5,
        iconName: 'water',
        iconFamily: 'mci',
        accentColor: '#06B6D4',
        screen: 'LessonsList',
        params: { level: 'starter' },
      },
      {
        id: 'surahs_verses',
        title: 'Salah Surahs & Recitation',
        subtitle: 'Surah Al-Fatiha & short Surahs with translation',
        badge: 'Audio',
        duration: '12 mins',
        lessonsCount: 6,
        iconName: 'book-open',
        iconFamily: 'feather',
        accentColor: '#10B981',
        screen: 'LessonsList',
        params: { level: 'starter' },
      },
      {
        id: 'daily_duas',
        title: 'Masnoon Duas & Adhkar',
        subtitle: 'Supplications before & after obligatory prayers',
        badge: 'Daily',
        duration: '10 mins',
        lessonsCount: 7,
        iconName: 'hands-pray',
        iconFamily: 'mci',
        accentColor: '#8B5CF6',
        screen: 'LessonsList',
        params: { level: 'starter' },
      },
      {
        id: 'salah_conditions',
        title: 'Conditions of Salah (Sharaait)',
        subtitle: '6 external conditions & 6 internal pillars (Arkan)',
        badge: 'Fiqh',
        duration: '10 mins',
        lessonsCount: 4,
        iconName: 'clipboard-text-outline',
        iconFamily: 'mci',
        accentColor: '#F59E0B',
        screen: 'LessonsList',
        params: { level: 'starter' },
      },
    ],
  },
  mastery: {
    title: 'Salah Mastery',
    subtitle: 'Sunnah & Nafl prayers, Qada calculation, and Tajweed',
    modules: [
      {
        id: 'sunnah_nafl',
        title: 'Sunnah & Nafl Prayers',
        subtitle: 'Tahajjud, Ishraq, Duha & Witr guidelines',
        badge: 'Recommended',
        duration: '14 mins',
        lessonsCount: 6,
        iconName: 'sparkles-outline',
        iconFamily: 'ion',
        accentColor: '#D4AF37',
        screen: 'LessonsList',
        params: { level: 'mastery' },
      },
      {
        id: 'qada_salah',
        title: 'Qada & Missed Prayers',
        subtitle: 'Calculation rules & quick compensation method',
        badge: 'Important',
        duration: '10 mins',
        lessonsCount: 4,
        iconName: 'calculator-variant-outline',
        iconFamily: 'mci',
        accentColor: '#EF4444',
        screen: 'LessonsList',
        params: { level: 'mastery' },
      },
      {
        id: 'tajweed_basics',
        title: 'Tajweed for Salah',
        subtitle: 'Proper Makhraj & vocalization during recitation',
        badge: 'Recitation',
        duration: '18 mins',
        lessonsCount: 8,
        iconName: 'volume-high-outline',
        iconFamily: 'ion',
        accentColor: '#3B82F6',
        screen: 'LessonsList',
        params: { level: 'mastery' },
      },
    ],
  },
  explorer: {
    title: 'Islamic Explorer',
    subtitle: 'Spiritual Khushoo (focus) & historical wisdom',
    modules: [
      {
        id: 'khushoo_secrets',
        title: 'Secrets of Khushoo',
        subtitle: 'How to attain deep focus & presence of heart in Salah',
        badge: 'Spiritual',
        duration: '20 mins',
        lessonsCount: 5,
        iconName: 'heart-outline',
        iconFamily: 'ion',
        accentColor: '#EC4899',
        screen: 'LessonsList',
        params: { level: 'explorer' },
      },
      {
        id: 'history_salah',
        title: 'Story of Mi’raj & Salah',
        subtitle: 'How 5 daily prayers were gifted during Isra & Mi’raj',
        badge: 'History',
        duration: '15 mins',
        lessonsCount: 3,
        iconName: 'moon-outline',
        iconFamily: 'ion',
        accentColor: '#8B5CF6',
        screen: 'LessonsList',
        params: { level: 'explorer' },
      },
    ],
  },
};

export const LearnScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isDarkMode, colors } = useTheme();
  const { openSidebar } = useSidebar();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [activeLevel, setActiveLevel] = useState<CurriculumLevel>('starter');

  const mainScrollRef = React.useRef<ScrollView>(null);
  useScrollToTop(mainScrollRef);

  React.useEffect(() => {
    if (isFocused) {
      RNStatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content', true);
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [isFocused, isDarkMode]);

  const bottomPad = Platform.OS === 'android' ? Math.max(insets.bottom, 16) + 70 : Math.max(insets.bottom, 12) + 60;
  const levelData = LEVEL_MODULES[activeLevel];
  const accent = isDarkMode ? '#60A5FA' : '#2563EB';

  const renderModuleIcon = (family: string, name: string, color: string) => {
    if (family === 'mci') return <MaterialCommunityIcons name={name as any} size={22} color={color} />;
    if (family === 'feather') return <Feather name={name as any} size={20} color={color} />;
    return <Ionicons name={name as any} size={22} color={color} />;
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {isFocused && <StatusBar style={isDarkMode ? 'light' : 'dark'} animated={true} />}

      {/* ── Top Header ── */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity activeOpacity={0.7} onPress={openSidebar} style={{ paddingRight: 4, paddingVertical: 2 }}>
            <Ionicons name="menu-outline" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={[styles.iconPill, { backgroundColor: colors.primary + '18' }]}>
            <MaterialCommunityIcons name="school-outline" size={22} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Learn Academy</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Interactive Prayer Curriculum</Text>
          </View>
        </View>

        <View style={[styles.levelBadgePill, { backgroundColor: colors.gold + '18' }]}>
          <Ionicons name="ribbon" size={14} color={colors.gold} />
          <Text style={[styles.levelBadgeText, { color: colors.gold }]}>
            {activeLevel === 'starter' ? 'Level 1' : activeLevel === 'mastery' ? 'Level 2' : 'Level 3'}
          </Text>
        </View>
      </View>

      {/* ── Segmented Level Control Bar ── */}
      <View style={[styles.segmentedContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
        {(['starter', 'mastery', 'explorer'] as CurriculumLevel[]).map((lvl) => {
          const isActive = activeLevel === lvl;
          const label = lvl === 'starter' ? 'Starter' : lvl === 'mastery' ? 'Mastery' : 'Explorer';
          return (
            <TouchableOpacity
              key={lvl}
              activeOpacity={0.8}
              style={[
                styles.segmentTab,
                isActive && [
                  styles.segmentTabActive,
                  { backgroundColor: colors.surface, shadowColor: '#000' },
                ],
              ]}
              onPress={() => setActiveLevel(lvl)}
            >
              <Text
                style={[
                  styles.segmentTabText,
                  { color: isActive ? colors.primary : colors.textSecondary },
                  isActive && { fontWeight: '800' },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        ref={mainScrollRef}
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Dashboard Progress Widget ── */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <CardCornerDecoration color={colors.gold} size={38} offset={2} />

          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <View style={[styles.levelTag, { backgroundColor: colors.primary + '18' }]}>
                  <Text style={[styles.levelTagText, { color: colors.primary }]}>
                    {activeLevel.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.heroTotal, { color: colors.textSecondary }]}>
                  {levelData.modules.length} Modules
                </Text>
              </View>

              <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{levelData.title}</Text>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>{levelData.subtitle}</Text>
            </View>

            {/* Circular Gauge Placeholder / Percent Badge */}
            <View style={[styles.percentBadge, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
              <Text style={[styles.percentValue, { color: colors.primary }]}>0%</Text>
              <Text style={[styles.percentLabel, { color: colors.textSecondary }]}>Completed</Text>
            </View>
          </View>

          {/* Progress Track */}
          <View style={styles.progressSection}>
            <View style={[styles.progressTrack, { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }]}>
              <View style={[styles.progressFill, { width: '0%', backgroundColor: colors.primary }]} />
            </View>
            <View style={styles.progressFooterRow}>
              <Text style={[styles.progressCountText, { color: colors.textSecondary }]}>
                0 of {levelData.modules.reduce((acc, m) => acc + m.lessonsCount, 0)} lessons finished
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.resumeBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation?.navigate('LessonsList', { level: activeLevel })}
              >
                <Text style={styles.resumeBtnText}>Start Level</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Curriculum Modules List ── */}
        <View style={{ marginTop: 6 }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitleHeader, { color: colors.textSecondary }]}>
              MODULES ({levelData.modules.length})
            </Text>
            <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>Tap to open lesson</Text>
          </View>

          <View style={{ gap: 10 }}>
            {levelData.modules.map((module, index) => (
              <TouchableOpacity
                key={module.id}
                activeOpacity={0.78}
                style={[
                  styles.moduleItemCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => navigation?.navigate?.(module.screen, module.params)}
              >
                {/* Left Index / Icon Circle */}
                <View style={[styles.moduleIconBox, { backgroundColor: module.accentColor + '15' }]}>
                  {renderModuleIcon(module.iconFamily, module.iconName, module.accentColor)}
                </View>

                {/* Middle Info */}
                <View style={styles.moduleInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                    <Text style={[styles.moduleTitle, { color: colors.textPrimary }]}>{module.title}</Text>
                  </View>
                  <Text style={[styles.moduleSub, { color: colors.textSecondary }]} numberOfLines={1}>
                    {module.subtitle}
                  </Text>

                  {/* Micro Metadata Row */}
                  <View style={styles.metaRow}>
                    <View style={[styles.microBadge, { backgroundColor: module.accentColor + '12' }]}>
                      <Text style={[styles.microBadgeText, { color: module.accentColor }]}>{module.badge}</Text>
                    </View>
                    <View style={styles.metaDot} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {module.lessonsCount} Lessons
                    </Text>
                    <View style={styles.metaDot} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {module.duration}
                    </Text>
                  </View>
                </View>

                {/* Right Arrow / Action Circle */}
                <View style={[styles.actionCircle, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                  <Ionicons name="play" size={14} color={module.accentColor} style={{ marginLeft: 2 }} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconPill: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    marginTop: 1,
  },
  levelBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },

  // Segmented Control Bar
  segmentedContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 4,
    borderRadius: 14,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentTabActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentTabText: {
    fontSize: 13,
    fontWeight: '600',
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },

  // Hero Card
  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  levelTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelTagText: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroTotal: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 3,
  },
  heroSubtitle: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  percentBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  percentLabel: {
    fontSize: 9.5,
    fontWeight: '600',
  },

  // Progress Section
  progressSection: {
    marginTop: 16,
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },

  // Modules List
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitleHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionHint: {
    fontSize: 11.5,
    fontWeight: '500',
  },

  // Module Item Card
  moduleItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  moduleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  moduleSub: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  microBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  microBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
