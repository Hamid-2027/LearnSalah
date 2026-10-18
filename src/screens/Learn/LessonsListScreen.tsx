import React, { useState } from 'react';
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
} from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../store/hooks';

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
  stepsCount?: number;
  completedSteps?: number;
}

export const LessonsListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isDarkMode, colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({
    wuzu_guide: true,
  });

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const activeLevel = route.params?.level || 'starter';
  const bottomPad = Platform.OS === 'android' ? Math.max(insets.bottom, 12) + 90 : Math.max(insets.bottom, 8) + 80;

  // Starter Lessons (Level 1)
  const starterLessons: LearnLesson[] = [
    {
      id: 'wuzu_guide',
      level: 'starter',
      titleEn: 'Wuzu (Ablution)',
      titleUr: 'وضو کا مسنون طریقہ',
      subtitleEn: 'Purification steps before standing for prayer',
      iconName: 'water',
      iconFamily: 'ion',
      difficulty: 'Essential',
      duration: '4 mins • Visual',
      gradientColors: ['#0EA5E9', '#0284C7'],
      actionType: 'modal',
      stepsCount: 5,
      completedSteps: 5,
    },
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
      stepsCount: 12,
      completedSteps: 5,
    },
    {
      id: 'tayammum_guide',
      level: 'starter',
      titleEn: 'Tayammum (Dry Ablution)',
      titleUr: 'تیمم کا طریقہ',
      subtitleEn: 'Purification when water is unavailable',
      iconName: 'hand-sparkles',
      iconFamily: 'mci',
      difficulty: 'Essential',
      duration: '3 mins • Guide',
      gradientColors: ['#D97706', '#B45309'],
      actionType: 'modal',
      stepsCount: 3,
      completedSteps: 0,
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
      iconName: 'book-check',
      iconFamily: 'mci',
      difficulty: 'Pro',
      duration: '5 mins • Rules',
      gradientColors: ['#8B5CF6', '#6D28D9'],
      actionType: 'modal',
      stepsCount: 12,
      completedSteps: 0,
    },
    {
      id: 'surahs_collection',
      level: 'mastery',
      titleEn: 'Surahs for Namaz',
      titleUr: 'نماز کی سورتیں',
      subtitleEn: 'Short Quranic Surahs with Arabic & transliteration',
      iconName: 'book-open-page-variant',
      iconFamily: 'mci',
      difficulty: 'Pro',
      duration: '6 mins • Audio',
      gradientColors: [colors.gold, '#B48A1E'],
      actionType: 'modal',
      stepsCount: 8,
      completedSteps: 0,
    },
    {
      id: 'invalidation_rules',
      level: 'mastery',
      titleEn: 'Mufsiddat (Invalidators)',
      titleUr: 'مفسداتِ نماز',
      subtitleEn: 'Actions that nullify Salah requiring repeat',
      iconName: 'alert-circle',
      iconFamily: 'ion',
      difficulty: 'Pro',
      duration: '4 mins • Guide',
      gradientColors: ['#EF4444', '#DC2626'],
      actionType: 'modal',
      stepsCount: 6,
      completedSteps: 0,
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
      iconName: 'git-branch',
      iconFamily: 'ion',
      difficulty: 'Advanced',
      duration: '8 mins • Variations',
      gradientColors: ['#10B981', '#059669'],
      actionType: 'modal',
      stepsCount: 10,
      completedSteps: 0,
    },
    {
      id: 'daily_duas',
      level: 'explorer',
      titleEn: 'Masnoon Duas',
      titleUr: 'مسنون دعائیں',
      subtitleEn: 'Supplications for morning, evening & after prayer',
      iconName: 'hands-praying',
      iconFamily: 'fa5',
      difficulty: 'Advanced',
      duration: '5 mins • Duas',
      gradientColors: ['#F59E0B', '#D97706'],
      actionType: 'modal',
      stepsCount: 15,
      completedSteps: 0,
    },
  ];

  const currentLessons =
    activeLevel === 'starter'
      ? starterLessons
      : activeLevel === 'mastery'
      ? masteryLessons
      : explorerLessons;

  const toggleLessonComplete = (id: string) => {
    setCompletedLessons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLessonPress = (item: LearnLesson) => {
    if (item.actionType === 'navigate' && item.screenName) {
      navigation.navigate(item.screenName);
    } else {
      setActiveModal(item.id);
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

  const renderLessonIcon = (item: LearnLesson) => {
    if (item.iconFamily === 'mci') {
      return <MaterialCommunityIcons name={item.iconName as any} size={28} color="#FFFFFF" />;
    } else if (item.iconFamily === 'fa5') {
      return <FontAwesome5 name={item.iconName as any} size={24} color="#FFFFFF" />;
    }
    return <Ionicons name={item.iconName as any} size={28} color="#FFFFFF" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Essential':
        return '#10B981';
      case 'Pro':
        return '#8B5CF6';
      case 'Advanced':
        return '#F59E0B';
      default:
        return colors.primary;
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {activeLevel.charAt(0).toUpperCase() + activeLevel.slice(1)} Lessons
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {currentLessons.length} lessons available
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Lessons List */}
        <View style={styles.lessonsList}>
          {currentLessons.map((item, index) => {
            const isDone = completedLessons[item.id];
            const stepProgress = item.stepsCount && item.completedSteps 
              ? Math.round((item.completedSteps / item.stepsCount) * 100) 
              : 0;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.lessonCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => handleLessonPress(item)}
                activeOpacity={0.85}
              >
                {/* Top Row: Badge and Progress Count */}
                <View style={styles.lessonTopRow}>
                  <View style={styles.badgeRow}>
                    <View style={[styles.lessonNumberBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.lessonNumberBadgeText, { color: colors.primary }]}>{index + 1}</Text>
                    </View>
                    <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
                      <Text style={[styles.diffBadgeText, { color: getDifficultyColor(item.difficulty) }]}>
                        {item.difficulty}
                      </Text>
                    </View>
                  </View>
                  {item.stepsCount && (
                    <View style={styles.progressCount}>
                      <Text style={[styles.progressCountText, { color: colors.textSecondary }]}>
                        {item.completedSteps || 0}/{item.stepsCount}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Main Content */}
                <View style={styles.lessonMain}>
                  {/* Icon */}
                  <LinearGradient
                    colors={item.gradientColors}
                    style={styles.lessonIcon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {renderLessonIcon(item)}
                  </LinearGradient>

                  {/* Text Content */}
                  <View style={styles.lessonText}>
                    <Text style={[styles.lessonTitle, { color: colors.textPrimary }]}>{item.titleEn}</Text>
                    <Text style={[styles.lessonArabic, { color: colors.primary }]}>{item.titleUr}</Text>
                    <Text style={[styles.lessonDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.subtitleEn}
                    </Text>
                  </View>

                  {/* Check Button */}
                  <TouchableOpacity
                    style={[styles.checkBtn, isDone && { backgroundColor: '#10B981' }]}
                    onPress={() => toggleLessonComplete(item.id)}
                  >
                    <Ionicons 
                      name={isDone ? 'checkmark' : 'radio-button-off'} 
                      size={18} 
                      color={isDone ? '#FFFFFF' : colors.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                {item.stepsCount && (
                  <View style={styles.lessonProgressBar}>
                    <View style={[styles.lessonProgressFill, { width: `${stepProgress}%`, backgroundColor: getDifficultyColor(item.difficulty) }]} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Lesson Modal */}
      <Modal
        visible={activeModal !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
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
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {activeModal === 'wuzu_guide' && (
                <View style={styles.modalSection}>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                      <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Niyyah (Intention) & Bismillah</Text>
                      <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Make intention for purification and recite Bismillah-ir-Rahman-ir-Rahim.</Text>
                    </View>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Wash Hands to Wrists</Text>
                      <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Wash both hands up to the wrists three times thoroughly.</Text>
                    </View>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Rinse Mouth & Nose</Text>
                      <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Rinse mouth three times and sniff water into nostrils, then blow out.</Text>
                    </View>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                      <Text style={styles.stepNumberText}>4</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Wash Face & Arms</Text>
                      <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Wash entire face three times, then wash arms up to elbows starting with right arm.</Text>
                    </View>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                      <Text style={styles.stepNumberText}>5</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Masah & Feet</Text>
                      <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Wipe wet hands over head and ears, then wash both feet to ankles starting with right foot.</Text>
                    </View>
                  </View>
                </View>
              )}

              {activeModal === 'tayammum_guide' && (
                <View style={styles.modalSection}>
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    When clean water is not available or its use causes health illness/harm.
                  </Text>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                      <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Intention & Strike Earth</Text>
                      <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Make Niyyah and strike both hands on clean earth/dust or stone.</Text>
                    </View>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Wipe Face</Text>
                      <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Wipe the palms over the entire face once.</Text>
                    </View>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Wipe Arms</Text>
                      <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>Strike hands again and wipe right arm up to elbow, then left arm.</Text>
                    </View>
                  </View>
                </View>
              )}

              {activeModal === 'faraiz_guidelines' && (
                <View style={styles.modalSection}>
                  <Text style={[styles.sectionTitle, { color: colors.primary }]}>6 External Conditions (Sharaait):</Text>
                  <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                    1. Taharah (Purity) 2. Covering Awrah 3. Time of prayer 4. Facing Qibla 5. Intention 6. Takbeer-e-Tahrima.
                  </Text>
                  <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 16 }]}>6 Internal Obligatory Acts (Arkan):</Text>
                  <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                    1. Qiyam (Standing) 2. Qira'at (Recitation) 3. Ruku (Bowing) 4. Sujood (Prostrations) 5. Qa'da Akheira 6. Salam.
                  </Text>
                </View>
              )}

              {activeModal === 'surahs_collection' && (
                <View style={styles.modalSection}>
                  <View style={styles.verseCard}>
                    <Text style={[styles.verseTitle, { color: colors.primary }]}>Surah Al-Fatiha</Text>
                    <Text style={[styles.arabicText, { color: colors.textPrimary }]}>الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ</Text>
                  </View>
                  <View style={styles.verseCard}>
                    <Text style={[styles.verseTitle, { color: colors.primary }]}>Surah Al-Ikhlas</Text>
                    <Text style={[styles.arabicText, { color: colors.textPrimary }]}>قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ</Text>
                  </View>
                  <View style={styles.verseCard}>
                    <Text style={[styles.verseTitle, { color: colors.primary }]}>Surah An-Nas</Text>
                    <Text style={[styles.arabicText, { color: colors.textPrimary }]}>قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ</Text>
                  </View>
                </View>
              )}

              {activeModal !== 'wuzu_guide' &&
                activeModal !== 'tayammum_guide' &&
                activeModal !== 'faraiz_guidelines' &&
                activeModal !== 'surahs_collection' && (
                  <View style={styles.modalSection}>
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                      Detailed guidelines and content will be available in the full version.
                    </Text>
                  </View>
                )}
            </ScrollView>

            <TouchableOpacity
              onPress={() => {
                if (activeModal) toggleLessonComplete(activeModal);
                closeModal();
              }}
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.modalBtnText}>Mark as Complete</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 10 },

  // Lessons List
  lessonsList: {
    gap: 10,
  },
  lessonCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  lessonTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lessonNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumberBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  diffBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressCount: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  progressCountText: {
    fontSize: 10,
    fontWeight: '700',
  },
  lessonMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lessonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonText: {
    flex: 1,
    gap: 2,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  lessonArabic: {
    fontSize: 12,
    fontWeight: '700',
  },
  lessonDesc: {
    fontSize: 11,
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonProgressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  lessonProgressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  modalSection: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
  verseCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  verseTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  arabicText: {
    fontSize: 20,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  modalBtn: {
    margin: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
