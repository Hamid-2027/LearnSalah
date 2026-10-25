import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
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
import { ChallengeCardsSection } from './ChallengeCardsSection';
import { StarterLearnUI } from './StarterLearnUI';

import {
  LEVEL_MODULES,
  CurriculumLevel,
  CurriculumModule,
  SubModule,
} from './curriculumData';

export const LearnScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isDarkMode, colors } = useTheme();
  const { openSidebar } = useSidebar();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [activeLevel, setActiveLevel] = useState<CurriculumLevel>('starter');
  const [levelModalVisible, setLevelModalVisible] = useState(false);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>('step_namaz');

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

  const isStarter = activeLevel === 'starter';

  return (
    <SafeAreaView
      style={[
        styles.root,
        { backgroundColor: isStarter ? (isDarkMode ? '#020B1C' : colors.background) : colors.background },
      ]}
      edges={['top', 'left', 'right']}
    >
      {isFocused && (
        <StatusBar
          style={isDarkMode ? 'light' : 'dark'}
          animated={true}
        />
      )}

      {/* ── Top Header ── */}
      {isStarter ? (
        <View
          style={[
            styles.starterHeader,
            {
              backgroundColor: isDarkMode ? '#020B1C' : colors.surface,
              borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : colors.border,
              borderBottomWidth: isDarkMode ? 0 : StyleSheet.hairlineWidth,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={openSidebar}
            style={styles.starterMenuBtn}
          >
            <Ionicons name="menu-outline" size={26} color={isDarkMode ? '#FFFFFF' : colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.starterTitleContainer} pointerEvents="none">
            <Text style={[styles.starterHeaderTitle, { color: isDarkMode ? '#FFFFFF' : colors.textPrimary }]}>
              Learn
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setLevelModalVisible(true)}
            style={[
              styles.starterLevelBtn,
              {
                backgroundColor: isDarkMode ? 'rgba(96, 165, 250, 0.12)' : 'rgba(37, 99, 235, 0.08)',
                borderColor: isDarkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(37, 99, 235, 0.25)',
              },
            ]}
          >
            <Ionicons name="ribbon-outline" size={13} color={isDarkMode ? '#93C5FD' : colors.primary} />
            <Text style={[styles.starterLevelText, { color: isDarkMode ? '#93C5FD' : colors.primary }]}>Starter</Text>
            <Ionicons name="chevron-down" size={11} color={isDarkMode ? '#93C5FD' : colors.primary} />
          </TouchableOpacity>
        </View>
      ) : (
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

          {/* Level Switcher Button in top right corner */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setLevelModalVisible(true)}
            style={[
              styles.levelBadgeBtn,
              {
                backgroundColor: colors.gold + '18',
                borderColor: colors.gold + '40',
              },
            ]}
          >
            <Ionicons name="ribbon" size={14} color={colors.gold} />
            <Text style={[styles.levelBadgeText, { color: colors.gold }]}>
              {activeLevel === 'mastery' ? 'Mastery' : 'Explorer'}
            </Text>
            <Ionicons name="chevron-down" size={12} color={colors.gold} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Starter Level: completely different minimalist UI ── */}
      {activeLevel === 'starter' ? (
        <StarterLearnUI
          scrollRef={mainScrollRef}
          bottomPad={bottomPad}
        />
      ) : (
        <ScrollView
          ref={mainScrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Challenge Cards Section (Moved to the Top of Learn Screen) ── */}
          <ChallengeCardsSection />

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
                    {levelData.modules.length} Major Tracks
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
                  0 of {levelData.modules.reduce((acc, m) => acc + (m.subModules?.length || m.lessonsCount), 0)} stages mastered
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.resumeBtn, { backgroundColor: colors.primary }]}
                  onPress={() => navigation?.navigate('LessonsList', { level: activeLevel, moduleId: levelData.modules[0]?.id })}
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
                CURRICULUM TRACKS ({levelData.modules.length})
              </Text>
              <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>Tap chevron to preview steps</Text>
            </View>

            <View style={{ gap: 10 }}>
              {levelData.modules.map((module) => {
                const isExpanded = expandedModuleId === module.id;
                const subCount = module.subModules?.length || module.lessonsCount;

                return (
                  <View
                    key={module.id}
                    style={[
                      styles.moduleCardWrapper,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isExpanded ? module.accentColor + '80' : colors.border,
                      },
                    ]}
                  >
                    {/* Module Header Card */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.moduleHeaderRow}
                      onPress={() => navigation?.navigate?.('LessonsList', { level: activeLevel, moduleId: module.id })}
                    >
                      {/* Left Icon Box */}
                      <View style={[styles.moduleIconBox, { backgroundColor: module.accentColor + '18' }]}>
                        {renderModuleIcon(module.iconFamily, module.iconName, module.accentColor)}
                      </View>

                      {/* Middle Info */}
                      <View style={styles.moduleInfo}>
                        <Text style={[styles.moduleTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                          {module.title}
                        </Text>
                        <Text style={[styles.moduleSub, { color: colors.textSecondary }]} numberOfLines={1}>
                          {module.subtitle}
                        </Text>

                        {/* Micro Metadata Row */}
                        <View style={styles.metaRow}>
                          <View style={[styles.microBadge, { backgroundColor: module.accentColor + '15' }]}>
                            <Text style={[styles.microBadgeText, { color: module.accentColor }]}>{module.badge}</Text>
                          </View>
                          <View style={styles.metaDot} />
                          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                            {subCount} Steps
                          </Text>
                          <View style={styles.metaDot} />
                          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                            {module.duration}
                          </Text>
                        </View>
                      </View>

                      {/* Collapsible / Expandable Chevron Icon */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        onPress={(e) => {
                          e.stopPropagation();
                          setExpandedModuleId(isExpanded ? null : module.id);
                        }}
                        style={[
                          styles.expandChevronBtn,
                          {
                            backgroundColor: isExpanded
                              ? module.accentColor + '20'
                              : (isDarkMode ? 'rgba(255,255,255,0.06)' : '#F1F5F9'),
                            borderColor: isExpanded ? module.accentColor + '50' : 'transparent',
                          },
                        ]}
                      >
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={17}
                          color={isExpanded ? module.accentColor : colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>

                    {/* ── Expanded Dropdown: Sequential Sub-modules ── */}
                    {isExpanded && module.subModules && module.subModules.length > 0 && (
                      <View
                        style={[
                          styles.subModulesContainer,
                          {
                            backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                            borderTopColor: colors.border,
                          },
                        ]}
                      >
                        {/* Clean Non-Overlapping Header */}
                        <View style={styles.subModulesHeaderRow}>
                          <Text style={[styles.subModulesSectionTitle, { color: colors.textSecondary }]}>
                            CURRICULUM SEQUENCE
                          </Text>
                          <Text style={[styles.subModulesSectionHint, { color: colors.textSecondary }]}>
                            {module.subModules.length} Steps
                          </Text>
                        </View>

                        {/* Clean Sequential Step Rows */}
                        <View style={styles.subModulesList}>
                          {module.subModules.map((sub) => (
                            <TouchableOpacity
                              key={sub.id}
                              activeOpacity={0.7}
                              onPress={() =>
                                navigation?.navigate?.('LessonsList', {
                                  level: activeLevel,
                                  moduleId: module.id,
                                  initialStepId: sub.id,
                                })
                              }
                              style={[
                                styles.subModuleRow,
                                {
                                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                                  borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
                                },
                              ]}
                            >
                              {/* Step Number Badge */}
                              <View
                                style={[
                                  styles.stepNumberBadge,
                                  {
                                    backgroundColor: module.accentColor + '15',
                                    borderColor: module.accentColor + '30',
                                  },
                                ]}
                              >
                                <Text style={[styles.stepNumberText, { color: module.accentColor }]}>
                                  {sub.stepNumber < 10 ? `0${sub.stepNumber}` : sub.stepNumber}
                                </Text>
                              </View>

                              {/* Step Text Info */}
                              <View style={styles.stepInfoCol}>
                                <Text
                                  style={[styles.stepTitleText, { color: colors.textPrimary }]}
                                  numberOfLines={1}
                                >
                                  {sub.title}
                                </Text>
                                <View style={styles.stepMetaRow}>
                                  <Text style={[styles.stepMetaText, { color: colors.textSecondary }]}>
                                    {sub.duration}
                                  </Text>
                                  {sub.badge ? (
                                    <>
                                      <View style={styles.stepMetaDot} />
                                      <Text
                                        style={[styles.stepMetaText, { color: colors.textSecondary }]}
                                        numberOfLines={1}
                                      >
                                        {sub.badge}
                                      </Text>
                                    </>
                                  ) : null}
                                </View>
                              </View>

                              {/* Minimalist Chevron */}
                              <Ionicons
                                name="chevron-forward"
                                size={15}
                                color={colors.textSecondary}
                                style={{ opacity: 0.6 }}
                              />
                            </TouchableOpacity>
                          ))}
                        </View>

                        {/* Bottom Button to Open Full Screen Hub */}
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() =>
                            navigation?.navigate?.('LessonsList', {
                              level: activeLevel,
                              moduleId: module.id,
                            })
                          }
                          style={[styles.openFullHubBtn, { backgroundColor: module.accentColor }]}
                        >
                          <Text style={styles.openFullHubBtnText}>
                            View All {module.subModules.length} Lessons
                          </Text>
                          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}

      {/* ── Curriculum Level Switcher Modal ── */}
      <Modal
        visible={levelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLevelModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.levelModalOverlay}
          activeOpacity={1}
          onPress={() => setLevelModalVisible(false)}
        >
          <View
            style={[
              styles.levelModalCard,
              { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', borderColor: colors.border },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.levelModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.levelModalIcon, { backgroundColor: colors.gold + '20' }]}>
                  <Ionicons name="ribbon" size={20} color={colors.gold} />
                </View>
                <View>
                  <Text style={[styles.levelModalTitle, { color: colors.textPrimary }]}>
                    Curriculum Level
                  </Text>
                  <Text style={[styles.levelModalSubtitle, { color: colors.textSecondary }]}>
                    Switch your learning journey
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setLevelModalVisible(false)}
                style={[styles.levelModalCloseBtn, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}
              >
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10, marginTop: 8 }}>
              {(
                [
                  {
                    key: 'starter',
                    title: 'Starter Foundations',
                    levelNum: 'Level 1',
                    desc: 'Core Salah postures, purification & daily essentials',
                    modulesCount: '5 Modules • 30 Lessons',
                    icon: 'sparkles-outline',
                    accentColor: '#2563EB',
                  },
                  {
                    key: 'mastery',
                    title: 'Salah Mastery',
                    levelNum: 'Level 2',
                    desc: 'Sunnah & Nafl prayers, Qada calculation & Tajweed',
                    modulesCount: '3 Modules • 18 Lessons',
                    icon: 'shield-checkmark-outline',
                    accentColor: '#D4AF37',
                  },
                  {
                    key: 'explorer',
                    title: 'Islamic Explorer',
                    levelNum: 'Level 3',
                    desc: 'Secrets of Khushoo (focus) & historical wisdom',
                    modulesCount: '2 Modules • 8 Lessons',
                    icon: 'compass-outline',
                    accentColor: '#8B5CF6',
                  },
                ] as const
              ).map((lvl) => {
                const isSelected = activeLevel === lvl.key;
                return (
                  <TouchableOpacity
                    key={lvl.key}
                    activeOpacity={0.8}
                    onPress={() => {
                      setActiveLevel(lvl.key);
                      setLevelModalVisible(false);
                    }}
                    style={[
                      styles.levelOptionCard,
                      {
                        backgroundColor: isSelected
                          ? lvl.accentColor + '15'
                          : isDarkMode
                            ? '#0F172A'
                            : '#F8FAFC',
                        borderColor: isSelected ? lvl.accentColor : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.levelOptionIconBox,
                        { backgroundColor: isSelected ? lvl.accentColor : lvl.accentColor + '20' },
                      ]}
                    >
                      <Ionicons
                        name={lvl.icon as any}
                        size={20}
                        color={isSelected ? '#FFFFFF' : lvl.accentColor}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.levelOptionTitle, { color: colors.textPrimary }]}>
                          {lvl.title}
                        </Text>
                        <View
                          style={[
                            styles.levelOptionBadge,
                            { backgroundColor: lvl.accentColor + '22' },
                          ]}
                        >
                          <Text style={[styles.levelOptionBadgeText, { color: lvl.accentColor }]}>
                            {lvl.levelNum}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[styles.levelOptionDesc, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {lvl.desc}
                      </Text>
                      <Text style={[styles.levelOptionMeta, { color: lvl.accentColor }]}>
                        {lvl.modulesCount}
                      </Text>
                    </View>

                    {isSelected ? (
                      <View style={[styles.checkCircle, { backgroundColor: lvl.accentColor }]}>
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.emptyCheckCircle,
                          { borderColor: isDarkMode ? '#475569' : '#CBD5E1' },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  starterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#020B1C',
    position: 'relative',
  },
  starterMenuBtn: {
    padding: 4,
    zIndex: 2,
  },
  starterTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starterHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  starterLevelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 12,
    backgroundColor: 'rgba(96, 165, 250, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    zIndex: 2,
  },
  starterLevelText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#93C5FD',
  },
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
  levelBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },

  // Level Selection Modal
  levelModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  levelModalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  levelModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelModalIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelModalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  levelModalSubtitle: {
    fontSize: 12,
    marginTop: 1,
    fontWeight: '500',
  },
  levelModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 12,
  },
  levelOptionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelOptionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  levelOptionBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelOptionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  levelOptionDesc: {
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 2,
  },
  levelOptionMeta: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
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

  // Module Item Card Wrapper & Header
  moduleCardWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  moduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  moduleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  moduleSub: {
    fontSize: 11.5,
    lineHeight: 15,
    marginTop: 1,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  microBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  microBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
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
  expandChevronBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginLeft: 8,
  },

  // Expanded Submodules Sequence Roadmap
  subModulesContainer: {
    borderTopWidth: 1,
    padding: 12,
  },
  subModulesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  subModulesSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  subModulesSectionHint: {
    fontSize: 11,
    fontWeight: '600',
  },
  subModulesList: {
    gap: 6,
  },
  subModuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stepInfoCol: {
    flex: 1,
    marginRight: 8,
  },
  stepTitleText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  stepMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  stepMetaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  stepMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
    marginHorizontal: 5,
  },
  openFullHubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 10,
  },
  openFullHubBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
