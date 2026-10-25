import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  Dimensions,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageAssets, AudioAssets } from '../utils/assetsMap';
import { useTheme } from '../store/hooks';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.27;
const CARD_HEIGHT = CARD_WIDTH * 1.32;

export interface MajorPoseVerse {
  section_title?: string;
  arabic: string;
  transliteration: string;
  translation_ur: string;
}

export interface MajorPoseItem {
  id: string;
  title: { en: string; ur: string };
  description: { en: string; ur: string };
  image: string;
  badge: string;
  verses: MajorPoseVerse[];
  audioKey: string;
}

export const MAJOR_POSES: MajorPoseItem[] = [
  {
    id: 'takbeer',
    title: { en: 'Takbeer-e-Tahrima', ur: 'تکبیرِ تحریمہ' },
    description: { en: 'Raise hands to ears and proclaim Allahu Akbar', ur: 'ہاتھ کانوں تک اٹھا کر تکبیر کہنا' },
    image: 'standing_takbeer_male.jpeg',
    badge: '1 Sec Ratio',
    audioKey: 'common_takbeer_ar.mp3',
    verses: [
      {
        arabic: 'اللَّهُ أَكْبَرُ',
        transliteration: 'Allahu Akbar',
        translation_ur: 'اللہ سب سے بڑا ہے',
      },
    ],
  },
  {
    id: 'qiyam',
    title: { en: 'Qiyam — Standing Recitation', ur: 'قیام — مکمل تلاوت' },
    description: { en: 'Stand upright and recite Surah Al-Fatiha and Surah Al-Ikhlas (Tauheed)', ur: 'سیدھا کھڑے ہو کر سورۃ الفاتحہ اور سورۃ الاخلاص کی مکمل تلاوت کرنا' },
    image: 'standing_male.jpeg',
    badge: '3 Sec Ratio',
    audioKey: 'qayam_ar.mp3',
    verses: [
      // Surah Al-Fatiha
      {
        section_title: 'Surah Al-Fatiha — سورۃ الفاتحہ',
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'Bismillahir-Rahmanir-Raheem',
        translation_ur: 'اللہ کے نام سے شروع جو بڑا مہربان نہایت رحم والا ہے',
      },
      {
        arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝',
        transliteration: "Alhamdu lillahi Rabbil 'alameen",
        translation_ur: 'تمام تعریفیں اللہ کے لیے ہیں جو تمام جہانوں کا رب ہے',
      },
      {
        arabic: 'الرَّحْمَٰنِ الرَّحِيمِ ۝',
        transliteration: 'Ar-Rahmanir-Raheem',
        translation_ur: 'نہایت مہربان، رحم کرنے والا',
      },
      {
        arabic: 'مَالِكِ يَوْمِ الدِّينِ ۝',
        transliteration: 'Maliki yawmid-deen',
        translation_ur: 'روزِ جزا کا مالک',
      },
      {
        arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝',
        transliteration: "Iyyaka na'budu wa iyyaka nasta'een",
        translation_ur: 'ہم صرف تیری عبادت کرتے ہیں اور صرف تجھ ہی سے مدد مانگتے ہیں',
      },
      {
        arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝',
        transliteration: 'Ihdinas-siratal-mustaqeem',
        translation_ur: 'ہمیں سیدھا راستہ دکھا',
      },
      {
        arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ۝',
        transliteration: "Siratal-ladhina an'amta 'alaihim ghayril-maghdubi 'alaihim wa lad-dalleen",
        translation_ur: 'ان لوگوں کا راستہ جن پر تو نے انعام کیا، نہ کہ ان کا جن پر غضب ہوا اور نہ گمراہوں کا',
      },
      // Surah Al-Ikhlas (Tauheed)
      {
        section_title: 'Surah Al-Ikhlas (Tauheed) — سورۃ الاخلاص (توحید)',
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'Bismillahir-Rahmanir-Raheem',
        translation_ur: 'اللہ کے نام سے شروع جو بڑا مہربان نہایت رحم والا ہے',
      },
      {
        arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝',
        transliteration: 'Qul huwa Allahu ahad',
        translation_ur: 'کہہ دو وہ اللہ ایک ہے',
      },
      {
        arabic: 'اللَّهُ الصَّمَدُ ۝',
        transliteration: 'Allahus-samad',
        translation_ur: 'اللہ بے نیاز ہے',
      },
      {
        arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ ۝',
        transliteration: 'Lam yalid wa lam yulad',
        translation_ur: 'نہ اس نے کسی کو جنا اور نہ وہ جنا گیا',
      },
      {
        arabic: 'وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ ۝',
        transliteration: 'Wa lam yakul-lahu kufuwan ahad',
        translation_ur: 'اور کوئی اس کا ہمسر نہیں',
      },
    ],
  },
  {
    id: 'ruku',
    title: { en: 'Ruku — Bowing', ur: 'رکوع — تسبیح' },
    description: { en: 'Bow with hands on knees and recite Tasbeeh 3 times', ur: 'گھٹنوں پر ہاتھ رکھ کر جھکنا اور 3 بار تسبیح پڑھنا' },
    image: 'ruku_male.jpeg',
    badge: '2 Sec Ratio',
    audioKey: 'common_tasbeeh_ruku_ar.mp3',
    verses: [
      {
        section_title: 'Tasbeeh Ruku (Recite 3 times) — رکوع کی تسبیح (3 بار)',
        arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
        transliteration: "Subhana Rabbiyal 'Adheem",
        translation_ur: 'میرا رب پاک ہے، بہت عظمت والا',
      },
    ],
  },
  {
    id: 'sajood',
    title: { en: 'Sajood — Prostration', ur: 'سجدہ — تسبیح' },
    description: { en: 'Prostrate with forehead & palms touching the ground', ur: 'پیشانی اور ہاتھ زمین پر رکھ کر 3 بار تسبیح پڑھنا' },
    image: 'sujood_male.jpeg',
    badge: '2 Sec Ratio',
    audioKey: 'common_tasbeeh_sujood_ar.mp3',
    verses: [
      {
        section_title: 'Tasbeeh Sajdah (Recite 3 times) — سجدہ کی تسبیح (3 بار)',
        arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
        transliteration: "Subhana Rabbiyal A'la",
        translation_ur: 'میرا رب پاک ہے، سب سے بلند',
      },
    ],
  },
  {
    id: 'tashahhud',
    title: { en: 'Tashahhud — Sitting Testimony', ur: 'تشہد — القعدہ' },
    description: { en: 'Sit calmly for Tashahhud, Durood & Supplications', ur: 'التحیات، درود شریف اور دعا کے لیے بیٹھنا' },
    image: 'sitting_tashahhud_male.jpeg',
    badge: '2 Sec Ratio',
    audioKey: 'tashud1.mp3',
    verses: [
      {
        section_title: 'At-Tahiyyat — التحیات',
        arabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ',
        transliteration: 'At-tahiyyatu lillahi was-salawatu wat-tayyibat',
        translation_ur: 'تمام زبانی، بدنی اور مالی عبادتیں اللہ کے لیے ہیں',
      },
      {
        section_title: 'Greetings on the Prophet — سلام علی النبی',
        arabic: 'السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ',
        transliteration: "Assalamu 'alaika ayyuhan-nabiyyu wa rahmatullahi wa barakatuh",
        translation_ur: 'اے نبی! آپ پر سلامتی ہو اور اللہ کی رحمت اور برکتیں ہوں',
      },
      {
        section_title: 'Greetings on Righteous Servants — سلام علی العباد الصالحین',
        arabic: 'السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ',
        transliteration: "Assalamu 'alaina wa 'ala 'ibadillahis-saliheen",
        translation_ur: 'ہم پر اور اللہ کے نیک بندوں پر سلامتی ہو',
      },
      {
        section_title: 'Shahada — گواہی (شہادت)',
        arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
        transliteration: "Ashhadu an la ilaha illallah wa ashhadu anna Muhammadan 'abduhu wa rasuluh",
        translation_ur: 'میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں، اور میں گواہی دیتا ہوں کہ محمد ﷺ اس کے بندے اور رسول ہیں',
      },
    ],
  },
  {
    id: 'salam',
    title: { en: 'Salam — Concluding Prayer', ur: 'سلام — خاتمہ' },
    description: { en: 'Turn head right and left saying peace unto you', ur: 'دائیں اور بائیں طرف سلام پھیرنا' },
    image: 'salam_right_male.jpeg',
    badge: '2 Sec Ratio',
    audioKey: 'salamEnd.mp3',
    verses: [
      {
        section_title: 'Salam Right & Left — دائیں اور بائیں طرف سلام',
        arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
        transliteration: "Assalamu 'alaikum wa rahmatullah",
        translation_ur: 'تم پر سلامتی ہو اور اللہ کی رحمت',
      },
    ],
  },
];

