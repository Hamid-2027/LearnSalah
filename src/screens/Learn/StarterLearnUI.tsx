import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MajorPosesModal } from '../../components/MajorPosesModal';
import { useTheme } from '../../store/hooks';

// ── Prayer Background Images (UNCHANGED) ────────────────────────────────────
const PRAYER_IMAGES: Record<string, any> = {
  fajr: require('../../assets/images/prayerTimeImg/Fajr.png'),
  dhuhr: require('../../assets/images/prayerTimeImg/Zuhr.png'),
  asr: require('../../assets/images/prayerTimeImg/Asr.png'),
  maghrib: require('../../assets/images/prayerTimeImg/Maghrib.png'),
  isha: require('../../assets/images/prayerTimeImg/Isha.png'),
};

// ── Purification Card Backgrounds ────────────────────────────────────────────
const WUDU_BG = require('../../assets/images/otherImages/wudu_card_bg.jpg');
const GHUSL_BG = require('../../assets/images/otherImages/ghusl_card_bg.jpg');

const { width: SCREEN_W } = Dimensions.get('window');

// Prayer card size: fits ~3.8 cards across screen with smooth scroll
const PRAYER_CARD_W = Math.round((SCREEN_W - 40 - 24) / 3.6);
const PRAYER_CARD_H = Math.round(PRAYER_CARD_W * 1.25);

// Purification card height
const PURIF_CARD_H = 104;

interface StarterLearnUIProps {
  scrollRef?: React.RefObject<ScrollView | null>;
  bottomPad: number;
}

