import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageAssets, AudioAssets } from '../utils/assetsMap';
import { useTheme } from '../context/ThemeContext';
import { PrayerData, Pose } from './PrayerPlayer';

interface PrayerSimulationProps {
  prayerData: PrayerData;
  onBack?: () => void;
}

export interface SimulationStep {
  globalIndex: number;
  rakatNumber: number;
  pose: Pose;
  durationMs: number;
  typeLabel: string;
}

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

function calculatePoseDuration(poseId: string, poseLabelEn: string): { durationMs: number; typeLabel: string } {
  const id = poseId.toLowerCase();
  const label = poseLabelEn.toLowerCase();

  if (id.includes('takbeer') || label.includes('takbeer')) {
    return { durationMs: 1000, typeLabel: 'Takbeer (1s)' };
  }
  if (id.includes('qiyam') || label.includes('qiyam') || label.includes('standing')) {
    return { durationMs: 3000, typeLabel: 'Qiyam (3s)' };
  }
  if (id.includes('ruku') || label.includes('ruku') || label.includes('bowing')) {
    return { durationMs: 2000, typeLabel: 'Ruku (2s)' };
  }
  if (id.includes('sujood') || id.includes('sajdah') || label.includes('sujood') || label.includes('sajdah')) {
    return { durationMs: 2000, typeLabel: 'Sajood (2s)' };
  }
  if (id.includes('tashahhud') || id.includes('qaidah') || label.includes('tashahhud') || label.includes('sitting')) {
    return { durationMs: 2000, typeLabel: 'Tashahhud (2s)' };
  }
  if (id.includes('salam') || label.includes('salam')) {
    return { durationMs: 2000, typeLabel: 'Salam (2s)' };
  }

  return { durationMs: 1500, typeLabel: 'Transition (1.5s)' };
}

function buildSimulationSteps(prayerData: PrayerData): SimulationStep[] {
  const steps: SimulationStep[] = [];
  let globalIdx = 0;

  if (prayerData.rakats && prayerData.rakats.length > 0) {
    prayerData.rakats.forEach((rakat) => {
      rakat.poses.forEach((pose) => {
        const { durationMs, typeLabel } = calculatePoseDuration(pose.id, pose.label.en);
        steps.push({
          globalIndex: globalIdx++,
          rakatNumber: rakat.rakat_number,
          pose,
          durationMs,
          typeLabel,
        });
      });
    });
  } else if (prayerData.poses && prayerData.poses.length > 0) {
    prayerData.poses.forEach((pose) => {
      const { durationMs, typeLabel } = calculatePoseDuration(pose.id, pose.label.en);
      steps.push({
        globalIndex: globalIdx++,
        rakatNumber: 1,
        pose,
        durationMs,
        typeLabel,
      });
    });
  }

  return steps;
}