const MODAL_SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

interface MajorPosesModalProps {
  visible: boolean;
  onClose: () => void;
  initialPoseId?: string;
}

export const MajorPosesModal: React.FC<MajorPosesModalProps> = ({
  visible,
  onClose,
  initialPoseId,
}) => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const accentColor = colors.primary;
  const progressBarBg = colors.surfaceSecondary;

  const topInset = Math.max(insets.top, Platform.OS === 'android' ? RNStatusBar.currentHeight || 24 : 44);
  const bottomInset = Math.max(insets.bottom, 16);

  const [activePoseId, setActivePoseId] = useState<string>(initialPoseId || 'takbeer');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const soundInstanceIdRef = useRef(0);

  const activePose = MAJOR_POSES.find((p) => p.id === activePoseId) || MAJOR_POSES[0];

  useEffect(() => {
    if (initialPoseId) {
      setActivePoseId(initialPoseId);
    }
  }, [initialPoseId]);

  const stopAudio = useCallback(async () => {
    soundInstanceIdRef.current++;
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (_) { }
      soundRef.current = null;
    }
    setIsPlayingAudio(false);
    setAudioProgress(0);
  }, []);

  // Stop audio whenever active pose changes or modal closes
  useEffect(() => {
    stopAudio();
  }, [activePoseId, stopAudio]);

  useEffect(() => {
    if (!visible) {
      stopAudio();
    }
  }, [visible, stopAudio]);

  const playAudio = async (audioKey: string) => {
    if (isPlayingAudio) {
      if (soundRef.current) {
        await soundRef.current.pauseAsync().catch(() => { });
        setIsPlayingAudio(false);
      }
      return;
    }

    if (!AudioAssets[audioKey]) return;

    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync().catch(() => null);
        if (status && status.isLoaded && !status.didJustFinish) {
          await soundRef.current.playAsync();
          setIsPlayingAudio(true);
          return;
        }
      }

      await stopAudio();
      const myId = ++soundInstanceIdRef.current;

      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const { sound } = await Audio.Sound.createAsync(
        AudioAssets[audioKey],
        {
          shouldPlay: true,
          isLooping,
          rate: playbackRate,
          shouldCorrectPitch: true,
        }
      );

      if (soundInstanceIdRef.current !== myId) {
        sound.unloadAsync().catch(() => { });
        return;
      }

      soundRef.current = sound;
      setIsPlayingAudio(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (soundInstanceIdRef.current !== myId) return;
        if (!status.isLoaded) return;

        setIsPlayingAudio(status.isPlaying);
        if (status.durationMillis && status.durationMillis > 0) {
          setAudioProgress((status.positionMillis || 0) / status.durationMillis);
        }
        if (status.didJustFinish && !isLooping) {
          setIsPlayingAudio(false);
          setAudioProgress(0);
        }
      });
    } catch (e) {
      console.log('Audio playback error', e);
      setIsPlayingAudio(false);
    }
  };

  const handleSlowDown = () => {
    const currentIdx = MODAL_SPEED_PRESETS.indexOf(playbackRate);
    if (currentIdx > 0) {
      const newRate = MODAL_SPEED_PRESETS[currentIdx - 1];
      setPlaybackRate(newRate);
      if (soundRef.current) {
        soundRef.current.setRateAsync(newRate, true, Audio.PitchCorrectionQuality.High).catch(() => { });
      }
    }
  };

  const handleSpeedUp = () => {
    const currentIdx = MODAL_SPEED_PRESETS.indexOf(playbackRate);
    if (currentIdx < MODAL_SPEED_PRESETS.length - 1) {
      const newRate = MODAL_SPEED_PRESETS[currentIdx + 1];
      setPlaybackRate(newRate);
      if (soundRef.current) {
        soundRef.current.setRateAsync(newRate, true, Audio.PitchCorrectionQuality.High).catch(() => { });
      }
    }
  };

  const toggleLoop = () => {
    const newLoop = !isLooping;
    setIsLooping(newLoop);
    if (soundRef.current) {
      soundRef.current.setIsLoopingAsync(newLoop).catch(() => { });
    }
  };

  // ── Learn Tab Theme (Dynamic for Light & Dark Mode) ─────────────────────────
  const THEME = isDarkMode
    ? {
      bg: '#020B1C',
      cardBg: '#05142E',
      cardBgActive: '#0A2552',
      cardInner: '#020A1A',
      border: '#183B70',
      borderSubtle: 'rgba(255, 255, 255, 0.08)',
      accent: '#3B82F6',
      accentLight: '#60A5FA',
      accentSoft: 'rgba(96, 165, 250, 0.15)',
      textPrimary: '#FFFFFF',
      textSecondary: '#94A3B8',
      closeBtnBg: 'rgba(255, 255, 255, 0.08)',
      closeBtnBorder: 'rgba(255, 255, 255, 0.12)',
      audioTrackBg: 'rgba(255, 255, 255, 0.08)',
      pillBg: 'rgba(255, 255, 255, 0.05)',
      poseCardBadgeBg: 'rgba(2, 11, 28, 0.85)',
      shadowColor: '#000000',
    }
    : {
      bg: '#F8FAFC',
      cardBg: '#FFFFFF',
      cardBgActive: '#EFF6FF',
      cardInner: '#F1F5F9',
      border: '#E2E8F0',
      borderSubtle: 'rgba(0, 0, 0, 0.06)',
      accent: '#2563EB',
      accentLight: '#2563EB',
      accentSoft: '#EFF6FF',
      textPrimary: '#0F172A',
      textSecondary: '#64748B',
      closeBtnBg: '#F1F5F9',
      closeBtnBorder: '#E2E8F0',
      audioTrackBg: '#E2E8F0',
      pillBg: '#F8FAFC',
      poseCardBadgeBg: 'rgba(15, 23, 42, 0.75)',
      shadowColor: '#64748B',
    };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalRoot, { backgroundColor: THEME.bg }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} translucent={true} backgroundColor="transparent" />

        {/* Top Header Bar with dynamic safe area inset padding */}
        <View
          style={[
            styles.modalHeader,
            {
              backgroundColor: THEME.bg,
              borderBottomColor: THEME.borderSubtle,
              paddingTop: topInset + 8,
            },
          ]}
        >
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="sparkles" size={17} color={THEME.accentLight} />
              <Text style={[styles.modalHeaderTitle, { color: THEME.textPrimary }]} numberOfLines={1}>
                Major Poses & Recitations
              </Text>
            </View>
            <Text style={[styles.modalHeaderSubtitle, { color: THEME.textSecondary }]}>
              ارکانِ نماز اور تلاوت • 6 Core Salah Postures
            </Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            style={[styles.closeBtn, { backgroundColor: THEME.closeBtnBg, borderColor: THEME.closeBtnBorder }]}
          >
            <Ionicons name="close" size={20} color={THEME.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── Single unified ScrollView — thumbnails + content scroll together ── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollBody, { paddingBottom: bottomInset + 30 }]}
        >
          {/* Pose Card Selector — scrolls with the page */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.poseCardStripContent}
            style={[styles.poseCardStrip, { borderBottomColor: THEME.borderSubtle }]}
          >
            {MAJOR_POSES.map((pose, index) => {
              const isSelected = pose.id === activePoseId;
              return (
                <TouchableOpacity
                  key={pose.id}
                  onPress={() => setActivePoseId(pose.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.poseBigCard,
                    {
                      borderColor: isSelected ? THEME.accent : THEME.border,
                      shadowColor: isSelected ? THEME.accent : 'transparent',
                      elevation: isSelected ? 4 : 1,
                      transform: [{ scale: isSelected ? 1.0 : 0.96 }],
                    },
                  ]}
                >
                  <View style={[styles.poseBigCardInner, { backgroundColor: isSelected ? THEME.cardBgActive : THEME.cardBg }]}>
                    <View style={[styles.poseBigCardNumBadge, { backgroundColor: isSelected ? THEME.accent : THEME.poseCardBadgeBg }]}>
                      <Text style={[styles.poseBigCardNumText, { color: '#FFFFFF' }]}>
                        {String(index + 1).padStart(2, '0')}
                      </Text>
                    </View>
                    <Image
                      source={ImageAssets[pose.image]}
                      style={styles.poseBigCardImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={isSelected
                        ? ['transparent', 'rgba(37, 99, 235, 0.5)', '#1D4ED8']
                        : isDarkMode
                          ? ['transparent', 'rgba(2, 11, 28, 0.75)', THEME.cardBg]
                          : ['transparent', 'rgba(15, 23, 42, 0.65)', 'rgba(15, 23, 42, 0.95)']}
                      style={styles.poseBigCardGradient}
                    >
                      <Text style={[styles.poseBigCardTitle, { color: '#FFFFFF' }]} numberOfLines={2}>
                        {pose.title.en.split('—')[0].trim()}
                      </Text>
                      <Text style={[styles.poseBigCardUrdu, { color: isSelected ? '#E0E7FF' : 'rgba(255,255,255,0.8)' }]} numberOfLines={1}>
                        {pose.title.ur}
                      </Text>
                    </LinearGradient>
                    {isSelected && (
                      <View style={[styles.poseBigCardCheckRing, { borderColor: THEME.accentLight }]}>
                        <View style={[styles.poseBigCardCheckDot, { backgroundColor: THEME.accent }]}>
                          <Ionicons name="checkmark" size={9} color="#FFFFFF" />
                        </View>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={{ paddingHorizontal: 16 }}>

            {/* Pose Hero Card */}
            <View style={[styles.poseHeroCard, { backgroundColor: THEME.cardBg, borderColor: THEME.border, shadowColor: THEME.shadowColor }]}>
              <View style={styles.poseHeroHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.poseHeroTitle, { color: THEME.textPrimary }]}>
                    {activePose.title.en}
                  </Text>
                  <Text style={[styles.poseHeroSubtitle, { color: THEME.accentLight }]}>
                    {activePose.title.ur}
                  </Text>
                </View>
                <View style={[styles.ratioBadge, { backgroundColor: THEME.accentSoft, borderColor: isDarkMode ? 'rgba(96, 165, 250, 0.35)' : 'rgba(37, 99, 235, 0.25)' }]}>
                  <Ionicons name="timer-outline" size={13} color={THEME.accentLight} style={{ marginRight: 4 }} />
                  <Text style={[styles.ratioBadgeText, { color: THEME.accentLight }]}>{activePose.badge}</Text>
                </View>
              </View>

              <Text style={[styles.poseDescription, { color: THEME.textSecondary }]}>
                {activePose.description.en} • {activePose.description.ur}
              </Text>

              {/* Large Image Frame */}
              <View style={[styles.imageContainer, { backgroundColor: THEME.cardInner, borderColor: THEME.borderSubtle, borderWidth: 1 }]}>
                <Image source={ImageAssets[activePose.image]} style={styles.poseImage} resizeMode="contain" />
              </View>
            </View>

            {/* Audio Recitation Controller Card */}
            <View style={[styles.audioCard, { backgroundColor: THEME.cardBg, borderColor: THEME.border, shadowColor: THEME.shadowColor }]}>
              <View style={styles.audioCardHeader}>
                <View style={styles.audioTitleGroup}>
                  <Ionicons name="musical-notes" size={17} color={THEME.accentLight} style={{ marginRight: 6 }} />
                  <Text style={[styles.audioCardTitle, { color: THEME.textPrimary }]}>Arabic Audio Recitation</Text>
                </View>
                <Text style={[styles.audioStatusText, { color: THEME.accentLight }]}>
                  {isPlayingAudio ? (isLooping ? 'Looping Audio...' : 'Playing Audio...') : 'Tap Play to Listen'}
                </Text>
              </View>

              {/* Main Play Row */}
              <View style={styles.audioControlsRow}>
                <TouchableOpacity onPress={() => playAudio(activePose.audioKey)} style={styles.playBtnWrapper}>
                  <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.playBtnGradient}>
                    <Ionicons
                      name={isPlayingAudio ? 'pause' : 'play'}
                      size={26}
                      color="#FFFFFF"
                      style={!isPlayingAudio ? { marginLeft: 2 } : undefined}
                    />
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.audioTrackWrapper}>
                  <View style={[styles.audioTrack, { backgroundColor: THEME.audioTrackBg }]}>
                    <View style={[styles.audioFill, { width: `${audioProgress * 100}%`, backgroundColor: THEME.accent }]} />
                  </View>
                  <Text style={[styles.audioDescText, { color: THEME.textSecondary }]}>
                    Listen to clear authentic recitation with Arabic script below
                  </Text>
                </View>
              </View>

              {/* Speed Up, Slow Down & Loop Controls Toolbar */}
              <View style={[styles.audioToolbar, { borderTopColor: THEME.borderSubtle }]}>
                <TouchableOpacity
                  onPress={handleSlowDown}
                  disabled={playbackRate <= 0.5}
                  style={[
                    styles.toolPillBtn,
                    {
                      backgroundColor: THEME.pillBg,
                      borderColor: THEME.border,
                      borderWidth: 1,
                      opacity: playbackRate <= 0.5 ? 0.4 : 1,
                    },
                  ]}
                >
                  <Ionicons name="remove-circle-outline" size={14} color={THEME.accentLight} style={{ marginRight: 4 }} />
                  <Text style={[styles.toolPillText, { color: THEME.accentLight }]}>Slow</Text>
                </TouchableOpacity>

                <View style={[styles.speedBadgePill, { backgroundColor: THEME.accentSoft, borderColor: isDarkMode ? THEME.accent : 'rgba(37, 99, 235, 0.3)' }]}>
                  <Text style={[styles.speedBadgeText, { color: THEME.accentLight }]}>
                    {playbackRate % 1 === 0 ? `${playbackRate.toFixed(0)}x` : `${playbackRate}x`}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleSpeedUp}
                  disabled={playbackRate >= 2.0}
                  style={[
                    styles.toolPillBtn,
                    {
                      backgroundColor: THEME.pillBg,
                      borderColor: THEME.border,
                      borderWidth: 1,
                      opacity: playbackRate >= 2.0 ? 0.4 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.toolPillText, { color: THEME.accentLight }]}>Fast</Text>
                  <Ionicons name="add-circle-outline" size={14} color={THEME.accentLight} style={{ marginLeft: 4 }} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={toggleLoop}
                  style={[
                    styles.loopPillBtn,
                    {
                      backgroundColor: isLooping ? THEME.accent : THEME.pillBg,
                      borderColor: isLooping ? THEME.accent : THEME.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Ionicons
                    name="repeat"
                    size={14}
                    color={isLooping ? '#FFFFFF' : THEME.accentLight}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.toolPillText,
                      {
                        color: isLooping ? '#FFFFFF' : THEME.accentLight,
                        fontWeight: isLooping ? '700' : '600',
                      },
                    ]}
                  >
                    {isLooping ? 'Looping' : 'Loop'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Verses & Phrases List */}
            <View style={styles.versesContainer}>
              {activePose.verses.map((verse, vIdx) => (
                <View key={`verse_${vIdx}`}>
                  {verse.section_title && (
                    <View style={[styles.sectionBanner, { backgroundColor: THEME.accentSoft, borderColor: THEME.accent }]}>
                      <Ionicons name="book-outline" size={14} color={THEME.accentLight} style={{ marginRight: 6 }} />
                      <Text style={[styles.sectionBannerText, { color: THEME.accentLight }]}>
                        {verse.section_title}
                      </Text>
                    </View>
                  )}

                  <View style={[styles.verseCard, { backgroundColor: THEME.cardBg, borderColor: THEME.border, shadowColor: THEME.shadowColor }]}>
                    <Text style={[styles.arabicText, { color: THEME.textPrimary }]}>
                      {verse.arabic}
                    </Text>
                    <Text style={[styles.transliterationText, { color: THEME.accentLight }]}>
                      {verse.transliteration}
                    </Text>
                    <Text style={[styles.translationUrText, { color: THEME.textSecondary }]}>
                      {verse.translation_ur}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  modalHeaderSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  poseCardStrip: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginBottom: 4,
  },
  poseCardStripContent: {
    paddingHorizontal: 16,
    gap: 10,
    alignItems: 'flex-start',
  },
  poseBigCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  poseBigCardInner: {
    flex: 1,
    borderRadius: 16.5,
    overflow: 'hidden',
  },
  poseBigCardNumBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  poseBigCardNumText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  poseBigCardImage: {
    width: '100%',
    height: '72%',
  },
  poseBigCardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 8,
    justifyContent: 'flex-end',
  },
  poseBigCardTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    lineHeight: 13,
    marginBottom: 2,
  },
  poseBigCardUrdu: {
    fontSize: 9,
    lineHeight: 13,
    textAlign: 'right',
  },
  poseBigCardCheckRing: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  poseBigCardCheckDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    // paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 12,
  },
  poseHeroCard: {
    borderRadius: 22,
    borderWidth: 1.2,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  poseHeroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  poseHeroTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  poseHeroSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  ratioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  ratioBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  poseDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  poseImage: {
    width: '92%',
    height: '92%',
  },
  audioCard: {
    borderRadius: 22,
    borderWidth: 1.2,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  audioCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  audioTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  audioStatusText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  audioControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  playBtnWrapper: {
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  playBtnGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioTrackWrapper: {
    flex: 1,
  },
  audioTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  audioFill: {
    height: '100%',
    borderRadius: 3,
  },
  audioDescText: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  audioToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  toolPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  toolPillText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  speedBadgePill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  speedBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  loopPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  versesContainer: {
    gap: 10,
    marginTop: 4,
  },
  sectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderLeftWidth: 3,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionBannerText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  verseCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.2,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  arabicText: {
    fontSize: 22,
    lineHeight: 38,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Geeza Pro' : 'serif',
    marginBottom: 8,
  },
  transliterationText: {
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '600',
    marginBottom: 6,
  },
  translationUrText: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'right',
  },
});