export const StarterLearnUI: React.FC<StarterLearnUIProps> = ({
  scrollRef,
  bottomPad,
}) => {
  const navigation = useNavigation<any>();
  const { isDarkMode, colors } = useTheme();

  // Dynamic Theme Colors
  const theme = {
    bg: isDarkMode ? '#020B1C' : colors.background,
    cardBg: isDarkMode ? '#05142E' : colors.surface,
    cardBorder: isDarkMode ? '#183B70' : colors.border,
    prayerCardBorder: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : colors.border,
    sectionTitle: isDarkMode ? '#FFFFFF' : colors.textPrimary,
    divider: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : colors.border,
    practiceText: isDarkMode ? '#FFFFFF' : colors.textPrimary,
    practiceIcon: isDarkMode ? '#FFFFFF' : colors.primary,
    majorPosesBg: isDarkMode ? '#05142E' : colors.surface,
    majorPosesBorder: isDarkMode ? '#183B70' : colors.border,
    majorPosesIconWrap: isDarkMode ? 'rgba(96, 165, 250, 0.12)' : 'rgba(37, 99, 235, 0.08)',
    majorPosesIcon: isDarkMode ? '#60A5FA' : colors.primary,
    majorPosesTitle: isDarkMode ? '#FFFFFF' : colors.textPrimary,
    majorPosesSubtitle: isDarkMode ? '#94A3B8' : colors.textSecondary,
    majorPosesBadgeBg: isDarkMode ? 'rgba(96, 165, 250, 0.18)' : 'rgba(37, 99, 235, 0.1)',
    majorPosesBadgeText: isDarkMode ? '#93C5FD' : colors.primary,
    modalBg: isDarkMode ? '#071228' : colors.surface,
    modalBorder: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : colors.border,
    modalVerseBg: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : (isDarkMode ? '#0A1A36' : '#F8FAFC'),
    modalVerseBorder: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : colors.border,
    modalTextPrimary: isDarkMode ? '#FFFFFF' : colors.textPrimary,
    modalTextSecondary: isDarkMode ? '#94A3B8' : colors.textSecondary,
    modalArabicText: isDarkMode ? '#F8FAFC' : colors.textPrimary,
    modalCloseBg: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : colors.surfaceSecondary,
    modalCloseColor: isDarkMode ? '#94A3B8' : colors.textSecondary,
    shadowColor: '#000000',
    shadowOpacity: isDarkMode ? 0.25 : 0.08,
  };

  // Practice modal state
  const [activePracticeModal, setActivePracticeModal] = useState<'fatiha' | 'tashahhud' | null>(null);

  // Major Poses & Recitations Modal state
  const [showMajorPosesModal, setShowMajorPosesModal] = useState(false);
  const [selectedMajorPoseId, setSelectedMajorPoseId] = useState<string>('takbeer');

  const openMajorPoses = (poseId?: string) => {
    if (poseId) {
      setSelectedMajorPoseId(poseId);
    }
    setShowMajorPosesModal(true);
  };

  // ── "How to pray?" Prayer List ─────────────────────────────────────────────
  const prayers = [
    { id: 'fajr', label: 'Fajr' },
    { id: 'dhuhr', label: 'Dhuhr' },
    { id: 'asr', label: 'Asr' },
    { id: 'maghrib', label: 'Maghrib' },
    { id: 'isha', label: 'Isha' },
  ];

  const navigateToPrayer = (prayerId: string) => {
    navigation.navigate('PrayerGuide', { prayerId });
  };

  const navigateToWudu = () => {
    navigation.navigate('LessonsList', {
      level: 'starter',
      moduleId: 'step_namaz',
      initialStepId: 'wuzu_guide',
    });
  };

  const navigateToGhusl = () => {
    navigation.navigate('LessonsList', {
      level: 'starter',
      moduleId: 'fiqh_essentials',
      initialStepId: 'ghusl_guide',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        ref={scrollRef}
        style={[styles.root, { backgroundColor: theme.bg }]}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ════════════════════════════════════════
            SECTION 1 — How to pray?
        ════════════════════════════════════════ */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.sectionTitle }]}>How to pray?</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.prayerRow}
        >
          {prayers.map((p) => (
            <TouchableOpacity
              key={p.id}
              activeOpacity={0.85}
              onPress={() => navigateToPrayer(p.id)}
              style={[
                styles.prayerCard,
                {
                  width: PRAYER_CARD_W,
                  height: PRAYER_CARD_H,
                  borderColor: theme.prayerCardBorder,
                  shadowColor: theme.shadowColor,
                  shadowOpacity: theme.shadowOpacity,
                },
              ]}
            >
              <ImageBackground
                source={PRAYER_IMAGES[p.id]}
                style={styles.prayerCardImg}
                imageStyle={styles.prayerCardImgStyle}
              >
                {/* Natural dark vignette gradient for clear label legibility */}
                <LinearGradient
                  colors={['transparent', 'rgba(0, 0, 0, 0.25)', 'rgba(0, 0, 0, 0.75)']}
                  locations={[0.2, 0.6, 1]}
                  style={styles.prayerCardGrad}
                >
                  <Text style={styles.prayerCardLabel}>{p.label}</Text>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Thin Divider Line ── */}
        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {/* ════════════════════════════════════════
            SECTION 2 — Purification
        ════════════════════════════════════════ */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.sectionTitle }]}>Purification</Text>
        </View>

        <View style={styles.purifRow}>
          {/* Wudu Card */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.purifCard,
              {
                borderColor: theme.prayerCardBorder,
                shadowColor: theme.shadowColor,
                shadowOpacity: theme.shadowOpacity,
              },
            ]}
            onPress={navigateToWudu}
          >
            <ImageBackground
              source={WUDU_BG}
              style={styles.purifCardImg}
              imageStyle={styles.purifCardImgStyle}
            >
              <LinearGradient
                colors={['rgba(3, 11, 28, 0.1)', 'rgba(2, 9, 25, 0.7)']}
                style={styles.purifCardGrad}
              >
                <Text style={styles.purifCardLabel}>Wudu</Text>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>

          {/* Ghusl Card */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.purifCard,
              {
                borderColor: theme.prayerCardBorder,
                shadowColor: theme.shadowColor,
                shadowOpacity: theme.shadowOpacity,
              },
            ]}
            onPress={navigateToGhusl}
          >
            <ImageBackground
              source={GHUSL_BG}
              style={styles.purifCardImg}
              imageStyle={styles.purifCardImgStyle}
            >
              <LinearGradient
                colors={['rgba(3, 11, 28, 0.08)', 'rgba(2, 9, 25, 0.65)']}
                style={styles.purifCardGrad}
              >
                <Text style={styles.purifCardLabel}>Ghusl</Text>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* ── Thin Divider Line ── */}
        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {/* ════════════════════════════════════════
            SECTION 3 — Practice
        ════════════════════════════════════════ */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.sectionTitle }]}>Practice</Text>
        </View>

        <View style={styles.practiceContainer}>
          {/* Row 1: Al-Fatiha & Tashahhud Quick Action Cards */}
          <View style={styles.practiceRow}>
            {/* Al-Fatiha Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.practiceCard,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.cardBorder,
                  shadowColor: theme.shadowColor,
                  shadowOpacity: theme.shadowOpacity,
                },
              ]}
              onPress={() => setActivePracticeModal('fatiha')}
            >
              <MaterialCommunityIcons name="book-open-variant" size={20} color={theme.practiceIcon} />
              <Text style={[styles.practiceLabel, { color: theme.practiceText }]}>Al-Fatiha</Text>
            </TouchableOpacity>

            {/* Tashahhud Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.practiceCard,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.cardBorder,
                  shadowColor: theme.shadowColor,
                  shadowOpacity: theme.shadowOpacity,
                },
              ]}
              onPress={() => setActivePracticeModal('tashahhud')}
            >
              <FontAwesome5 name="pray" size={17} color={theme.practiceIcon} />
              <Text style={[styles.practiceLabel, { color: theme.practiceText }]}>Tashahhud</Text>
            </TouchableOpacity>
          </View>

          {/* Row 2: Major Poses & Recitation Featured Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.majorPosesCard,
              {
                backgroundColor: theme.majorPosesBg,
                borderColor: theme.majorPosesBorder,
                shadowColor: theme.shadowColor,
                shadowOpacity: theme.shadowOpacity,
              },
            ]}
            onPress={() => openMajorPoses('takbeer')}
          >
            <View style={[styles.majorPosesIconWrap, { backgroundColor: theme.majorPosesIconWrap }]}>
              <MaterialCommunityIcons name="human-handsup" size={24} color={theme.majorPosesIcon} />
            </View>
            <View style={styles.majorPosesTextCol}>
              <View style={styles.majorPosesTitleRow}>
                <Text style={[styles.majorPosesTitle, { color: theme.majorPosesTitle }]}>
                  Major Poses & Recitation
                </Text>
                <View style={[styles.majorPosesBadge, { backgroundColor: theme.majorPosesBadgeBg }]}>
                  <Text style={[styles.majorPosesBadgeText, { color: theme.majorPosesBadgeText }]}>
                    6 POSES
                  </Text>
                </View>
              </View>
              <Text style={[styles.majorPosesSubtitle, { color: theme.majorPosesSubtitle }]}>
                Guided postures, audio recitations & step-by-step practice
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.majorPosesSubtitle} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ════════════════════════════════════════
          PRACTICE MODAL: Al-Fatiha
      ════════════════════════════════════════ */}
      <Modal
        visible={activePracticeModal === 'fatiha'}
        transparent
        animationType="slide"
        onRequestClose={() => setActivePracticeModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.modalBg, borderColor: theme.modalBorder }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeaderRow, { borderBottomColor: theme.divider }]}>
              <View style={styles.modalHeaderIconBadge}>
                <MaterialCommunityIcons name="book-open-page-variant" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: theme.modalTextPrimary }]}>Surah Al-Fatiha</Text>
                <Text style={[styles.modalSubtitle, { color: theme.modalTextSecondary }]}>The Opening • Recited in every Rak'ah</Text>
              </View>
              <TouchableOpacity
                onPress={() => setActivePracticeModal(null)}
                style={[styles.modalCloseBtn, { backgroundColor: theme.modalCloseBg }]}
              >
                <Ionicons name="close" size={20} color={theme.modalCloseColor} />
              </TouchableOpacity>
            </View>

            {/* Verses ScrollView */}
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={[styles.verseBox, { backgroundColor: theme.modalVerseBg, borderColor: theme.modalVerseBorder }]}>
                <Text style={[styles.verseNumberTag, { color: colors.primary }]}>Verse 1</Text>
                <Text style={[styles.verseArabic, { color: theme.modalArabicText }]}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
                <Text style={[styles.verseTranslit, { color: isDarkMode ? '#CBD5E1' : colors.primaryDark }]}>Bismillāhir-Raḥmānir-Raḥīm</Text>
                <Text style={[styles.verseMeaning, { color: theme.modalTextSecondary }]}>In the name of Allah, the Entirely Merciful, the Especially Merciful.</Text>
              </View>

              <View style={[styles.verseBox, { backgroundColor: theme.modalVerseBg, borderColor: theme.modalVerseBorder }]}>
                <Text style={[styles.verseNumberTag, { color: colors.primary }]}>Verse 2</Text>
                <Text style={[styles.verseArabic, { color: theme.modalArabicText }]}>الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ</Text>
                <Text style={[styles.verseTranslit, { color: isDarkMode ? '#CBD5E1' : colors.primaryDark }]}>Al-ḥamdu lillāhi Rabbil-ʿālamīn</Text>
                <Text style={[styles.verseMeaning, { color: theme.modalTextSecondary }]}>[All] praise is [due] to Allah, Lord of the worlds.</Text>
              </View>

              <View style={[styles.verseBox, { backgroundColor: theme.modalVerseBg, borderColor: theme.modalVerseBorder }]}>
                <Text style={[styles.verseNumberTag, { color: colors.primary }]}>Verse 3</Text>
                <Text style={[styles.verseArabic, { color: theme.modalArabicText }]}>الرَّحْمَٰنِ الرَّحِيمِ</Text>
                <Text style={[styles.verseTranslit, { color: isDarkMode ? '#CBD5E1' : colors.primaryDark }]}>Ar-Raḥmānir-Raḥīm</Text>
                <Text style={[styles.verseMeaning, { color: theme.modalTextSecondary }]}>The Entirely Merciful, the Especially Merciful.</Text>
              </View>

              <View style={[styles.verseBox, { backgroundColor: theme.modalVerseBg, borderColor: theme.modalVerseBorder }]}>
                <Text style={[styles.verseNumberTag, { color: colors.primary }]}>Verse 4</Text>
                <Text style={[styles.verseArabic, { color: theme.modalArabicText }]}>مَالِكِ يَوْمِ الدِّينِ</Text>
                <Text style={[styles.verseTranslit, { color: isDarkMode ? '#CBD5E1' : colors.primaryDark }]}>Māliki Yawmid-Dīn</Text>
                <Text style={[styles.verseMeaning, { color: theme.modalTextSecondary }]}>Sovereign of the Day of Recompense.</Text>
              </View>

              <View style={[styles.verseBox, { backgroundColor: theme.modalVerseBg, borderColor: theme.modalVerseBorder }]}>
                <Text style={[styles.verseNumberTag, { color: colors.primary }]}>Verse 5</Text>
                <Text style={[styles.verseArabic, { color: theme.modalArabicText }]}>إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ</Text>
                <Text style={[styles.verseTranslit, { color: isDarkMode ? '#CBD5E1' : colors.primaryDark }]}>Iyyāka naʿbudu wa iyyāka nastaʿīn</Text>
                <Text style={[styles.verseMeaning, { color: theme.modalTextSecondary }]}>It is You we worship and You we ask for help.</Text>
              </View>

              <View style={[styles.verseBox, { backgroundColor: theme.modalVerseBg, borderColor: theme.modalVerseBorder }]}>
                <Text style={[styles.verseNumberTag, { color: colors.primary }]}>Verse 6-7</Text>
                <Text style={[styles.verseArabic, { color: theme.modalArabicText }]}>اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ</Text>
                <Text style={[styles.verseTranslit, { color: isDarkMode ? '#CBD5E1' : colors.primaryDark }]}>Ihdinaṣ-ṣirāṭal-mustaqīm. Ṣirāṭallaḏīna anʿamta ʿalayhim gayril-maġḍūbi ʿalayhim walaḍ-ḍāllīn.</Text>
                <Text style={[styles.verseMeaning, { color: theme.modalTextSecondary }]}>Guide us to the straight path - The path of those upon whom You have bestowed favor, not of those who have evoked anger or of those who are astray.</Text>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.modalSecondaryActionBtn,
                  {
                    backgroundColor: isDarkMode ? 'rgba(96, 165, 250, 0.12)' : 'rgba(37, 99, 235, 0.08)',
                    borderColor: isDarkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(37, 99, 235, 0.25)',
                  },
                ]}
                onPress={() => {
                  setActivePracticeModal(null);
                  openMajorPoses('qiyam');
                }}
              >
                <MaterialCommunityIcons name="headphones" size={18} color={isDarkMode ? '#60A5FA' : colors.primary} />
                <Text style={[styles.modalSecondaryActionBtnText, { color: isDarkMode ? '#93C5FD' : colors.primary }]}>
                  Listen in Major Poses & Recitation
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.modalActionBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setActivePracticeModal(null);
                  navigation.navigate('PrayerGuide', { prayerId: 'fajr' });
                }}
              >
                <Ionicons name="play-circle" size={18} color="#FFFFFF" />
                <Text style={styles.modalActionBtnText}>Practice in Guided Prayer</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════
          PRACTICE MODAL: Tashahhud
      ════════════════════════════════════════ */}
      <Modal
        visible={activePracticeModal === 'tashahhud'}
        transparent
        animationType="slide"
        onRequestClose={() => setActivePracticeModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.modalBg, borderColor: theme.modalBorder }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeaderRow, { borderBottomColor: theme.divider }]}>
              <View style={styles.modalHeaderIconBadge}>
                <FontAwesome5 name="pray" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: theme.modalTextPrimary }]}>At-Tashahhud (Attahiyyat)</Text>
                <Text style={[styles.modalSubtitle, { color: theme.modalTextSecondary }]}>Sitting posture • Recited in Qa'dah</Text>
              </View>
              <TouchableOpacity
                onPress={() => setActivePracticeModal(null)}
                style={[styles.modalCloseBtn, { backgroundColor: theme.modalCloseBg }]}
              >
                <Ionicons name="close" size={20} color={theme.modalCloseColor} />
              </TouchableOpacity>
            </View>

            {/* Verses ScrollView */}
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={[styles.postureHintBox, { backgroundColor: isDarkMode ? 'rgba(96, 165, 250, 0.12)' : 'rgba(37, 99, 235, 0.08)' }]}>
                <Ionicons name="information-circle" size={16} color={isDarkMode ? '#60A5FA' : colors.primary} />
                <Text style={[styles.postureHintText, { color: isDarkMode ? '#93C5FD' : colors.primary }]}>
                  Recited while seated on the floor with hands resting gently on thighs/knees, raising the right index finger during the Shahadah.
                </Text>
              </View>

              <View style={[styles.verseBox, { backgroundColor: theme.modalVerseBg, borderColor: theme.modalVerseBorder }]}>
                <Text style={[styles.verseNumberTag, { color: colors.primary }]}>Part 1 — Greetings to Allah</Text>
                <Text style={[styles.verseArabic, { color: theme.modalArabicText }]}>
                  التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ
                </Text>
                <Text style={[styles.verseTranslit, { color: isDarkMode ? '#CBD5E1' : colors.primaryDark }]}>
                  At-taḥiyyātu lillāhi waṣ-ṣalawātu waṭ-ṭayyibāt
                </Text>
                <Text style={[styles.verseMeaning, { color: theme.modalTextSecondary }]}>
                  All greetings, prayers and good things belong to Allah.
                </Text>
              </View>

              <View style={[styles.verseBox, { backgroundColor: theme.modalVerseBg, borderColor: theme.modalVerseBorder }]}>
                <Text style={[styles.verseNumberTag, { color: colors.primary }]}>Part 2 — Peace on the Prophet ﷺ</Text>
                <Text style={[styles.verseArabic, { color: theme.modalArabicText }]}>
                  السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ
                </Text>
                <Text style={[styles.verseTranslit, { color: isDarkMode ? '#CBD5E1' : colors.primaryDark }]}>
                  As-salāmu ʿalayka ayyuhan-nabiyyu wa raḥmatullāhi wa barakātuh
                </Text>
                <Text style={[styles.verseMeaning, { color: theme.modalTextSecondary }]}>
                  Peace be upon you, O Prophet, and the mercy of Allah and His blessings.
                </Text>
              </View>

              <View style={[styles.verseBox, { backgroundColor: theme.modalVerseBg, borderColor: theme.modalVerseBorder }]}>
                <Text style={[styles.verseNumberTag, { color: colors.primary }]}>Part 3 — Peace on the Righteous</Text>
                <Text style={[styles.verseArabic, { color: theme.modalArabicText }]}>
                  السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللَّهِ الصَّالِحِينَ
                </Text>
                <Text style={[styles.verseTranslit, { color: isDarkMode ? '#CBD5E1' : colors.primaryDark }]}>
                  As-salāmu ʿalaynā wa ʿalā ʿibādillāhiṣ-ṣāliḥīn
                </Text>
                <Text style={[styles.verseMeaning, { color: theme.modalTextSecondary }]}>
                  Peace be upon us and upon the righteous servants of Allah.
                </Text>
              </View>

              <View style={[styles.verseBox, { backgroundColor: theme.modalVerseBg, borderColor: theme.modalVerseBorder }]}>
                <Text style={[styles.verseNumberTag, { color: colors.primary }]}>Part 4 — The Testimony (Shahadah)</Text>
                <Text style={[styles.verseArabic, { color: theme.modalArabicText }]}>
                  أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ
                </Text>
                <Text style={[styles.verseTranslit, { color: isDarkMode ? '#CBD5E1' : colors.primaryDark }]}>
                  Ashhadu allā ilāha illallāh, wa ashhadu anna Muḥammadan ʿabduhū wa rasūluh
                </Text>
                <Text style={[styles.verseMeaning, { color: theme.modalTextSecondary }]}>
                  I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and messenger.
                </Text>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.modalSecondaryActionBtn,
                  {
                    backgroundColor: isDarkMode ? 'rgba(96, 165, 250, 0.12)' : 'rgba(37, 99, 235, 0.08)',
                    borderColor: isDarkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(37, 99, 235, 0.25)',
                  },
                ]}
                onPress={() => {
                  setActivePracticeModal(null);
                  openMajorPoses('tashahhud');
                }}
              >
                <MaterialCommunityIcons name="headphones" size={18} color={isDarkMode ? '#60A5FA' : colors.primary} />
                <Text style={[styles.modalSecondaryActionBtnText, { color: isDarkMode ? '#93C5FD' : colors.primary }]}>
                  Listen in Major Poses & Recitation
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.modalActionBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setActivePracticeModal(null);
                  navigation.navigate('PrayerGuide', { prayerId: 'fajr' });
                }}
              >
                <Ionicons name="play-circle" size={18} color="#FFFFFF" />
                <Text style={styles.modalActionBtnText}>Practice in Guided Prayer</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════
          MAJOR POSES & RECITATIONS MODAL
      ════════════════════════════════════════ */}
      <MajorPosesModal
        visible={showMajorPosesModal}
        onClose={() => setShowMajorPosesModal(false)}
        initialPoseId={selectedMajorPoseId}
      />
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  content: {
    paddingTop: 16,
  },

  // Section Heading
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Divider
  divider: {
    height: 1,
    marginHorizontal: 0,
    marginVertical: 22,
  },

  // Prayer Cards
  prayerRow: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 12,
  },
  prayerCard: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#081736',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  prayerCardImg: {
    flex: 1,
  },
  prayerCardImgStyle: {
    borderRadius: 21,
    resizeMode: 'cover',
  },
  prayerCardGrad: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
    borderRadius: 21,
  },
  prayerCardLabel: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },

  // Purification Cards
  purifRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 14,
  },
  purifCard: {
    flex: 1,
    height: PURIF_CARD_H,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#081736',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  purifCardImg: {
    flex: 1,
  },
  purifCardImgStyle: {
    borderRadius: 21,
    resizeMode: 'cover',
  },
  purifCardGrad: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 18,
    borderRadius: 21,
  },
  purifCardLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Practice Container
  practiceContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  practiceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  practiceCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    gap: 9,
  },
  practiceLabel: {
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },

  // Major Poses & Recitation Featured Card
  majorPosesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    gap: 13,
  },
  majorPosesIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  majorPosesTextCol: {
    flex: 1,
  },
  majorPosesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  majorPosesTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  majorPosesBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  majorPosesBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  majorPosesSubtitle: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },

  // Practice Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    maxHeight: '82%',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalHeaderIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    marginTop: 14,
  },
  postureHintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  postureHintText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
  },
  verseBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  verseNumberTag: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  verseArabic: {
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 32,
    textAlign: 'right',
    marginBottom: 8,
  },
  verseTranslit: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  verseMeaning: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  modalSecondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  modalSecondaryActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