const SPEED_PRESETS = [0.75, 1.0, 1.25, 1.5];
const MODAL_SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export const PrayerSimulation: React.FC<PrayerSimulationProps> = ({ prayerData }) => {
  const { isDarkMode, colors } = useTheme();
  const steps = useRef<SimulationStep[]>(buildSimulationSteps(prayerData)).current;
  const totalSteps = steps.length;
  const totalRakats = prayerData.total_rakats ?? 2;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [stepProgressRatio, setStepProgressRatio] = useState(0);

  // Selected Major Pose Modal State
  const [selectedMajorPose, setSelectedMajorPose] = useState<MajorPoseItem | null>(null);
  const [modalAudioPlaying, setModalAudioPlaying] = useState(false);
  const [modalAudioProgress, setModalAudioProgress] = useState(0);
  const [modalPlaybackRate, setModalPlaybackRate] = useState<number>(1.0);
  const [isModalLooping, setIsModalLooping] = useState<boolean>(false);
  const modalSoundRef = useRef<Audio.Sound | null>(null);

  const isPlayingRef = useRef(false);
  const speedRef = useRef(1.0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const overallProgressAnim = useRef(new Animated.Value(0)).current;

  const currentStep = steps[currentIndex] ?? steps[0];
  const overallProgress = totalSteps > 1 ? currentIndex / (totalSteps - 1) : 0;

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  // Smooth video transition between steps
  useEffect(() => {
    setStepProgressRatio(0);

    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.35, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1.0, duration: 250, useNativeDriver: true }),
    ]).start();

    Animated.timing(overallProgressAnim, {
      toValue: overallProgress,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [currentIndex, overallProgress]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1.0, duration: 150, useNativeDriver: true }).start();
    }
  }, [isPlaying]);

  const clearCurrentTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  const scheduleNextStep = (stepIdx: number) => {
    clearCurrentTimers();

    if (stepIdx >= totalSteps) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setCurrentIndex(0);
      setStepProgressRatio(0);
      return;
    }

    const step = steps[stepIdx];
    const targetDuration = step.durationMs / speedRef.current;
    startTimeRef.current = Date.now();

    const updateStepProgress = () => {
      if (!isPlayingRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const ratio = Math.min(elapsed / targetDuration, 1);
      setStepProgressRatio(ratio);

      if (ratio < 1) {
        animFrameRef.current = requestAnimationFrame(updateStepProgress);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateStepProgress);

    timerRef.current = setTimeout(() => {
      if (!isPlayingRef.current) return;
      const nextIdx = stepIdx + 1;
      if (nextIdx < totalSteps) {
        setCurrentIndex(nextIdx);
        scheduleNextStep(nextIdx);
      } else {
        setIsPlaying(false);
        isPlayingRef.current = false;
        setCurrentIndex(0);
        setStepProgressRatio(0);
      }
    }, targetDuration);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      clearCurrentTimers();
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;
      scheduleNextStep(currentIndex);
    }
  };

  const handleNext = () => {
    clearCurrentTimers();
    const nextIdx = currentIndex + 1;
    if (nextIdx < totalSteps) {
      setCurrentIndex(nextIdx);
      if (isPlayingRef.current) scheduleNextStep(nextIdx);
    }
  };

  const handlePrev = () => {
    clearCurrentTimers();
    const prevIdx = currentIndex - 1;
    if (prevIdx >= 0) {
      setCurrentIndex(prevIdx);
      if (isPlayingRef.current) scheduleNextStep(prevIdx);
    }
  };

  const handleRestart = () => {
    clearCurrentTimers();
    setCurrentIndex(0);
    setStepProgressRatio(0);
    if (isPlayingRef.current) scheduleNextStep(0);
  };

  const toggleSpeed = () => {
    const currentSpeedIdx = SPEED_PRESETS.indexOf(speedMultiplier);
    const nextSpeedIdx = (currentSpeedIdx + 1) % SPEED_PRESETS.length;
    const newSpeed = SPEED_PRESETS[nextSpeedIdx];
    setSpeedMultiplier(newSpeed);
    speedRef.current = newSpeed;

    if (isPlayingRef.current) scheduleNextStep(currentIndex);
  };

  // Major Pose Modal Audio Controller
  const stopModalAudio = useCallback(async () => {
    if (modalSoundRef.current) {
      try {
        await modalSoundRef.current.stopAsync();
        await modalSoundRef.current.unloadAsync();
      } catch (_) {}
      modalSoundRef.current = null;
    }
    setModalAudioPlaying(false);
    setModalAudioProgress(0);
  }, []);

  const openMajorPoseModal = (poseItem: MajorPoseItem) => {
    if (isPlaying) {
      clearCurrentTimers();
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
    stopModalAudio();
    setModalPlaybackRate(1.0);
    setIsModalLooping(false);
    setSelectedMajorPose(poseItem);
  };

  const closeModal = () => {
    stopModalAudio();
    setSelectedMajorPose(null);
  };

  const playModalAudio = async (audioKey: string) => {
    if (modalAudioPlaying) {
      if (modalSoundRef.current) {
        await modalSoundRef.current.pauseAsync().catch(() => {});
        setModalAudioPlaying(false);
      }
      return;
    }

    if (!AudioAssets[audioKey]) return;

    try {
      if (modalSoundRef.current) {
        const status = await modalSoundRef.current.getStatusAsync().catch(() => null);
        if (status && status.isLoaded && !status.didJustFinish) {
          await modalSoundRef.current.playAsync();
          setModalAudioPlaying(true);
          return;
        }
      }

      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const { sound } = await Audio.Sound.createAsync(
        AudioAssets[audioKey],
        {
          shouldPlay: true,
          isLooping: isModalLooping,
          rate: modalPlaybackRate,
          shouldCorrectPitch: true,
        }
      );
      modalSoundRef.current = sound;
      setModalAudioPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        setModalAudioPlaying(status.isPlaying);
        if (status.durationMillis && status.durationMillis > 0) {
          setModalAudioProgress(status.positionMillis / status.durationMillis);
        }
        if (status.didJustFinish && !isModalLooping) {
          setModalAudioPlaying(false);
          setModalAudioProgress(0);
        }
      });
    } catch (e) {
      console.log('Modal Audio Error', e);
      setModalAudioPlaying(false);
    }
  };

  const handleSlowDownModalAudio = () => {
    const currentIdx = MODAL_SPEED_PRESETS.indexOf(modalPlaybackRate);
    if (currentIdx > 0) {
      const newRate = MODAL_SPEED_PRESETS[currentIdx - 1];
      setModalPlaybackRate(newRate);
      if (modalSoundRef.current) {
        modalSoundRef.current.setRateAsync(newRate, true, Audio.PitchCorrectionQuality.High).catch(() => {});
      }
    }
  };

  const handleSpeedUpModalAudio = () => {
    const currentIdx = MODAL_SPEED_PRESETS.indexOf(modalPlaybackRate);
    if (currentIdx < MODAL_SPEED_PRESETS.length - 1) {
      const newRate = MODAL_SPEED_PRESETS[currentIdx + 1];
      setModalPlaybackRate(newRate);
      if (modalSoundRef.current) {
        modalSoundRef.current.setRateAsync(newRate, true, Audio.PitchCorrectionQuality.High).catch(() => {});
      }
    }
  };

  const toggleModalLoop = () => {
    const newLoop = !isModalLooping;
    setIsModalLooping(newLoop);
    if (modalSoundRef.current) {
      modalSoundRef.current.setIsLoopingAsync(newLoop).catch(() => {});
    }
  };

  useEffect(() => {
    return () => {
      clearCurrentTimers();
      stopModalAudio();
    };
  }, [stopModalAudio]);

  const accentColor = colors.primary;
  const progressBarBg = colors.surfaceSecondary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Video Simulation Viewport */}
        <View style={[styles.videoViewportContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Live Video Header Overlay */}
          <View style={styles.videoHeaderOverlay}>
            <View style={[styles.liveTag, { backgroundColor: colors.surfaceSecondary, borderColor: accentColor }]}>
              <View style={[styles.liveDot, { backgroundColor: isPlaying ? '#4CD964' : '#FF9500' }]} />
              <Text style={[styles.liveTagText, { color: accentColor }]}>
                {isPlaying ? 'SIMULATION RUNNING' : 'PAUSED'}
              </Text>
            </View>

            <View style={[styles.ratioTag, { backgroundColor: accentColor }]}>
              <Ionicons name="timer-outline" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={[styles.ratioTagText, { color: '#FFFFFF' }]}>
                {currentStep.typeLabel}
              </Text>
            </View>
          </View>

          {/* Smooth Video Image Display */}
          <Animated.View style={[styles.videoFrame, { opacity: fadeAnim }]}>
            {currentStep.pose.posture_img && ImageAssets[currentStep.pose.posture_img] ? (
              <Image
                source={ImageAssets[currentStep.pose.posture_img]}
                style={styles.videoImage}
                resizeMode="contain"
              />
            ) : (
              <Ionicons name="person" size={100} color={colors.textSecondary} />
            )}
          </Animated.View>

          {/* Pose Countdown Line */}
          <View style={[styles.poseTimerTrack, { backgroundColor: progressBarBg }]}>
            <View
              style={[
                styles.poseTimerFill,
                {
                  width: `${Math.min(stepProgressRatio * 100, 100)}%`,
                  backgroundColor: accentColor,
                },
              ]}
            />
          </View>

          {/* Video Title Bar */}
          <View style={[styles.videoTitleBar, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <View style={styles.titleTextRow}>
              <Text style={[styles.videoTitleText, { color: colors.textPrimary }]}>
                {currentStep.pose.label.en}
              </Text>

              <Text style={[styles.videoStepText, { color: colors.textSecondary }]}>
                Rakat {currentStep.rakatNumber}/{totalRakats} • Step {currentIndex + 1} of {totalSteps}
              </Text>
            </View>

            {/* Video Inline Controls */}
            <View style={styles.inlineControlsRow}>
              <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0} style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}>
                <Ionicons name="play-skip-back" size={20} color={colors.textPrimary} />
              </TouchableOpacity>

              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity onPress={togglePlayPause} style={styles.playButtonWrapper}>
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    style={styles.inlinePlayBtn}
                  >
                    <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#fff" style={!isPlaying ? { marginLeft: 2 } : undefined} />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity onPress={handleNext} disabled={currentIndex >= totalSteps - 1} style={{ opacity: currentIndex >= totalSteps - 1 ? 0.3 : 1 }}>
                <Ionicons name="play-skip-forward" size={20} color={colors.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleSpeed} style={[styles.speedPillBtn, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.speedPillText, { color: accentColor }]}>{speedMultiplier}x</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Major Command Poses Section */}
        <View style={styles.majorPosesSection}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="star-four-points-outline" size={18} color={accentColor} style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              MAJOR POSES & ARABIC RECITATIONS
            </Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Tap any pose below to view full recitations and listen to audio
          </Text>

          <View style={styles.majorPosesGrid}>
            {MAJOR_POSES.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => openMajorPoseModal(item)}
                style={[
                  styles.majorPoseCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.cardImageContainer, { backgroundColor: colors.background }]}>
                  <Image source={ImageAssets[item.image]} style={styles.cardImage} resizeMode="contain" />
                  <View style={[styles.cardRatioBadge, { backgroundColor: accentColor }]}>
                    <Text style={[styles.cardRatioText, { color: '#FFFFFF' }]}>{item.badge}</Text>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitleEn, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item.title.en}
                  </Text>
                  <Text style={[styles.cardTitleUr, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.title.ur}
                  </Text>

                  <View style={styles.cardActionRow}>
                    <Ionicons name="volume-medium-outline" size={14} color={accentColor} style={{ marginRight: 4 }} />
                    <Text style={[styles.cardActionText, { color: accentColor }]}>Full Recitation</Text>
                    <Ionicons name="chevron-forward" size={14} color={accentColor} style={{ marginLeft: 'auto' }} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Major Pose Recitation Modal */}
      {selectedMajorPose && (
        <Modal
          visible={!!selectedMajorPose}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackdrop}>
            <SafeAreaView style={[styles.modalContent, { backgroundColor: colors.background }]}>
              {/* Modal Top Bar */}
              <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <View style={styles.modalHeaderTitleGroup}>
                  <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>
                    {selectedMajorPose.title.en}
                  </Text>
                  <Text style={[styles.modalHeaderSubtitle, { color: colors.textSecondary }]}>
                    {selectedMajorPose.title.ur} • {selectedMajorPose.badge}
                  </Text>
                </View>

                <TouchableOpacity onPress={closeModal} style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="close" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScrollBody} showsVerticalScrollIndicator={true}>
                {/* Large Pose Image Showcase */}
                <View style={[styles.modalImageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.modalImageFrame, { backgroundColor: colors.background }]}>
                    <Image source={ImageAssets[selectedMajorPose.image]} style={styles.modalImage} resizeMode="contain" />
                  </View>
                </View>

                {/* Audio Recitation Controller Card */}
                <View style={[styles.audioCard, { backgroundColor: colors.surfaceSecondary, borderColor: accentColor }]}>
                  <View style={styles.audioCardHeader}>
                    <View style={styles.audioTitleGroup}>
                      <Ionicons name="musical-notes" size={18} color={accentColor} style={{ marginRight: 6 }} />
                      <Text style={[styles.audioCardTitle, { color: colors.textPrimary }]}>Arabic Audio Recitation</Text>
                    </View>
                    <Text style={[styles.audioStatusText, { color: accentColor }]}>
                      {modalAudioPlaying ? (isModalLooping ? 'Looping Audio...' : 'Playing Audio...') : 'Tap Play to Listen'}
                    </Text>
                  </View>

                  {/* Main Play Row */}
                  <View style={styles.audioControlsRow}>
                    <TouchableOpacity onPress={() => playModalAudio(selectedMajorPose.audioKey)} style={styles.modalPlayBtnWrapper}>
                      <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        style={styles.modalPlayBtn}
                      >
                        <Ionicons name={modalAudioPlaying ? 'pause' : 'play'} size={28} color="#FFFFFF" style={!modalAudioPlaying ? { marginLeft: 3 } : undefined} />
                      </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.audioTrackWrapper}>
                      <View style={[styles.modalAudioTrack, { backgroundColor: progressBarBg }]}>
                        <View style={[styles.modalAudioFill, { width: `${modalAudioProgress * 100}%`, backgroundColor: accentColor }]} />
                      </View>
                      <Text style={[styles.audioDescText, { color: colors.textSecondary }]}>
                        Listen to recitation while reading complete text below
                      </Text>
                    </View>
                  </View>

                  {/* Speed Up, Slow Down & Loop Controls Toolbar */}
                  <View style={[styles.modalAudioToolbar, { borderTopColor: colors.border }]}>
                    {/* Slow Down Button */}
                    <TouchableOpacity
                      onPress={handleSlowDownModalAudio}
                      disabled={modalPlaybackRate <= 0.5}
                      style={[
                        styles.toolPillBtn,
                        {
                          backgroundColor: colors.surfaceSecondary,
                          opacity: modalPlaybackRate <= 0.5 ? 0.4 : 1,
                        },
                      ]}
                    >
                      <Ionicons name="remove-circle-outline" size={15} color={accentColor} style={{ marginRight: 4 }} />
                      <Text style={[styles.toolPillText, { color: accentColor }]}>Slow Down</Text>
                    </TouchableOpacity>

                    {/* Speed Badge */}
                    <View style={[styles.speedBadgePill, { backgroundColor: colors.surface, borderColor: accentColor }]}>
                      <Text style={[styles.speedBadgeText, { color: accentColor }]}>
                        {modalPlaybackRate % 1 === 0 ? `${modalPlaybackRate.toFixed(0)}x` : `${modalPlaybackRate}x`}
                      </Text>
                    </View>

                    {/* Speed Up Button */}
                    <TouchableOpacity
                      onPress={handleSpeedUpModalAudio}
                      disabled={modalPlaybackRate >= 2.0}
                      style={[
                        styles.toolPillBtn,
                        {
                          backgroundColor: colors.surfaceSecondary,
                          opacity: modalPlaybackRate >= 2.0 ? 0.4 : 1,
                        },
                      ]}
                    >
                      <Text style={[styles.toolPillText, { color: accentColor }]}>Speed Up</Text>
                      <Ionicons name="add-circle-outline" size={15} color={accentColor} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>

                    {/* Loop Toggle Button */}
                    <TouchableOpacity
                      onPress={toggleModalLoop}
                      style={[
                        styles.loopPillBtn,
                        {
                          backgroundColor: isModalLooping ? accentColor : colors.surfaceSecondary,
                        },
                      ]}
                    >
                      <Ionicons
                        name="repeat"
                        size={15}
                        color={isModalLooping ? '#FFFFFF' : accentColor}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.toolPillText,
                          {
                            color: isModalLooping ? '#FFFFFF' : accentColor,
                            fontWeight: isModalLooping ? '700' : '600',
                          },
                        ]}
                      >
                        {isModalLooping ? 'Looping' : 'Loop'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Structured Full Recitations List */}
                <View style={styles.versesListContainer}>
                  {selectedMajorPose.verses.map((verse, vIdx) => (
                    <React.Fragment key={`v_${vIdx}`}>
                      {/* Optional Surah / Section Header */}
                      {verse.section_title && (
                        <View style={[styles.sectionTitleBanner, { backgroundColor: colors.surfaceSecondary, borderColor: accentColor }]}>
                          <Ionicons name="book-outline" size={15} color={accentColor} style={{ marginRight: 6 }} />
                          <Text style={[styles.sectionTitleText, { color: accentColor }]}>
                            {verse.section_title}
                          </Text>
                        </View>
                      )}

                      {/* Verse Card */}
                      <View style={[styles.verseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.verseHeaderRow}>
                          <View style={[styles.verseBadge, { backgroundColor: colors.surfaceSecondary }]}>
                            <Text style={[styles.verseBadgeText, { color: colors.textSecondary }]}>
                              Verse {vIdx + 1}
                            </Text>
                          </View>
                        </View>

                        {/* Arabic Verse */}
                        <Text style={[styles.arabicText, { color: colors.textPrimary }]}>
                          {verse.arabic}
                        </Text>

                        {/* Transliteration */}
                        <View style={styles.transliterationContainer}>
                          <Text style={[styles.transliterationText, { color: colors.textPrimary }]}>
                            {verse.transliteration}
                          </Text>
                        </View>

                        {/* Urdu Translation */}
                        <View style={[styles.translationContainer, { borderTopColor: colors.border }]}>
                          <Text style={[styles.urduText, { color: colors.textSecondary }]}>
                            {verse.translation_ur}
                          </Text>
                        </View>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  videoViewportContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  videoHeaderOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 10,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ratioTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratioTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  videoFrame: {
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  videoImage: {
    width: '100%',
    height: '100%',
  },
  poseTimerTrack: {
    height: 4,
    width: '100%',
  },
  poseTimerFill: {
    height: '100%',
  },
  videoTitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
  },
  titleTextRow: {
    flex: 1,
    marginRight: 8,
  },
  videoTitleText: {
    fontSize: 15,
    fontWeight: '700',
  },
  videoStepText: {
    fontSize: 11,
    marginTop: 2,
  },
  inlineControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playButtonWrapper: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  inlinePlayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedPillBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },
  speedPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Major Poses Grid Section
  majorPosesSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 3,
    marginBottom: 12,
  },
  majorPosesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  majorPoseCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImageContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardRatioBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cardRatioText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardContent: {
    padding: 10,
  },
  cardTitleEn: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardTitleUr: {
    fontSize: 11,
    marginTop: 1,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  cardActionText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalHeaderTitleGroup: {
    flex: 1,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalHeaderSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  modalScrollBody: {
    padding: 16,
    paddingBottom: 40,
  },
  modalImageCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  modalImageFrame: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  audioCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  audioCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  audioTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioCardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  audioStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  audioControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalPlayBtnWrapper: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 6,
    marginRight: 14,
  },
  modalPlayBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioTrackWrapper: {
    flex: 1,
  },
  modalAudioTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  modalAudioFill: {
    height: '100%',
    borderRadius: 3,
  },
  audioDescText: {
    fontSize: 11,
  },

  // Modal Audio Speed & Loop Toolbar
  modalAudioToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  toolPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  loopPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  toolPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  speedBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  speedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  versesListContainer: {
    gap: 12,
  },
  sectionTitleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 4,
  },
  sectionTitleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  verseCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  verseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  verseBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 42,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: Platform.OS === 'ios' ? 'Geeza Pro' : 'serif',
    marginVertical: 4,
  },
  transliterationContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  transliterationText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 21,
  },
  translationContainer: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  urduText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
