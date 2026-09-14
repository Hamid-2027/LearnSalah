import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

type CurriculumLevel = 'starter' | 'mastery' | 'explorer';

interface LearnLesson {
  id: string;
  level: CurriculumLevel;
  titleEn: string;
  titleUr: string;
  subtitleEn: string;
  iconName: string;
  iconFamily: 'mci' | 'ion' | 'fa5';
  difficulty: 'Essential' | 'Pro' | 'Advanced';
  duration: string;
  gradientColors: [string, string];
  actionType: 'navigate' | 'modal';
  screenName?: string;
}

export const LearnScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isDarkMode, colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [activeLevel, setActiveLevel] = useState<CurriculumLevel>('starter');
  const [unlockedLevels, setUnlockedLevels] = useState<Record<CurriculumLevel, boolean>>({
    starter: true,
    mastery: false,
    explorer: false,
  });

  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({
    wuzu_guide: true,
  });

  const [activeModal, setActiveModal] = useState<string | null>(null);

  const bottomPad = Platform.OS === 'android' ? Math.max(insets.bottom, 12) + 90 : Math.max(insets.bottom, 8) + 80;

  // Starter Lessons (Level 1)
  const starterLessons: LearnLesson[] = [
    {
      id: 'namaz_guide',
      level: 'starter',
      titleEn: 'Step-by-Step Namaz',
      titleUr: 'طریقۂ نماز (مقدمات)',
      subtitleEn: 'Complete guided audio & visual prayer postures',
      iconName: 'mosque',
      iconFamily: 'mci',
      difficulty: 'Essential',
      duration: '7 mins • Audio',
      gradientColors: [colors.primary, '#1D4ED8'],
      actionType: 'navigate',
      screenName: 'PrayerGuide',
    },
    {
      id: 'wuzu_guide',
      level: 'starter',
      titleEn: 'Wuzu (Ablution)',
      titleUr: 'وضو کا مسنون طریقہ',
      subtitleEn: 'Purification steps before standing for prayer',
      iconName: 'water-outline',
      iconFamily: 'ion',
      difficulty: 'Essential',
      duration: '4 mins • Visual',
      gradientColors: ['#0EA5E9', '#0284C7'],
      actionType: 'modal',
    },
    {
      id: 'tayammum_guide',
      level: 'starter',
      titleEn: 'Tayammum (Dry Ablution)',
      titleUr: 'تیمم کا طریقہ',
      subtitleEn: 'Purification when water is unavailable',
      iconName: 'hand-sparkles-outline',
      iconFamily: 'mci',
      difficulty: 'Essential',
      duration: '3 mins • Guide',
      gradientColors: ['#D97706', '#B45309'],
      actionType: 'modal',
    },
  ];

  // Mastery Lessons (Level 2)
  const masteryLessons: LearnLesson[] = [
    {
      id: 'faraiz_guidelines',
      level: 'mastery',
      titleEn: 'Faraiz & Conditions',
      titleUr: 'فرائضِ نماز و شرائط',
      subtitleEn: '6 Sharaait & 6 Arkan obligatory prayer rules',
      iconName: 'book-check-outline',
      iconFamily: 'mci',
      difficulty: 'Pro',
      duration: '5 mins • Rules',
      gradientColors: ['#8B5CF6', '#6D28D9'],
      actionType: 'modal',
    },
    {
      id: 'surahs_collection',
      level: 'mastery',
      titleEn: 'Surahs for Namaz',
      titleUr: 'نماز کی سورتیں',
      subtitleEn: 'Short Quranic Surahs with Arabic & transliteration',
      iconName: 'book-open-page-variant-outline',
      iconFamily: 'mci',
      difficulty: 'Pro',
      duration: '6 mins • Audio',
      gradientColors: [colors.gold, '#B48A1E'],
      actionType: 'modal',
    },
    {
      id: 'invalidation_rules',
      level: 'mastery',
      titleEn: 'Mufsiddat (Invalidators)',
      titleUr: 'مفسداتِ نماز',
      subtitleEn: 'Actions that nullify Salah requiring repeat',
      iconName: 'alert-circle-outline',
      iconFamily: 'ion',
      difficulty: 'Pro',
      duration: '4 mins • Guide',
      gradientColors: ['#EF4444', '#DC2626'],
      actionType: 'modal',
    },
  ];

  // Explorer Lessons (Level 3)
  const explorerLessons: LearnLesson[] = [
    {
      id: 'sects_madhabs',
      level: 'explorer',
      titleEn: 'Sects & Madhab Nuances',
      titleUr: 'مذاہب اور فقیہ فرق',
      subtitleEn: 'Hanafi, Shafi\'i, and Ja\'fari posture variations',
      iconName: 'git-branch-outline',
      iconFamily: 'ion',
      difficulty: 'Advanced',
      duration: '8 mins • Variations',
      gradientColors: ['#10B981', '#059669'],
      actionType: 'modal',
    },
    {
      id: 'daily_duas',
      level: 'explorer',
      titleEn: 'Masnoon Duas',
      titleUr: 'مسنون دعائیں',
      subtitleEn: 'Supplications for morning, evening & after prayer',
      iconName: 'hands-pray',
      iconFamily: 'fa5',
      difficulty: 'Advanced',
      duration: '5 mins • Duas',
      gradientColors: ['#F59E0B', '#D97706'],
      actionType: 'modal',
    },
  ];

  const allLessons = [...starterLessons, ...masteryLessons, ...explorerLessons];
  const totalLessonsCount = allLessons.length;
  const completedCount = Object.values(completedLessons).filter(Boolean).length;
  const overallProgressPercent = Math.round((completedCount / totalLessonsCount) * 100);

  const currentLessons =
    activeLevel === 'starter'
      ? starterLessons
      : activeLevel === 'mastery'
      ? masteryLessons
      : explorerLessons;

  const isCurrentLevelUnlocked = unlockedLevels[activeLevel];

  const unlockLevel = (lvl: CurriculumLevel) => {
    setUnlockedLevels((prev) => ({ ...prev, [lvl]: true }));
  };

  const toggleLessonComplete = (id: string) => {
    setCompletedLessons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLessonPress = (item: LearnLesson) => {
    if (!isCurrentLevelUnlocked) return;
    if (item.actionType === 'navigate' && item.screenName) {
      navigation.navigate(item.screenName);
    } else {
      setActiveModal(item.id);
    }
  };

  const renderLessonIcon = (item: LearnLesson) => {
    if (item.iconFamily === 'mci') {
      return <MaterialCommunityIcons name={item.iconName as any} size={24} color="#FFFFFF" />;
    } else if (item.iconFamily === 'fa5') {
      return <FontAwesome5 name={item.iconName as any} size={20} color="#FFFFFF" />;
    }
    return <Ionicons name={item.iconName as any} size={24} color="#FFFFFF" />;
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.topBarLeft}>
          <MaterialCommunityIcons name="school" size={26} color={colors.primary} style={{ marginRight: 8 }} />
          <View>
            <Text style={[styles.topBarTitle, { color: colors.textPrimary }]}>Learn Namaz Academy</Text>
            <Text style={[styles.topBarSubtitle, { color: colors.textSecondary }]}>Structured Islamic Curriculum</Text>
          </View>
        </View>

        <View style={[styles.tierBadge, { backgroundColor: colors.surfaceSecondary, borderColor: colors.primary }]}>
          <Ionicons name="ribbon-outline" size={13} color={colors.primary} style={{ marginRight: 4 }} />
          <Text style={[styles.tierBadgeText, { color: colors.primary }]}>
            {activeLevel.toUpperCase()} ✦
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Curriculum Progress Header Card */}
        <LinearGradient
          colors={
            isDarkMode
              ? ['#1E3A8A', '#1D4ED8', '#2563EB']
              : ['#1E40AF', '#1D4ED8', '#3B82F6']
          }
          style={styles.heroProgressCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroRowTop}>
            <View style={styles.heroRankPill}>
              <Ionicons name="trophy" size={12} color="#F59E0B" style={{ marginRight: 4 }} />
              <Text style={styles.heroRankText}>
                {completedCount >= 5 ? 'PRO SCHOLAR' : completedCount >= 2 ? 'INTERMEDIATE' : 'STARTER LEARNER'}
              </Text>
            </View>
            <Text style={styles.heroPercentText}>{overallProgressPercent}% Complete</Text>
          </View>

          <Text style={styles.heroTitle}>Your Learning Journey</Text>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${Math.max(overallProgressPercent, 5)}%` }]} />
          </View>

          <View style={styles.heroFooterRow}>
            <Text style={styles.heroLessonsCount}>{completedCount} of {totalLessonsCount} Lessons Mastered</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation?.navigate?.('PrayerGuide')}
              style={styles.resumeBtn}
            >
              <Text style={styles.resumeBtnText}>Resume Lesson</Text>
              <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Level Switcher Segmented Bar */}
        <View style={[styles.levelSelectorContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Level 1: Starter */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveLevel('starter')}
            style={[
              styles.levelPill,
              activeLevel === 'starter' && [styles.levelPillActive, { backgroundColor: colors.primary }],
            ]}
          >
            <Text
              style={[
                styles.levelPillText,
                { color: activeLevel === 'starter' ? '#FFFFFF' : colors.textSecondary },
                activeLevel === 'starter' && styles.levelPillTextActive,
              ]}
            >
              1. Starter
            </Text>
          </TouchableOpacity>

          {/* Level 2: Mastery */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveLevel('mastery')}
            style={[
              styles.levelPill,
              activeLevel === 'mastery' && [styles.levelPillActive, { backgroundColor: colors.primary }],
            ]}
          >
            {!unlockedLevels.mastery && (
              <Ionicons name="lock-closed" size={12} color={activeLevel === 'mastery' ? '#FFFFFF' : colors.textSecondary} style={{ marginRight: 4 }} />
            )}
            <Text
              style={[
                styles.levelPillText,
                { color: activeLevel === 'mastery' ? '#FFFFFF' : colors.textSecondary },
                activeLevel === 'mastery' && styles.levelPillTextActive,
              ]}
            >
              2. Mastery
            </Text>
          </TouchableOpacity>

          {/* Level 3: Explorer */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveLevel('explorer')}
            style={[
              styles.levelPill,
              activeLevel === 'explorer' && [styles.levelPillActive, { backgroundColor: colors.primary }],
            ]}
          >
            {!unlockedLevels.explorer && (
              <Ionicons name="lock-closed" size={12} color={activeLevel === 'explorer' ? '#FFFFFF' : colors.textSecondary} style={{ marginRight: 4 }} />
            )}
            <Text
              style={[
                styles.levelPillText,
                { color: activeLevel === 'explorer' ? '#FFFFFF' : colors.textSecondary },
                activeLevel === 'explorer' && styles.levelPillTextActive,
              ]}
            >
              3. Explorer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Level Locked Banner */}
        {!isCurrentLevelUnlocked && (
          <View style={[styles.lockedCard, { backgroundColor: colors.surface, borderColor: colors.gold }]}>
            <View style={styles.lockedHeaderRow}>
              <View style={[styles.lockIconCircle, { backgroundColor: colors.gold + '22' }]}>
                <Ionicons name="lock-closed" size={24} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lockedTitle, { color: colors.textPrimary }]}>
                  {activeLevel === 'mastery' ? 'Level 2: Mastery is Locked' : 'Level 3: Explorer is Locked'}
                </Text>
                <Text style={[styles.lockedSub, { color: colors.textSecondary }]}>
                  Complete prerequisite lessons in earlier levels or tap below to unlock instantly.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => unlockLevel(activeLevel)}
              style={[styles.unlockNowBtn, { backgroundColor: colors.gold }]}
            >
              <Ionicons name="key-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.unlockNowText}>Unlock Tier Now ✦</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lessons List Grid */}
        <View style={[styles.lessonsGrid, !isCurrentLevelUnlocked && { opacity: 0.45 }]}>
          {currentLessons.map((item) => {
            const isDone = completedLessons[item.id];
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                disabled={!isCurrentLevelUnlocked}
                onPress={() => handleLessonPress(item)}
                style={[
                  styles.lessonCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                {/* Top Badge & Mark Toggle Row */}
                <View style={styles.cardTopRow}>
                  <View style={[styles.diffBadge, { backgroundColor: item.gradientColors[0] + '1A' }]}>
                    <Text style={[styles.diffBadgeText, { color: item.gradientColors[0] }]}>
                      {item.difficulty.toUpperCase()}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleLessonComplete(item.id)}
                    style={[
                      styles.completeCheckBtn,
                      isDone
                        ? { backgroundColor: '#10B981', borderColor: '#10B981' }
                        : { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                    ]}
                  >
                    <Ionicons
                      name={isDone ? 'checkmark-circle' : 'checkmark-circle-outline'}
                      size={14}
                      color={isDone ? '#FFFFFF' : colors.textSecondary}
                    />
                    <Text style={[styles.completeCheckText, { color: isDone ? '#FFFFFF' : colors.textSecondary }]}>
                      {isDone ? 'Done' : 'Mark'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Icon & Title Row */}
                <View style={styles.cardMainRow}>
                  <LinearGradient
                    colors={item.gradientColors}
                    style={styles.gradientIconCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {renderLessonIcon(item)}
                  </LinearGradient>

                  <View style={styles.cardTextContent}>
                    <Text style={[styles.lessonTitleEn, { color: colors.textPrimary }]}>{item.titleEn}</Text>
                    <Text style={[styles.lessonTitleUr, { color: colors.primary }]}>{item.titleUr}</Text>
                    <Text style={[styles.lessonSub, { color: colors.textSecondary }]} numberOfLines={2}>
                      {item.subtitleEn}
                    </Text>
                  </View>
                </View>

                {/* Footer Action Row */}
                <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                  <View style={styles.durationRow}>
                    <Ionicons name="time-outline" size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.durationText, { color: colors.textSecondary }]}>{item.duration}</Text>
                  </View>

                  <View style={[styles.startPill, { backgroundColor: item.gradientColors[0] + '14' }]}>
                    <Text style={[styles.startText, { color: item.gradientColors[0] }]}>
                      {item.actionType === 'navigate' ? 'Start Audio' : 'Open Guide'}
                    </Text>
                    <Ionicons name="chevron-forward" size={13} color={item.gradientColors[0]} style={{ marginLeft: 2 }} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explore Wisdom Section */}
        <View style={[styles.wisdomCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.wisdomHeader}>
            <MaterialCommunityIcons name="compass-rose" size={24} color={colors.gold} style={{ marginRight: 8 }} />
            <Text style={[styles.wisdomTitle, { color: colors.textPrimary }]}>Madhabs & Fiqh Wisdom</Text>
          </View>
          <Text style={[styles.wisdomSub, { color: colors.textSecondary }]}>
            Comparative breakdown of postures according to Hanafi, Shafi'i, and Ja'fari jurisprudence.
          </Text>

          <View style={styles.wisdomPillsRow}>
            <View style={[styles.wisdomPill, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <Text style={[styles.wisdomPillText, { color: colors.textPrimary }]}>{"🕌 Hanafi & Shafi'i Rules"}</Text>
            </View>
            <View style={[styles.wisdomPill, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <Text style={[styles.wisdomPillText, { color: colors.textPrimary }]}>{"🤲 Ja'fari Guidelines"}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Lesson Content Reader Modal */}
      <Modal
        visible={activeModal !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {activeModal === 'wuzu_guide'
                  ? 'Wuzu (Ablution) Steps'
                  : activeModal === 'tayammum_guide'
                  ? 'Tayammum Guidelines'
                  : activeModal === 'faraiz_guidelines'
                  ? 'Faraiz & Conditions'
                  : activeModal === 'surahs_collection'
                  ? 'Surahs for Recitation'
                  : activeModal === 'invalidation_rules'
                  ? 'Mufsiddat (Invalidators)'
                  : activeModal === 'sects_madhabs'
                  ? 'Sects & Madhab Nuances'
                  : 'Masnoon Duas'}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380, padding: 16 }}>
              {activeModal === 'wuzu_guide' && (
                <View style={styles.modalBodyText}>
                  <Text style={[styles.stepTitle, { color: colors.primary }]}>1. Niyyah (Intention) & Bismillah</Text>
                  <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Make intention for purification and recite Bismillah-ir-Rahman-ir-Rahim.</Text>

                  <Text style={[styles.stepTitle, { color: colors.primary, marginTop: 12 }]}>2. Wash Hands to Wrists</Text>
                  <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Wash both hands up to the wrists three times thoroughly.</Text>

                  <Text style={[styles.stepTitle, { color: colors.primary, marginTop: 12 }]}>3. Rinse Mouth & Nose</Text>
                  <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Rinse mouth three times and sniff water into nostrils, then blow out.</Text>

                  <Text style={[styles.stepTitle, { color: colors.primary, marginTop: 12 }]}>4. Wash Face & Arms</Text>
                  <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Wash entire face three times, then wash arms up to elbows starting with right arm.</Text>

                  <Text style={[styles.stepTitle, { color: colors.primary, marginTop: 12 }]}>5. Masah & Feet</Text>
                  <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Wipe wet hands over head and ears, then wash both feet to ankles starting with right foot.</Text>
                </View>
              )}

              {activeModal === 'tayammum_guide' && (
                <View style={styles.modalBodyText}>
                  <Text style={[styles.stepTitle, { color: colors.primary }]}>When to perform Tayammum:</Text>
                  <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>When clean water is not available or its use causes health illness/harm.</Text>

                  <Text style={[styles.stepTitle, { color: colors.primary, marginTop: 12 }]}>Step 1: Intention & Strike Earth</Text>
                  <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Make Niyyah and strike both hands on clean earth/dust or stone.</Text>

                  <Text style={[styles.stepTitle, { color: colors.primary, marginTop: 12 }]}>Step 2: Wipe Face</Text>
                  <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Wipe the palms over the entire face once.</Text>

                  <Text style={[styles.stepTitle, { color: colors.primary, marginTop: 12 }]}>Step 3: Wipe Arms</Text>
                  <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Strike hands again and wipe right arm up to elbow, then left arm.</Text>
                </View>
              )}

              {activeModal === 'faraiz_guidelines' && (
                <View style={styles.modalBodyText}>
                  <Text style={[styles.stepTitle, { color: colors.primary }]}>6 External Conditions (Sharaait):</Text>
                  <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>1. Taharah (Purity) 2. Covering Awrah 3. Time of prayer 4. Facing Qibla 5. Intention 6. Takbeer-e-Tahrima.</Text>

                  <Text style={[styles.stepTitle, { color: colors.primary, marginTop: 12 }]}>6 Internal Obligatory Acts (Arkan):</Text>
                  <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>1. Qiyam (Standing) 2. Qira'at (Recitation) 3. Ruku (Bowing) 4. Sujood (Prostrations) 5. Qa'da Akheira 6. Salam.</Text>
                </View>
              )}

              {activeModal === 'surahs_collection' && (
                <View style={styles.modalBodyText}>
                  <Text style={[styles.stepTitle, { color: colors.primary }]}>Surah Al-Fatiha (The Opening)</Text>
                  <Text style={[styles.arabicVerse, { color: colors.textPrimary }]}>الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ</Text>

                  <Text style={[styles.stepTitle, { color: colors.primary, marginTop: 12 }]}>Surah Al-Ikhlas (Sincerity)</Text>
                  <Text style={[styles.arabicVerse, { color: colors.textPrimary }]}>قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ</Text>

                  <Text style={[styles.stepTitle, { color: colors.primary, marginTop: 12 }]}>Surah An-Nas (Mankind)</Text>
                  <Text style={[styles.arabicVerse, { color: colors.textPrimary }]}>قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ</Text>
                </View>
              )}

              {activeModal !== 'wuzu_guide' &&
                activeModal !== 'tayammum_guide' &&
                activeModal !== 'faraiz_guidelines' &&
                activeModal !== 'surahs_collection' && (
                  <View style={styles.modalBodyText}>
                    <Text style={[styles.stepTitle, { color: colors.primary }]}>Guidelines & Variations</Text>
                    <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                      Detailed rules and audio recitations are available in the step-by-step Namaz player.
                    </Text>
                  </View>
                )}
            </ScrollView>

            <TouchableOpacity
              onPress={() => {
                if (activeModal) toggleLessonComplete(activeModal);
                setActiveModal(null);
              }}
              style={[styles.modalOkBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.modalOkText}>Mark Completed & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  topBarSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },

  // Hero Progress Card
  heroProgressCard: {
    borderRadius: 20,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  heroRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroRankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  heroRankText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  heroPercentText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  heroFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLessonsCount: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // Level Selector
  levelSelectorContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 3,
    gap: 4,
  },
  levelPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 11,
  },
  levelPillActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  levelPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  levelPillTextActive: {
    fontWeight: '800',
  },

  // Locked Card
  lockedCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    gap: 12,
  },
  lockedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lockIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  lockedSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  unlockNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  unlockNowText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // Lessons Grid
  lessonsGrid: {
    gap: 14,
  },
  lessonCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  diffBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  completeCheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  completeCheckText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  gradientIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardTextContent: {
    flex: 1,
  },
  lessonTitleEn: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  lessonTitleUr: {
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 2,
  },
  lessonSub: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  startPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  startText: {
    fontSize: 11.5,
    fontWeight: '800',
  },

  // Wisdom Section
  wisdomCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  wisdomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  wisdomTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  wisdomSub: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  wisdomPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wisdomPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  wisdomPillText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  modalBodyText: {
    gap: 4,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  stepDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  arabicVerse: {
    fontSize: 18,
    writingDirection: 'rtl',
    textAlign: 'right',
    marginTop: 4,
  },
  modalOkBtn: {
    margin: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalOkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
