import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  Feather,
} from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../store/hooks';
import { CardCornerDecoration } from '../../components/CornerDecoration';
import {
  LEVEL_MODULES,
  CurriculumLevel,
  CurriculumModule,
  SubModule,
} from './curriculumData';

export const LessonsListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isDarkMode, colors } = useTheme();
  const insets = useSafeAreaInsets();

  const activeLevel = (route.params?.level || 'starter') as CurriculumLevel;
  const levelData = LEVEL_MODULES[activeLevel] || LEVEL_MODULES.starter;
  const targetModuleId = route.params?.moduleId || levelData.modules[0]?.id || 'step_namaz';
  const currentModule: CurriculumModule =
    levelData.modules.find((m) => m.id === targetModuleId) || levelData.modules[0];

  // Persistent completion state per step
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({
    wuzu_guide: true,
  });

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const stepperScrollRef = React.useRef<ScrollView>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Auto-open initial step modal if requested
  useEffect(() => {
    if (route.params?.initialStepId) {
      const step = currentModule.subModules.find((s) => s.id === route.params.initialStepId);
      if (step) {
        if (step.actionType === 'navigate' && step.screenName) {
          navigation.navigate(step.screenName);
        } else {
          setActiveModal(step.modalType || step.id);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      }
    }
  }, [route.params?.initialStepId]);

  const bottomPad =
    Platform.OS === 'android' ? Math.max(insets.bottom, 12) + 90 : Math.max(insets.bottom, 8) + 80;

  const toggleLessonComplete = (id: string) => {
    setCompletedLessons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = currentModule.subModules.filter((s) => completedLessons[s.id]).length;
  const totalCount = currentModule.subModules.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllComplete = completedCount === totalCount && totalCount > 0;
  const totalSteps = currentModule.subModules.reduce((acc, sm) => acc + (sm.stepsCount || 0), 0);
  const nextIndex = currentModule.subModules.findIndex((s) => !completedLessons[s.id]);
  const nextSubModule = nextIndex !== -1 ? currentModule.subModules[nextIndex] : null;

  const formatStageNum = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  // Auto-scroll horizontal stepper to active milestone if module has 5+ stages
  useEffect(() => {
    if (totalCount > 4 && nextIndex > 1 && stepperScrollRef.current) {
      const timer = setTimeout(() => {
        stepperScrollRef.current?.scrollTo({
          x: Math.max(0, (nextIndex - 1) * 84),
          animated: true,
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [nextIndex, totalCount]);

  const handleStepPress = (item: SubModule) => {
    if (item.actionType === 'navigate' && item.screenName) {
      navigation.navigate(item.screenName);
    } else {
      setActiveModal(item.modalType || item.id);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setActiveModal(null));
  };

  const renderStepIcon = (item: SubModule, iconColor: string) => {
    if (item.iconFamily === 'mci') {
      return <MaterialCommunityIcons name={item.iconName as any} size={20} color={iconColor} />;
    } else if (item.iconFamily === 'fa5') {
      return <FontAwesome5 name={item.iconName as any} size={17} color={iconColor} />;
    } else if (item.iconFamily === 'feather') {
      return <Feather name={item.iconName as any} size={19} color={iconColor} />;
    }
    return <Ionicons name={item.iconName as any} size={20} color={iconColor} />;
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* ── Screen Header ── */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {currentModule.title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {completedCount} of {totalCount} Completed
          </Text>
        </View>

        <View style={[styles.levelTagPill, { backgroundColor: colors.gold + '16', borderColor: colors.gold + '35' }]}>
          <Text style={[styles.levelTagText, { color: colors.gold }]}>
            {activeLevel === 'starter' ? 'Level 1' : activeLevel === 'mastery' ? 'Level 2' : 'Level 3'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Creative & Clean Hero Module Overview ── */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <CardCornerDecoration color={colors.gold} size={30} offset={2} />

          {/* Module Track & Overall Status Row */}
          <View style={styles.heroTopRow}>
            <View style={[styles.moduleBadge, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '30' }]}>
              <Ionicons name="compass-outline" size={11} color={colors.primary} style={{ marginRight: 3 }} />
              <Text style={[styles.moduleBadgeText, { color: colors.primary }]}>
                {currentModule.badge?.toUpperCase() || 'CORE TRACK'}
              </Text>
            </View>

            {isAllComplete ? (
              <View style={[styles.overallStatusPill, { backgroundColor: '#10B98118', borderColor: '#10B98140' }]}>
                <Ionicons name="trophy" size={11} color="#10B981" />
                <Text style={[styles.overallStatusText, { color: '#10B981' }]}>100% MASTERED</Text>
              </View>
            ) : (
              <View style={[styles.overallStatusPill, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '35' }]}>
                <View style={[styles.pulsingDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.overallStatusText, { color: colors.primary }]}>
                  STAGE {formatStageNum(completedCount + 1)} OF {formatStageNum(totalCount)}
                </Text>
              </View>
            )}
          </View>

          {/* Title & Brief Subtitle */}
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{currentModule.title}</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>{currentModule.subtitle}</Text>

          {/* Clean 1-Line Meta Strip */}
          <View style={styles.heroMetaRow}>
            <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.heroMetaText, { color: colors.textSecondary }]}>{currentModule.duration}</Text>
            <View style={[styles.metaSepDot, { backgroundColor: colors.border }]} />
            <Ionicons name="layers-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.heroMetaText, { color: colors.textSecondary }]}>{totalCount} Stages</Text>
            <View style={[styles.metaSepDot, { backgroundColor: colors.border }]} />
            <Ionicons name="list-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.heroMetaText, { color: colors.textSecondary }]}>{totalSteps} Steps</Text>
          </View>

          {/* ── Sub-Modules Interactive Tracking Roadmap (Adaptive for 1 to 10+ stages) ── */}
          <View style={styles.milestonesContainer}>
            {totalCount > 4 ? (
              // ── Horizontal Scrollable Carousel Stepper for 5+ stages ──
              <View>
                <View style={styles.stepperHeaderInfo}>
                  <View style={styles.stepperHintRow}>
                    <Ionicons name="swap-horizontal" size={12} color={colors.primary} />
                    <Text style={[styles.stepperHintText, { color: colors.textSecondary }]}>
                      ROADMAP • {totalCount} STAGES (SWIPE)
                    </Text>
                  </View>
                  <Text style={[styles.stepperProgressText, { color: colors.textSecondary }]}>
                    {progressPercent}% Complete
                  </Text>
                </View>
                <ScrollView
                  ref={stepperScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalStepperContent}
                >
                  {currentModule.subModules.map((sm, idx) => {
                    const smDone = !!completedLessons[sm.id];
                    const smActive = !smDone && idx === nextIndex;
                    const isLast = idx === totalCount - 1;
                    const shortLabel = sm.title.split(' ')[0].replace(/[()]/g, '');

                    return (
                      <React.Fragment key={sm.id}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleStepPress(sm)}
                          style={styles.scrollMilestoneNodeCol}
                        >
                          <View
                            style={[
                              styles.milestoneNode,
                              {
                                backgroundColor: smDone
                                  ? '#10B981'
                                  : smActive
                                  ? colors.primary
                                  : isDarkMode
                                  ? '#1E293B'
                                  : '#FFFFFF',
                                borderColor: smDone
                                  ? '#10B981'
                                  : smActive
                                  ? colors.primary
                                  : colors.border,
                                borderWidth: smActive ? 2 : 1.5,
                              },
                            ]}
                          >
                            {smDone ? (
                              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                            ) : (
                              <Text
                                style={[
                                  styles.milestoneNodeText,
                                  { color: smActive ? '#FFFFFF' : colors.textSecondary },
                                ]}
                              >
                                {formatStageNum(idx + 1)}
                              </Text>
                            )}
                          </View>
                          <Text
                            style={[
                              styles.milestoneNodeLabel,
                              {
                                color: smActive
                                  ? colors.primary
                                  : smDone
                                  ? '#10B981'
                                  : colors.textSecondary,
                                fontWeight: smActive || smDone ? '700' : '600',
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {shortLabel}
                          </Text>
                          <Text style={[styles.milestoneSubLabel, { color: colors.textSecondary }]}>
                            {smDone ? 'Done' : sm.duration}
                          </Text>
                        </TouchableOpacity>

                        {!isLast && (
                          <View
                            style={[
                              styles.scrollSegmentLine,
                              {
                                backgroundColor: smDone
                                  ? '#10B981'
                                  : isDarkMode
                                  ? '#33415550'
                                  : '#E2E8F0',
                              },
                            ]}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </ScrollView>
              </View>
            ) : (
              // ── Adaptive Connected Flex Row for 1 to 4 stages ──
              <View style={styles.milestonesAdaptiveRow}>
                {currentModule.subModules.map((sm, idx) => {
                  const smDone = !!completedLessons[sm.id];
                  const smActive = !smDone && idx === nextIndex;
                  const isLast = idx === totalCount - 1;
                  const shortLabel = sm.title.split(' ')[0].replace(/[()]/g, '');

                  return (
                    <React.Fragment key={sm.id}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleStepPress(sm)}
                        style={styles.milestoneNodeCol}
                      >
                        <View
                          style={[
                            styles.milestoneNode,
                            {
                              backgroundColor: smDone
                                ? '#10B981'
                                : smActive
                                ? colors.primary
                                : isDarkMode
                                ? '#1E293B'
                                : '#FFFFFF',
                              borderColor: smDone
                                ? '#10B981'
                                : smActive
                                ? colors.primary
                                : colors.border,
                              borderWidth: smActive ? 2 : 1.5,
                            },
                          ]}
                        >
                          {smDone ? (
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                          ) : (
                            <Text
                              style={[
                                styles.milestoneNodeText,
                                { color: smActive ? '#FFFFFF' : colors.textSecondary },
                              ]}
                            >
                              {formatStageNum(idx + 1)}
                            </Text>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.milestoneNodeLabel,
                            {
                              color: smActive
                                ? colors.primary
                                : smDone
                                ? '#10B981'
                                : colors.textSecondary,
                              fontWeight: smActive || smDone ? '700' : '600',
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {shortLabel}
                        </Text>
                        <Text style={[styles.milestoneSubLabel, { color: colors.textSecondary }]}>
                          {smDone ? 'Done' : sm.duration}
                        </Text>
                      </TouchableOpacity>

                      {!isLast && (
                        <View
                          style={[
                            styles.milestoneSegmentLine,
                            {
                              backgroundColor: smDone
                                ? '#10B981'
                                : isDarkMode
                                ? '#33415550'
                                : '#E2E8F0',
                            },
                          ]}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* ── Sequential Sub-Modules Roadmap ── */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="layers-outline" size={15} color={colors.primary} />
            <Text style={[styles.sectionTitleHeader, { color: colors.textSecondary }]}>
              MODULE STAGES IN SEQUENCE
            </Text>
          </View>
          <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
            {completedCount} of {totalCount} completed
          </Text>
        </View>

        {/* ── Filter Pills when there are many sub-modules (5+ stages) ── */}
        {totalCount >= 5 && (
          <View style={styles.filterBar}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveFilter('all')}
              style={[
                styles.filterPill,
                activeFilter === 'all'
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: activeFilter === 'all' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                All ({totalCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveFilter('pending')}
              style={[
                styles.filterPill,
                activeFilter === 'pending'
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: activeFilter === 'pending' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                To Do ({totalCount - completedCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveFilter('completed')}
              style={[
                styles.filterPill,
                activeFilter === 'completed'
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: activeFilter === 'completed' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                Completed ({completedCount})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Medium-Sized Professional & Unique Stage Cards ── */}
        <View style={styles.stagesList}>
          {(() => {
            const displayedStages = currentModule.subModules.filter((item) => {
              if (activeFilter === 'pending') return !completedLessons[item.id];
              if (activeFilter === 'completed') return !!completedLessons[item.id];
              return true;
            });

            if (displayedStages.length === 0) {
              return (
                <View style={[styles.emptyFilterState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="sparkles-outline" size={24} color={colors.textSecondary} />
                  <Text style={[styles.emptyFilterText, { color: colors.textSecondary }]}>
                    {activeFilter === 'completed'
                      ? 'No stages completed yet. Start your first stage above!'
                      : 'All stages in this module are completed! Excellent progress!'}
                  </Text>
                </View>
              );
            }

            return displayedStages.map((item) => {
              const isDone = !!completedLessons[item.id];
              const isNext = !isDone && item.id === nextSubModule?.id;

            return (
              <View
                key={item.id}
                style={[
                  styles.stageCardWrapper,
                  {
                    backgroundColor: isNext
                      ? isDarkMode
                        ? '#17233B'
                        : '#F0F7FF'
                      : colors.surface,
                    borderColor: isNext
                      ? colors.primary + '60'
                      : isDone
                      ? isDarkMode
                        ? '#10B98125'
                        : '#10B98120'
                      : colors.border,
                    borderWidth: isNext ? 1.5 : 1,
                  },
                ]}
              >
                {/* Left Accent Stripe */}
                <View
                  style={[
                    styles.cardRibbon,
                    {
                      backgroundColor: isDone
                        ? '#10B981'
                        : isNext
                        ? colors.primary
                        : isDarkMode
                        ? '#334155'
                        : '#CBD5E1',
                    },
                  ]}
                />

                <View style={styles.cardContentContainer}>
                  {/* Clean Top Row: Stage Indicator & Checkbox Toggle */}
                  <View style={styles.stageTopRow}>
                    <View style={styles.stageNumberRow}>
                      <Text
                        style={[
                          styles.stageNumberLabel,
                          { color: isDone ? '#10B981' : isNext ? colors.primary : colors.textSecondary },
                        ]}
                      >
                        STAGE {formatStageNum(item.stepNumber)}
                      </Text>

                      {isNext && (
                        <View style={[styles.upNextTag, { backgroundColor: colors.primary + '18' }]}>
                          <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
                          <Text style={[styles.upNextTagText, { color: colors.primary }]}>UP NEXT</Text>
                        </View>
                      )}
                    </View>

                    {/* Interactive Completion Toggle Button */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleLessonComplete(item.id)}
                      style={[
                        styles.toggleCheckBtn,
                        {
                          backgroundColor: isDone
                            ? '#10B981'
                            : isDarkMode
                            ? 'rgba(255,255,255,0.04)'
                            : '#FFFFFF',
                          borderColor: isDone ? '#10B981' : isNext ? colors.primary + '50' : colors.border,
                        },
                      ]}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={isDone ? 'checkmark' : 'ellipse-outline'}
                        size={isDone ? 13 : 11}
                        color={isDone ? '#FFFFFF' : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Main Content Area: Spacious & Uncluttered */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => handleStepPress(item)}
                    style={styles.stageBodyRow}
                  >
                    {/* Squirclic Icon Box */}
                    <View
                      style={[
                        styles.stageIconBox,
                        {
                          backgroundColor: isDone
                            ? '#10B98114'
                            : isNext
                            ? colors.primary + '16'
                            : isDarkMode
                            ? 'rgba(255,255,255,0.04)'
                            : '#F1F5F9',
                          borderColor: isDone
                            ? '#10B98125'
                            : isNext
                            ? colors.primary + '35'
                            : colors.border,
                        },
                      ]}
                    >
                      {renderStepIcon(
                        item,
                        isDone ? '#10B981' : isNext ? colors.primary : colors.textSecondary
                      )}
                    </View>

                    {/* Stage Info */}
                    <View style={styles.stageTextGroup}>
                      <Text style={[styles.stageTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={[styles.stageSubtitle, { color: colors.textSecondary }]}>
                        {item.subtitle}
                      </Text>

                      {/* Bottom Meta & Action Row */}
                      <View style={styles.stageBottomRow}>
                        <View style={styles.stageMetaRow}>
                          <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
                          <Text style={[styles.stageMetaText, { color: colors.textSecondary }]}>
                            {item.duration}
                          </Text>
                          <View style={[styles.metaDot, { backgroundColor: colors.border }]} />
                          <Ionicons name="list-outline" size={11} color={colors.textSecondary} />
                          <Text style={[styles.stageMetaText, { color: colors.textSecondary }]}>
                            {item.stepsCount} Steps
                          </Text>
                        </View>

                        {/* Subtle Action Link */}
                        <View style={styles.stageActionRow}>
                          <Text
                            style={[
                              styles.actionLinkText,
                              {
                                color: isNext
                                  ? colors.primary
                                  : isDone
                                  ? isDarkMode
                                    ? '#34D399'
                                    : '#059669'
                                  : colors.textSecondary,
                              },
                            ]}
                          >
                            {item.actionType === 'navigate'
                              ? 'Open Guide'
                              : isDone
                              ? 'Review'
                              : 'Start'}
                          </Text>
                          <Ionicons
                            name="chevron-forward"
                            size={12}
                            color={
                              isNext
                                ? colors.primary
                                : isDone
                                ? isDarkMode
                                  ? '#34D399'
                                  : '#059669'
                                : colors.textSecondary
                            }
                          />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            );
          });
        })()}
      </View>
      </ScrollView>

      {/* ── Interactive Lesson Modal Viewer ── */}
      <Modal visible={activeModal !== null} transparent animationType="fade" onRequestClose={closeModal}>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Sheet Handle */}
            <View style={styles.handleContainer}>
              <View style={[styles.modalHandle, { backgroundColor: isDarkMode ? '#475569' : '#CBD5E1' }]} />
            </View>

            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  {activeModal === 'wuzu_guide'
                    ? 'Wuzu (Ablution) Complete Steps'
                    : activeModal === 'tayammum_guide'
                    ? 'Tayammum (Dry Purification)'
                    : activeModal === 'faraiz_guidelines'
                    ? 'Conditions & Pillars of Salah'
                    : activeModal === 'surahs_collection'
                    ? 'Essential Salah Surahs'
                    : activeModal === 'ghusl_guide'
                    ? 'Ghusl (Full Body Purification)'
                    : activeModal === 'invalidation_rules'
                    ? 'Mufsiddat (Salah Nullifiers)'
                    : activeModal === 'sajdah_sahw'
                    ? 'Sajdah-e-Sahw Method'
                    : 'Lesson Details'}
                </Text>
                <Text style={[styles.modalSubHeader, { color: colors.textSecondary }]}>
                  Step-by-step authentic Sunni/Hanafi guidelines
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeModal}
                style={[styles.closeBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* 1. Wuzu Steps */}
              {activeModal === 'wuzu_guide' && (
                <View style={styles.modalSection}>
                  {[
                    {
                      num: '1',
                      title: 'Niyyah & Bismillah',
                      desc: 'Make intention in the heart for Taharah (purification) and recite: "Bismillah-ir-Rahman-ir-Rahim".',
                    },
                    {
                      num: '2',
                      title: 'Wash Hands to Wrists (3 times)',
                      desc: 'Wash both hands up to the wrists thoroughly three times, making sure water passes between fingers (Khilal).',
                    },
                    {
                      num: '3',
                      title: 'Rinse Mouth & Nose (3 times)',
                      desc: 'Gargle water in the mouth three times (Madmadah), then sniff clean water into nostrils with right hand and blow out with left hand (Istinshaq).',
                    },
                    {
                      num: '4',
                      title: 'Wash Face & Arms to Elbows',
                      desc: 'Wash the entire face from hairline to below chin and earlobe to earlobe 3 times. Then wash right arm up to and including elbow 3 times, followed by left arm.',
                    },
                    {
                      num: '5',
                      title: 'Masah of Head & Wash Feet',
                      desc: 'Wipe wet hands over the entire head once (Farz), wipe inside ears with forefingers and back with thumbs. Wash both feet up to the ankles 3 times, starting with right foot.',
                    },
                  ].map((s) => (
                    <View key={s.num} style={styles.stepItem}>
                      <View style={[styles.stepNumberBox, { backgroundColor: colors.primary + '18' }]}>
                        <Text style={[styles.stepNumberText, { color: colors.primary }]}>{s.num}</Text>
                      </View>
                      <View style={styles.stepContentBox}>
                        <Text style={[styles.stepItemTitle, { color: colors.textPrimary }]}>{s.title}</Text>
                        <Text style={[styles.stepItemDesc, { color: colors.textSecondary }]}>{s.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* 2. Tayammum Steps */}
              {activeModal === 'tayammum_guide' && (
                <View style={styles.modalSection}>
                  <View style={[styles.infoBanner, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '25' }]}>
                    <Ionicons name="information-circle-outline" size={16} color={colors.primary} style={{ marginTop: 1 }} />
                    <Text style={[styles.infoBannerText, { color: colors.textPrimary }]}>
                      Permissible when clean water is inaccessible, within a distance of 1+ mile, or when using water causes severe illness or bodily harm.
                    </Text>
                  </View>
                  {[
                    {
                      num: '1',
                      title: 'Niyyah & First Strike',
                      desc: 'Form intention for purification to pray Salah. Strike clean earth, dust, clay or unpolished stone with both open hands, then shake off excess dust.',
                    },
                    {
                      num: '2',
                      title: 'Wipe the Entire Face',
                      desc: 'Pass both palms gently over the entire face from the top of the forehead to beneath the chin, ensuring no area is missed.',
                    },
                    {
                      num: '3',
                      title: 'Second Strike & Wipe Arms',
                      desc: 'Strike clean earth a second time. Wipe the back of the right hand and arm up to the elbow with the left palm, then wipe left arm with right palm.',
                    },
                  ].map((s) => (
                    <View key={s.num} style={styles.stepItem}>
                      <View style={[styles.stepNumberBox, { backgroundColor: colors.primary + '18' }]}>
                        <Text style={[styles.stepNumberText, { color: colors.primary }]}>{s.num}</Text>
                      </View>
                      <View style={styles.stepContentBox}>
                        <Text style={[styles.stepItemTitle, { color: colors.textPrimary }]}>{s.title}</Text>
                        <Text style={[styles.stepItemDesc, { color: colors.textSecondary }]}>{s.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* 3. Faraiz / Conditions */}
              {activeModal === 'faraiz_guidelines' && (
                <View style={styles.modalSection}>
                  <Text style={[styles.groupHeading, { color: colors.primary }]}>
                    6 External Conditions (Sharaait-e-Salah)
                  </Text>
                  <Text style={[styles.groupDesc, { color: colors.textSecondary }]}>
                    Must be fulfilled before commencing prayer:
                  </Text>
                  {[
                    '1. Taharah: Cleanliness of body, clothes, and place of prayer.',
                    '2. Satr-e-Awrah: Covering body parts (navel to below knee for men; entire body except face, hands, feet for women).',
                    '3. Istiqbal-e-Qibla: Facing the direction of the Holy Ka’bah.',
                    '4. Waqt: Performing Salah within its prescribed time window.',
                    '5. Niyyah: Intention in the heart for the specific prayer.',
                    '6. Takbeer-e-Tahrima: Uttering "Allahu Akbar" while initiating prayer.',
                  ].map((txt, i) => (
                    <Text key={i} style={[styles.bulletItem, { color: colors.textPrimary }]}>
                      • {txt}
                    </Text>
                  ))}

                  <Text style={[styles.groupHeading, { color: colors.primary, marginTop: 16 }]}>
                    6 Internal Pillars (Arkan-e-Salah)
                  </Text>
                  <Text style={[styles.groupDesc, { color: colors.textSecondary }]}>
                    Essential acts inside Salah; omitting any invalidates prayer:
                  </Text>
                  {[
                    '1. Qiyam: Standing upright (unless physically incapable).',
                    '2. Qira’at: Recitation of Holy Quran (at least 3 verses or 1 short Surah).',
                    '3. Ruku: Bowing until hands rest on knees with straight back.',
                    '4. Sujood: Two prostrations with forehead and nose firmly on ground.',
                    '5. Qa’da Akheira: Final sitting long enough to recite complete Tashahhud.',
                    '6. Khurooj-bi-Sun’ihi: Concluding prayer consciously with Tasleem (Salam).',
                  ].map((txt, i) => (
                    <Text key={i} style={[styles.bulletItem, { color: colors.textPrimary }]}>
                      • {txt}
                    </Text>
                  ))}
                </View>
              )}

              {/* 4. Surahs Collection */}
              {activeModal === 'surahs_collection' && (
                <View style={styles.modalSection}>
                  <View style={[styles.verseBox, { borderColor: colors.border, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
                    <Text style={[styles.verseTitle, { color: colors.primary }]}>Surah Al-Fatiha (The Opening)</Text>
                    <Text style={[styles.arabicText, { color: colors.textPrimary }]}>
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ
                    </Text>
                    <Text style={[styles.translitText, { color: colors.textSecondary }]}>
                      Alhamdu lillahi rabbil 'alameen. Ar-Rahmanir-Raheem. Maliki yawmid-deen...
                    </Text>
                  </View>

                  <View style={[styles.verseBox, { borderColor: colors.border, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC', marginTop: 12 }]}>
                    <Text style={[styles.verseTitle, { color: colors.primary }]}>Surah Al-Ikhlas (Sincerity)</Text>
                    <Text style={[styles.arabicText, { color: colors.textPrimary }]}>
                      قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ
                    </Text>
                    <Text style={[styles.translitText, { color: colors.textSecondary }]}>
                      Qul huwa Allahu ahad. Allahus-samad. Lam yalid wa lam yoolad...
                    </Text>
                  </View>

                  <View style={[styles.verseBox, { borderColor: colors.border, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC', marginTop: 12 }]}>
                    <Text style={[styles.verseTitle, { color: colors.primary }]}>Attahiyyat (Tashahhud)</Text>
                    <Text style={[styles.arabicText, { color: colors.textPrimary }]}>
                      التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلاَمُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ
                    </Text>
                  </View>
                </View>
              )}

              {/* 5. Ghusl Guide */}
              {activeModal === 'ghusl_guide' && (
                <View style={styles.modalSection}>
                  <Text style={[styles.groupHeading, { color: colors.primary }]}>3 Obligatory Acts (Farz) of Ghusl</Text>
                  {[
                    '1. Gargling the mouth thoroughly once (reaching the back of the throat).',
                    '2. Sniffing water into the nostrils up to the soft bone.',
                    '3. Washing the entire body thoroughly without leaving a single hair’s breadth dry.',
                  ].map((txt, i) => (
                    <Text key={i} style={[styles.bulletItem, { color: colors.textPrimary }]}>
                      • {txt}
                    </Text>
                  ))}
                </View>
              )}

              {/* 6. Mufsiddat (Nullifiers) */}
              {activeModal === 'invalidation_rules' && (
                <View style={styles.modalSection}>
                  <View style={[styles.infoBanner, { backgroundColor: colors.error + '12', borderColor: colors.error + '25' }]}>
                    <Ionicons name="warning-outline" size={16} color={colors.error} style={{ marginTop: 1 }} />
                    <Text style={[styles.infoBannerText, { color: colors.error }]}>
                      Major Salah Invalidation Causes (Acts that break prayer):
                    </Text>
                  </View>
                  {[
                    '• Speaking words of human conversation intentionally, mistakenly, or forgetfully.',
                    '• Eating or drinking during prayer, even as small as a sesame seed.',
                    '• Turning the chest away from the Qibla without an excuse.',
                    '• Laughing aloud (Qahqaha) so that nearby people could hear (also breaks Wuzu).',
                    '• Making excessive movement (Amal-e-Katheer) that makes an observer believe you are not praying.',
                    '• Uncovering Awrah for the duration of one complete pillar (Rukn).',
                  ].map((txt, i) => (
                    <Text key={i} style={[styles.bulletItem, { color: colors.textPrimary }]}>
                      {txt}
                    </Text>
                  ))}
                </View>
              )}

              {/* 7. Sajdah-e-Sahw */}
              {activeModal === 'sajdah_sahw' && (
                <View style={styles.modalSection}>
                  <Text style={[styles.groupHeading, { color: colors.primary }]}>Method of Sajdah-e-Sahw</Text>
                  <Text style={[styles.stepItemDesc, { color: colors.textSecondary }]}>
                    When an obligatory (Wajib) act is delayed or omitted unintentionally:
                  </Text>
                  {[
                    '1. In the final sitting (Qa’da Akheira), recite Tashahhud (Attahiyyat) completely.',
                    '2. Make one Salam to the right side only.',
                    '3. Perform two regular Sujood, reciting "Subhana Rabbiyal A\'la" three times in each.',
                    '4. Sit back up and recite Tashahhud, Durood Ibrahim, and Dua Masoora.',
                    '5. Make both Salams (right and left) to conclude prayer peacefully.',
                  ].map((txt, i) => (
                    <Text key={i} style={[styles.bulletItem, { color: colors.textPrimary }]}>
                      {txt}
                    </Text>
                  ))}
                </View>
              )}

              {/* 8. Default generic modal */}
              {activeModal !== 'wuzu_guide' &&
                activeModal !== 'tayammum_guide' &&
                activeModal !== 'faraiz_guidelines' &&
                activeModal !== 'surahs_collection' &&
                activeModal !== 'ghusl_guide' &&
                activeModal !== 'invalidation_rules' &&
                activeModal !== 'sajdah_sahw' && (
                  <View style={styles.modalSection}>
                    <View style={[styles.infoBanner, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '25' }]}>
                      <Ionicons name="information-circle-outline" size={16} color={colors.primary} style={{ marginTop: 1 }} />
                      <Text style={[styles.infoBannerText, { color: colors.textPrimary }]}>
                        Detailed authentic step-by-step guidance for this stage.
                      </Text>
                    </View>
                    <Text style={[styles.stepItemDesc, { color: colors.textSecondary, marginTop: 10 }]}>
                      Follow this step thoroughly according to the Sunnah before proceeding to subsequent stages.
                    </Text>
                  </View>
                )}
            </ScrollView>

            {/* Bottom Modal CTA */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                const sub = currentModule.subModules.find((s) => (s.modalType || s.id) === activeModal);
                if (sub) toggleLessonComplete(sub.id);
                closeModal();
              }}
              style={[styles.modalCompleteBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
              <Text style={styles.modalCompleteBtnText}>Mark This Stage as Completed</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    marginTop: 1,
    fontWeight: '500',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4.5,
    borderRadius: 7,
    borderWidth: 1,
  },
  headerDoneText: {
    color: '#10B981',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  levelTagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  levelTagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },

  // ── Executive Hero Card ──
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 6,
    marginBottom: 8,
  },
  heroBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  moduleBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroLevelTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  heroLevelTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  overallStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
    borderWidth: 1,
  },
  overallStatusText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroTitle: {
    fontSize: 18.5,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 3,
    zIndex: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    lineHeight: 16.5,
    zIndex: 6,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    zIndex: 6,
  },
  heroMetaText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaSepDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },

  // ── Milestones Tracker (Adaptive for 1, 3, or 7+ Stages) ──
  milestonesContainer: {
    marginTop: 14,
    position: 'relative',
    zIndex: 6,
  },
  milestonesAdaptiveRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  milestoneNodeCol: {
    alignItems: 'center',
    gap: 3,
    minWidth: 58,
    maxWidth: 78,
  },
  milestoneSegmentLine: {
    flex: 1,
    height: 2,
    marginTop: 12,
    marginHorizontal: 4,
    borderRadius: 1,
  },
  // Scrollable Horizontal Carousel for 5+ items
  stepperHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  stepperHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepperHintText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  stepperProgressText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  horizontalStepperContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  scrollMilestoneNodeCol: {
    alignItems: 'center',
    gap: 3,
    width: 66,
  },
  scrollSegmentLine: {
    width: 20,
    height: 2,
    marginTop: 12,
    borderRadius: 1,
  },
  milestoneNode: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneNodeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  milestoneNodeLabel: {
    fontSize: 11,
    letterSpacing: -0.1,
    marginTop: 2,
  },
  milestoneSubLabel: {
    fontSize: 9.5,
    fontWeight: '500',
  },

  // ── Multi-Module Filter Bar (for 5+ stages) ──
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  filterPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyFilterState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 4,
  },
  emptyFilterText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── Section Header ──
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  sectionTitleHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  sectionHint: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Medium-Sized Stage Cards ──
  stagesList: {
    gap: 10,
  },
  stageCardWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  cardRibbon: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    zIndex: 3,
  },
  cardContentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingLeft: 13,
  },
  stageTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stageNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stageNumberLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  upNextTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  upNextTagText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  toggleCheckBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Stage Body Row ──
  stageBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stageIconBox: {
    width: 42,
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageTextGroup: {
    flex: 1,
  },
  stageTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  stageSubtitle: {
    fontSize: 11,
    lineHeight: 14.5,
    marginTop: 1,
  },
  stageBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stageMetaText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 3,
  },
  stageActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionLinkText: {
    fontSize: 11,
    fontWeight: '700',
  },

  celebrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  celebrationIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D4AF3718',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
  },
  celebrationTitle: {
    fontSize: 15,
    fontWeight: '800',
    zIndex: 6,
  },
  celebrationSub: {
    fontSize: 12,
    marginTop: 1,
    zIndex: 6,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '85%',
    padding: 20,
    paddingBottom: 34,
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: '800',
  },
  modalSubHeader: {
    fontSize: 11.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    marginTop: 4,
  },
  modalSection: {
    gap: 12,
    paddingBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  stepNumberBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  stepContentBox: {
    flex: 1,
  },
  stepItemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  stepItemDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 11,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 4,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16.5,
    fontWeight: '500',
  },
  groupHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  groupDesc: {
    fontSize: 11.5,
    marginBottom: 6,
  },
  bulletItem: {
    fontSize: 12,
    lineHeight: 17.5,
    marginBottom: 4,
  },
  verseBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  verseTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  arabicText: {
    fontSize: 18,
    lineHeight: 30,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Damascus' : 'serif',
  },
  translitText: {
    fontSize: 11.5,
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 16,
  },
  modalCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 12,
  },
  modalCompleteBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
