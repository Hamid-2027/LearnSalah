import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  Modal,
  PanResponder,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageAssets, AudioAssets } from '../utils/assetsMap';
import { PhraseCard } from './PhraseCard';
import { useTheme } from '../store/hooks';
import { PrayerStepsBottomSheet, PrayerStepsBottomSheetHandle } from './PrayerStepsBottomSheet';

export interface Phrase {
  id: string;
  arabic: string;
  transliteration: string;
  translation_ur: string;
  audio_ar?: string;
}

export interface Pose {
  id: string;
  posture_img: string;
  label: { en: string; ur: string };
  phrases: Phrase[];
}

export interface Rakat {
  rakat_number: number;
  is_final_rakat?: boolean;
  poses: Pose[];
}

export interface PrayerData {
  prayer_id: string;
  title: { en: string; ur: string };
  total_rakats?: number;
  poses?: Pose[];
  rakats?: Rakat[];
}

interface PrayerPlayerProps {
  prayerData: PrayerData;
  onBack: () => void;
  hideHeader?: boolean;
}

const SPEED_OPTIONS = [0.5, 0.6, 0.75, 0.85, 1.0, 1.1, 1.25, 1.5, 1.75, 2.0];

// ── Full Arabic Pose View ─────────────────────────────────────────────────────
interface FullArabicPoseViewProps {
  poses: Pose[];
  rakatMap: { poseIndex: number; rakatNumber: number }[];
  bottomPadding: number;
  fontSize: number;
  onFontSizeToggle: () => void;
  onSwitchToGuided: () => void;
  initialPoseIndex?: number;
}

// Convert integer (1, 2, 3...) to Eastern Arabic numerals (١, ٢, ٣...)
const toArabicNum = (n: number): string => {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return n.toString().split('').map(d => digits[parseInt(d, 10)] || d).join('');
};

// Check if phrase is Bismillah
const isBismillahPhrase = (str: string): boolean => {
  if (!str) return false;
  return str.includes('\u0628\u0650\u0633\u0652\u0645\u0650') ||
    str.includes('\u0628\u0633\u0645') ||
    str.startsWith('بِسْمِ') ||
    str.startsWith('بسم');
};

const FullArabicPoseView: React.FC<FullArabicPoseViewProps> = ({
  poses,
  rakatMap,
  bottomPadding,
  fontSize,
  onFontSizeToggle,
  onSwitchToGuided,
  initialPoseIndex = 0,
}) => {
  const { colors } = useTheme();
  const [poseIdx, setPoseIdx] = useState(initialPoseIndex);
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const pose = poses[poseIdx];
  if (!pose) return null;

  const rakatNum = rakatMap[poseIdx]?.rakatNumber ?? 1;
  const accentColor = colors.primary;
  const hasImage = pose.posture_img && ImageAssets[pose.posture_img];

  const arabicFontSize = Math.max(16, fontSize + 3);
  const arabicLineHeight = arabicFontSize * 2.15;

  const handlePrev = () => {
    if (poseIdx > 0) {
      setPoseIdx(poseIdx - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };
  const handleNext = () => {
    if (poseIdx < poses.length - 1) {
      setPoseIdx(poseIdx + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  // Group phrases into Surahs and inline Ayahs (Mushaf layout)
  interface SurahGroup {
    id: string;
    surahTitleAr?: string;
    surahTitleEn?: string;
    bismillah?: string;
    verses: Array<{
      id: string;
      arabic: string;
      verseNumber?: number;
    }>;
  }

  const groups: SurahGroup[] = [];
  let currentGroup: SurahGroup | null = null;
  let bismillahCount = 0;
  let verseCounter = 0;

  pose.phrases.forEach((phrase, idx) => {
    const isBismi = isBismillahPhrase(phrase.arabic);
    if (isBismi) {
      bismillahCount++;
      verseCounter = 0; // Reset verse numbering for the new Surah
      const surahTitleAr =
        bismillahCount === 1
          ? 'سُورَةُ الْفَاتِحَةِ'
          : bismillahCount === 2
            ? 'سُورَةُ الإِخْلَاصِ'
            : `سُورَة ${bismillahCount}`;
      const surahTitleEn =
        bismillahCount === 1
          ? 'Surah Al-Fatiha'
          : bismillahCount === 2
            ? 'Surah Al-Ikhlas'
            : `Surah ${bismillahCount}`;

      currentGroup = {
        id: phrase.id || `surah_${bismillahCount}_${idx}`,
        surahTitleAr,
        surahTitleEn,
        bismillah: phrase.arabic,
        verses: [],
      };
      groups.push(currentGroup);
    } else {
      verseCounter++;
      if (!currentGroup) {
        currentGroup = {
          id: `group_0`,
          verses: [],
        };
        groups.push(currentGroup);
      }
      currentGroup.verses.push({
        id: phrase.id || `v_${idx}`,
        arabic: phrase.arabic,
        verseNumber: currentGroup.bismillah || pose.phrases.length > 1 ? verseCounter : undefined,
      });
    }
  });

  return (
    <View style={{ flex: 1 }}>
      {/* ── Top Bar with Menu Trigger matching Guided Mode ── */}
      <View style={[styles.progressSection, { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
        <View style={styles.progressCompactRow}>
          <MaterialCommunityIcons name="text-box-outline" size={13} color={accentColor} />
          <Text style={[styles.progressCompactLabel, { color: colors.textPrimary, flex: 1, marginLeft: 6 }]}>
            Full Arabic View · Pose {poseIdx + 1}/{poses.length}
          </Text>
          <TouchableOpacity
            onPress={() => setShowMenu(prev => !prev)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[
              styles.progressMenuTrigger,
              showMenu && { backgroundColor: accentColor + '20' },
            ]}
            accessibilityLabel="Menu"
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={17}
              color={showMenu ? accentColor : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Sleek Dropdown Context Menu (Inspired by Screenshot) ── */}
      {showMenu && (
        <>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
            style={styles.menuBackdrop}
          />
          <View
            style={[
              styles.dropdownMenu,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: '#000',
              },
            ]}
          >
            {/* Option 1: Guided Mode */}
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => { onSwitchToGuided(); setShowMenu(false); }}
              style={styles.dropdownItem}
            >
              <MaterialCommunityIcons
                name="book-open-page-variant-outline"
                size={17}
                color={colors.textPrimary}
                style={styles.dropdownItemIcon}
              />
              <Text style={[styles.dropdownItemLabel, { color: colors.textPrimary }]}>
                Guided Mode
              </Text>
            </TouchableOpacity>

            {/* Option 2: Full Arabic (Active) */}
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => setShowMenu(false)}
              style={[
                styles.dropdownItem,
                { backgroundColor: accentColor + '14' },
              ]}
            >
              <MaterialCommunityIcons
                name="text-box-outline"
                size={17}
                color={accentColor}
                style={styles.dropdownItemIcon}
              />
              <Text style={[styles.dropdownItemLabel, { color: accentColor, fontWeight: '700' }]}>
                Full Arabic
              </Text>
              <Ionicons name="checkmark" size={17} color={accentColor} />
            </TouchableOpacity>

            {/* Divider */}
            <View style={[styles.dropdownDivider, { backgroundColor: colors.border }]} />

            {/* Option 3: Font Size */}
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={onFontSizeToggle}
              style={styles.dropdownItem}
            >
              <Ionicons
                name="text-outline"
                size={17}
                color={colors.textPrimary}
                style={styles.dropdownItemIcon}
              />
              <Text style={[styles.dropdownItemLabel, { color: colors.textPrimary }]}>
                Font Size
              </Text>
              <Text style={[styles.dropdownItemTrailing, { color: accentColor }]}>
                A {fontSize}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={[
          fullArabicStyles.scrollContent,
          { paddingBottom: bottomPadding + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Pose Header Summary Card ─────────────────────────── */}
        <View
          style={[
            fullArabicStyles.poseHeaderCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={fullArabicStyles.poseHeaderTop}>
            <View style={[fullArabicStyles.rakatBadge, { backgroundColor: accentColor + '20' }]}>
              <Text style={[fullArabicStyles.rakatBadgeText, { color: accentColor }]}>
                Rakat {rakatNum}
              </Text>
            </View>
            {hasImage && (
              <Image
                source={ImageAssets[pose.posture_img]}
                style={fullArabicStyles.poseImage}
                resizeMode="contain"
              />
            )}
          </View>
          <Text style={[fullArabicStyles.poseTitleEn, { color: colors.textPrimary }]}>
            {pose.label.en}
          </Text>
          {pose.label.ur ? (
            <Text style={[fullArabicStyles.poseTitleUr, { color: colors.textSecondary }]}>
              {pose.label.ur}
            </Text>
          ) : null}
          <Text style={[fullArabicStyles.phraseCountLabel, { color: colors.textSecondary }]}>
            {pose.phrases.length} phrase{pose.phrases.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* ── Complete Arabic Quranic Card ────────────────────── */}
        {pose.phrases.length > 0 ? (
          <View
            style={[
              fullArabicStyles.arabicCard,
              { backgroundColor: colors.surface, borderColor: accentColor + '40' },
            ]}
          >
            <LinearGradient
              colors={[accentColor + '20', 'transparent']}
              style={fullArabicStyles.cardGradientTop}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />

            <View style={fullArabicStyles.cardHeaderRow}>
              <Ionicons name="book-outline" size={14} color={accentColor} style={{ marginRight: 6 }} />
              <Text style={[fullArabicStyles.cardHeaderText, { color: accentColor }]}>
                Complete Arabic · {pose.label.en}
              </Text>
            </View>

            <View style={[fullArabicStyles.topDivider, { backgroundColor: accentColor + '30' }]} />

            {/* Render Surahs: Bismillah on its own line, all Ayahs inline */}
            {groups.map((group, groupIdx) => {
              const isFirst = groupIdx === 0;

              return (
                <View key={group.id} style={[fullArabicStyles.surahSection, !isFirst && fullArabicStyles.surahSectionSpacing]}>
                  {/* Surah Title Banner */}
                  {group.surahTitleAr ? (
                    <View style={[fullArabicStyles.surahBannerBox, { backgroundColor: accentColor + '14', borderColor: accentColor + '45' }]}>
                      <Text style={[fullArabicStyles.surahBannerAr, { color: accentColor }]}>
                        {group.surahTitleAr}
                      </Text>
                      {group.surahTitleEn ? (
                        <Text style={[fullArabicStyles.surahBannerEn, { color: colors.textSecondary }]}>
                          {group.surahTitleEn}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}

                  {/* Standalone Centered Bismillah Line */}
                  {group.bismillah ? (
                    <View style={fullArabicStyles.bismillahFrame}>
                      <Text
                        style={[
                          fullArabicStyles.bismillahText,
                          {
                            fontSize: arabicFontSize + 2,
                            color: accentColor,
                            lineHeight: arabicLineHeight,
                          },
                        ]}
                      >
                        {group.bismillah}
                      </Text>
                      <View style={[fullArabicStyles.bismillahDividerLine, { backgroundColor: accentColor + '30' }]} />
                    </View>
                  ) : null}

                  {/* All Ayahs of this Surah flow continuously inline in one compact paragraph */}
                  {group.verses.length > 0 && (
                    <View style={fullArabicStyles.mushafParagraphWrapper}>
                      <Text
                        style={[
                          fullArabicStyles.arabicMushafText,
                          {
                            fontSize: arabicFontSize,
                            color: colors.textPrimary,
                            lineHeight: arabicLineHeight,
                          },
                        ]}
                      >
                        {group.verses.map((v, vIdx) => {
                          const verseNumAr = v.verseNumber ? toArabicNum(v.verseNumber) : '';
                          return (
                            <Text key={v.id}>
                              {v.arabic}
                              {' '}
                              {verseNumAr ? (
                                <Text style={[fullArabicStyles.ayatSymbolBadge, { color: accentColor }]}>
                                  {`\u06dd${verseNumAr} `}
                                </Text>
                              ) : (
                                vIdx < group.verses.length - 1 ? '   ' : ''
                              )}
                            </Text>
                          );
                        })}
                      </Text>
                    </View>
                  )}

                  {/* Divider between different Surahs in the same pose */}
                  {groupIdx < groups.length - 1 && (
                    <View style={[fullArabicStyles.surahDivider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              );
            })}

            {/* Bottom Ornamental Motif */}
            <View style={fullArabicStyles.bottomOrnamentRow}>
              <View style={[fullArabicStyles.ornamentLine, { backgroundColor: accentColor + '35' }]} />
              <Ionicons name="sparkles" size={15} color={accentColor} />
              <View style={[fullArabicStyles.ornamentLine, { backgroundColor: accentColor + '35' }]} />
            </View>
          </View>
        ) : (
          <View style={fullArabicStyles.noPhrasesBox}>
            <Ionicons name="time-outline" size={28} color={colors.textSecondary} />
            <Text style={[fullArabicStyles.noPhrasesText, { color: colors.textSecondary }]}>
              Transition pose — no recitation
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Bottom Navigation Bar ─────────────────────────────── */}
      <View
        style={[
          fullArabicStyles.navBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: bottomPadding,
          },
        ]}
      >
        <TouchableOpacity onPress={onFontSizeToggle} style={fullArabicStyles.fontSizeBtn}>
          <View style={[fullArabicStyles.fontSizeBadge, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[fullArabicStyles.fontSizeBadgeText, { color: accentColor }]}>
              A {arabicFontSize}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePrev}
          disabled={poseIdx === 0}
          style={[fullArabicStyles.navBtn, { opacity: poseIdx === 0 ? 0.3 : 1 }]}
        >
          <Ionicons name="chevron-back-circle" size={42} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={fullArabicStyles.poseCounter}>
          <Text style={[fullArabicStyles.poseCounterText, { color: accentColor }]}>
            {poseIdx + 1} / {poses.length}
          </Text>
          <Text style={[fullArabicStyles.poseCounterSub, { color: colors.textSecondary }]}>
            poses
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleNext}
          disabled={poseIdx === poses.length - 1}
          style={[fullArabicStyles.navBtn, { opacity: poseIdx === poses.length - 1 ? 0.3 : 1 }]}
        >
          <Ionicons name="chevron-forward-circle" size={42} color={accentColor} />
        </TouchableOpacity>

        <View style={fullArabicStyles.fontSizeBtn} />
      </View>
    </View>
  );
};

const fullArabicStyles = StyleSheet.create({
  scrollContent: { paddingTop: 10 },

  // Pose header
  poseHeaderCard: {
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  poseHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  rakatBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rakatBadgeText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.3 },
  poseTitleEn: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  poseTitleUr: { fontSize: 13, fontWeight: '500', marginTop: 2, opacity: 0.75 },
  phraseCountLabel: { fontSize: 11, marginTop: 4, opacity: 0.55 },
  poseImage: { width: 72, height: 90 },

  // Arabic content card
  arabicCard: {
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    overflow: 'hidden',
  },
  cardGradientTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 50,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardHeaderText: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase',
  },
  topDivider: { height: 1, marginBottom: 14, borderRadius: 1 },

  // Surah Section & Mushaf Layout
  surahSection: {
    width: '100%',
    alignItems: 'center',
  },
  surahSectionSpacing: {
    marginTop: 14,
    paddingTop: 8,
  },
  surahDivider: {
    height: 1,
    width: '85%',
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 1,
  },
  mushafParagraphWrapper: {
    width: '100%',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  arabicMushafText: {
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.4,
    writingDirection: 'rtl',
  },
  surahBlockWrapper: { marginTop: 8, marginBottom: 10, alignItems: 'center' },
  surahBannerBox: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10,
    width: '90%',
  },
  surahBannerAr: { fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  surahBannerEn: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  // Bismillah calligraphic frame
  bismillahFrame: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bismillahText: {
    textAlign: 'center', fontWeight: '700', letterSpacing: 0.8, writingDirection: 'rtl',
  },
  bismillahDividerLine: {
    height: 1, width: '55%', marginTop: 8, marginBottom: 12, borderRadius: 1, alignSelf: 'center',
  },

  ayatSymbolBadge: { fontWeight: '700', fontSize: 16 },

  // Bottom ornament
  bottomOrnamentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 10 },
  ornamentLine: { flex: 1, height: 1, borderRadius: 1 },

  // No-phrases placeholder
  noPhrasesBox: { marginHorizontal: 14, paddingVertical: 40, alignItems: 'center', gap: 10 },
  noPhrasesText: { fontSize: 14, fontStyle: 'italic' },

  // Bottom nav
  navBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1,
  },
  navBtn: { padding: 4 },
  poseCounter: { alignItems: 'center' },
  poseCounterText: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  poseCounterSub: { fontSize: 10, fontWeight: '500', letterSpacing: 0.5 },
  fontSizeBtn: { minWidth: 52, alignItems: 'center', justifyContent: 'center', padding: 6 },
  fontSizeBadge: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  fontSizeBadgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
});

// ── Build pose->rakat map for Full Arabic mode ──────────────────────────────
function buildPoseRakatMap(prayerData: PrayerData): { poseIndex: number; rakatNumber: number }[] {
  const map: { poseIndex: number; rakatNumber: number }[] = [];
  if (prayerData.rakats && prayerData.rakats.length > 0) {
    prayerData.rakats.forEach((rakat) => {
      rakat.poses.forEach((_, idx) => {
        map.push({ poseIndex: map.length, rakatNumber: rakat.rakat_number });
      });
    });
  } else if (prayerData.poses) {
    prayerData.poses.forEach((_, idx) => {
      map.push({ poseIndex: idx, rakatNumber: 1 });
    });
  }
  return map;
}

function buildSteps(prayerData: PrayerData) {
  const steps: { poseIndex: number; phraseIndex: number; rakatNumber: number }[] = [];
  if (prayerData.rakats && prayerData.rakats.length > 0) {
    let globalPoseIdx = 0;
    prayerData.rakats.forEach((rakat) => {
      rakat.poses.forEach((pose) => {
        if (pose.phrases.length === 0) {
          steps.push({ poseIndex: globalPoseIdx, phraseIndex: -1, rakatNumber: rakat.rakat_number });
        } else {
          pose.phrases.forEach((_, phi) => {
            steps.push({ poseIndex: globalPoseIdx, phraseIndex: phi, rakatNumber: rakat.rakat_number });
          });
        }
        globalPoseIdx++;
      });
    });
  } else if (prayerData.poses && prayerData.poses.length > 0) {
    prayerData.poses.forEach((pose, pi) => {
      if (pose.phrases.length === 0) {
        steps.push({ poseIndex: pi, phraseIndex: -1, rakatNumber: 1 });
      } else {
        pose.phrases.forEach((_, phi) => {
          steps.push({ poseIndex: pi, phraseIndex: phi, rakatNumber: 1 });
        });
      }
    });
  }
  return steps;
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}


// ── Draggable Floating Simulation Button ──────────────────────────────────────
export const PrayerPlayer = ({ prayerData, onBack, hideHeader = false }: PrayerPlayerProps) => {
  const [viewMode, setViewMode] = useState<'guided' | 'fullArabic'>('guided');
  const [showViewMenu, setShowViewMenu] = useState(false);
  const { isDarkMode, colors } = useTheme();

  const poses = useMemo<Pose[]>(() => {
    return (prayerData.poses && prayerData.poses.length > 0)
      ? prayerData.poses
      : (prayerData.rakats ? prayerData.rakats.flatMap((r) => r.poses) : []);
  }, [prayerData]);

  const insets = useSafeAreaInsets();
  // On Android, gesture nav bar is typically 48dp; fallback ensures controls are never hidden.
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 48 : 20) + 4;

  const steps = useMemo(() => buildSteps(prayerData), [prayerData]);
  const totalSteps = steps.length;

  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [fontSize, setFontSize] = useState(16);
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // ── Floating Simulation Button state ────────────────────────────────────────
  const simSheetRef = useRef<PrayerStepsBottomSheetHandle>(null);

  const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
  // FAB drag offset from its default bottom-right anchor position
  const fabDragOffset = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const fabIsDragging = useRef(false);
  const fabTouchStartTime = useRef(0);
  const fabPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 6 || Math.abs(gs.dy) > 6,
      onPanResponderGrant: (_, gs) => {
        fabDragOffset.setOffset({
          x: (fabDragOffset.x as any)._value,
          y: (fabDragOffset.y as any)._value,
        });
        fabDragOffset.setValue({ x: 0, y: 0 });
        fabIsDragging.current = false;
        fabTouchStartTime.current = Date.now();
      },
      onPanResponderMove: (_, gs) => {
        if (Math.abs(gs.dx) > 6 || Math.abs(gs.dy) > 6) fabIsDragging.current = true;
        Animated.event([null, { dx: fabDragOffset.x, dy: fabDragOffset.y }], { useNativeDriver: false })(_, gs);
      },
      onPanResponderRelease: (_, gs) => {
        fabDragOffset.flattenOffset();
        const wasTap = !fabIsDragging.current && (Date.now() - fabTouchStartTime.current) < 300;
        if (wasTap) {
          setShowSimSheet(true);
          return;
        }
        // Snap horizontally to nearest edge, clamp vertically
        const curX = (fabDragOffset.x as any)._value;
        const curY = (fabDragOffset.y as any)._value;
        // Default anchor is bottom-right; positive x goes left, positive y goes up from bottom
        // We allow moving anywhere but snap back to nearest horizontal side
        const snapX = curX < 0
          ? -(SCREEN_W - 62 - 16) // snap to left
          : 0; // snap to right (default)
        const clampedY = Math.max(-(SCREEN_H - 200), Math.min(curY, 80));
        Animated.spring(fabDragOffset, { toValue: { x: snapX, y: clampedY }, useNativeDriver: false, tension: 80, friction: 10 }).start();
      },
      onPanResponderTerminate: () => {
        fabDragOffset.flattenOffset();
      },
    })
  ).current;
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioPosition, setAudioPosition] = useState(0);

  const soundRef = useRef<Audio.Sound | null>(null);
  // Incremented every time a new sound is created; callbacks compare against this to detect staleness.
  const soundInstanceIdRef = useRef(0);
  const flatListRef = useRef<FlatList>(null);
  const isPlayingRef = useRef(false);
  const isLoopingRef = useRef(false);
  const stepIndexRef = useRef(0);
  const isMountedRef = useRef(true);
  const playbackRateRef = useRef(1.0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const speedModalAnim = useRef(new Animated.Value(0)).current;

  const playCurrentPhraseRef = useRef<((phrase: Phrase | null, rate: number, autoAdvance: boolean) => Promise<void>) | null>(null);

  const currentStep = steps[stepIndex] ?? steps[0];
  const currentPose = poses[currentStep?.poseIndex ?? 0];
  const currentPhraseIndex = currentStep?.phraseIndex ?? -1;
  const currentRakatNumber = currentStep?.rakatNumber ?? 1;
  const totalRakats = prayerData.total_rakats ?? 2;
  const phrases = currentPose?.phrases || [];
  const currentPhrase = currentPhraseIndex >= 0 ? phrases[currentPhraseIndex] : null;
  const overallProgress = totalSteps > 1 ? stepIndex / (totalSteps - 1) : 0;

  useEffect(() => { playbackRateRef.current = playbackRate; }, [playbackRate]);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const savedFont = await AsyncStorage.getItem('prayer_fontSize');
        if (savedFont !== null) {
          const f = parseInt(savedFont, 10);
          if (!isNaN(f)) setFontSize(f);
        }
      } catch (_) { }
    };
    load();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('prayer_fontSize', fontSize.toString()).catch(() => { });
  }, [fontSize]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: overallProgress,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [overallProgress]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1.0, duration: 150, useNativeDriver: true }).start();
    }
  }, [isPlaying]);

  const openSpeedPicker = () => {
    setShowSpeedPicker(true);
    Animated.spring(speedModalAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }).start();
  };

  const closeSpeedPicker = () => {
    Animated.timing(speedModalAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
      setShowSpeedPicker(false)
    );
  };

  const stopAndUnload = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (_) { }
      soundRef.current = null;
    }
  }, []);

  const playCurrentPhrase = useCallback(async (phrase: Phrase | null, rate: number, autoAdvance: boolean) => {
    // Capture a unique ID for this invocation. Any callback that sees a different
    // ID knows it belongs to a stale sound instance and must be ignored.
    const myId = ++soundInstanceIdRef.current;
    await stopAndUnload();

    if (!phrase || !phrase.audio_ar || !AudioAssets[phrase.audio_ar]) {
      if (autoAdvance && isPlayingRef.current) {
        setTimeout(() => {
          if (!isMountedRef.current || !isPlayingRef.current) return;
          if (soundInstanceIdRef.current !== myId) return; // stale — a newer call already started
          goToStepRef.current?.(stepIndexRef.current + 1, true);
        }, 1000);
      }
      return;
    }

    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const { sound, status: initialStatus } = await Audio.Sound.createAsync(
        AudioAssets[phrase.audio_ar],
        {
          shouldPlay: true,
          rate,
          isLooping: isLoopingRef.current,
          shouldCorrectPitch: true,
          pitchCorrectionQuality: Audio.PitchCorrectionQuality.High,
        }
      );

      // If component unmounted or a newer sound was requested while we were loading, discard.
      if (!isMountedRef.current || soundInstanceIdRef.current !== myId) {
        sound.unloadAsync().catch(() => { });
        return;
      }
      soundRef.current = sound;

      // ── Android fix ─────────────────────────────────────────────────────────
      // Android's ExoPlayer polls playback status every ~500 ms by default.
      // Short clips (e.g. Bismillah ~1 s) can finish entirely between two poll
      // cycles so didJustFinish is never delivered and autoplay stalls.
      // Setting a 100 ms interval makes the poll fine-grained enough to always
      // catch the finish event on Android without any iOS regression.
      if (Platform.OS === 'android') {
        sound.setProgressUpdateIntervalAsync(100).catch(() => { });
      }

      // ── Duration-based safety-net (Android only) ─────────────────────────
      // Even with a faster poll some devices may still miss didJustFinish for
      // very short clips. Schedule a fallback that fires after the clip's
      // known duration + a 350 ms buffer. The stale-ID guard ensures this is
      // a no-op if the status callback already advanced playback.
      if (autoAdvance && !isLoopingRef.current && Platform.OS === 'android') {
        const clipDurationMs =
          initialStatus.isLoaded && initialStatus.durationMillis
            ? initialStatus.durationMillis
            : 2000; // conservative fallback if duration unknown at load time
        const safetyDelay = Math.max(300, clipDurationMs / rate + 350);
        setTimeout(() => {
          if (!isMountedRef.current || !isPlayingRef.current) return;
          if (soundInstanceIdRef.current !== myId) return; // already advanced — no-op
          // Only advance if the sound actually finished (not just paused mid-way)
          sound.getStatusAsync().then((s) => {
            if (!s.isLoaded) return;
            if (soundInstanceIdRef.current !== myId) return;
            if (!isPlayingRef.current) return;
            // If still playing for some reason, let didJustFinish handle it
            if (s.isPlaying) return;
            // Clip finished but didJustFinish was missed — advance
            goToStepRef.current?.(stepIndexRef.current + 1, true);
          }).catch(() => { });
        }, safetyDelay);
      }

      const lastProgressUpdateRef = { current: 0 };

      sound.setOnPlaybackStatusUpdate((status) => {
        // Discard callbacks from stale sound instances.
        if (soundInstanceIdRef.current !== myId) return;
        if (!status.isLoaded || !isMountedRef.current) return;

        if (!isPlayingRef.current && status.isPlaying) {
          // User paused — stop the audio.
          sound.pauseAsync().catch(() => { });
        } else if (!isPlayingRef.current && !status.isPlaying) {
          setIsPlaying(false);
        }

        if (status.durationMillis && status.durationMillis > 0) {
          const pos = status.positionMillis ?? 0;
          if (Math.abs(pos - lastProgressUpdateRef.current) > 120 || pos === 0 || status.didJustFinish) {
            lastProgressUpdateRef.current = pos;
            setAudioDuration(status.durationMillis);
            setAudioPosition(pos);
            setAudioProgress(pos / status.durationMillis);
          }
        }

        if (status.didJustFinish && autoAdvance && isPlayingRef.current && !isLoopingRef.current) {
          goToStepRef.current?.(stepIndexRef.current + 1, true);
        }
      });
    } catch (e) {
      console.log('Audio error', e);
      if (autoAdvance && isPlayingRef.current) {
        setTimeout(() => {
          if (!isMountedRef.current || !isPlayingRef.current) return;
          if (soundInstanceIdRef.current !== myId) return;
          goToStepRef.current?.(stepIndexRef.current + 1, true);
        }, 800);
      }
    }
  }, [stopAndUnload]);

  useEffect(() => {
    playCurrentPhraseRef.current = playCurrentPhrase;
  }, [playCurrentPhrase]);

  const goToStepRef = useRef<((idx: number, autoPlay: boolean) => void) | null>(null);

  const goToStep = useCallback((idx: number, autoPlay: boolean) => {
    if (!isMountedRef.current) return;

    if (idx >= totalSteps) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setAudioProgress(0);
      setAudioDuration(0);
      setAudioPosition(0);
      stepIndexRef.current = 0;
      setStepIndex(0);
      stopAndUnload();
      return;
    }
    if (idx < 0) idx = 0;

    stepIndexRef.current = idx;
    setStepIndex(idx);

    const step = steps[idx];
    const pose = poses[step.poseIndex];
    const phrase = step.phraseIndex >= 0 ? pose?.phrases[step.phraseIndex] : null;

    if (autoPlay) {
      isPlayingRef.current = true;
      setIsPlaying(true);
      setAudioProgress(0);
      setAudioDuration(0);
      setAudioPosition(0);
      playCurrentPhraseRef.current?.(phrase, playbackRateRef.current, true);
    }
  }, [steps, totalSteps, poses, stopAndUnload]);

  useEffect(() => {
    if (
      currentPhraseIndex >= 0 &&
      currentPhraseIndex < phrases.length &&
      flatListRef.current
    ) {
      const timer = setTimeout(() => {
        if (
          flatListRef.current &&
          currentPhraseIndex >= 0 &&
          currentPhraseIndex < phrases.length
        ) {
          try {
            flatListRef.current.scrollToIndex({
              index: currentPhraseIndex,
              animated: true,
              viewPosition: 0.5,
            });
          } catch (_) { }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentPhraseIndex, currentStep?.poseIndex, phrases.length]);

  useEffect(() => {
    goToStepRef.current = goToStep;
  }, [goToStep]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setRateAsync(playbackRate, true, Audio.PitchCorrectionQuality.High).catch(() => { });
    }
  }, [playbackRate]);

  const renderPhraseItem = useCallback(
    ({ item, index }: { item: Phrase; index: number }) => (
      <PhraseCard phrase={item} isActive={index === currentPhraseIndex} fontSize={fontSize} />
    ),
    [currentPhraseIndex, fontSize]
  );

  const keyExtractor = useCallback((item: Phrase, idx: number) => `${item.id}_${idx}`, []);

  const handleScrollToIndexFailed = useCallback(
    (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
      const wait = new Promise((resolve) => setTimeout(resolve, 100));
      wait
        .then(() => {
          if (!flatListRef.current) return;
          const validIndex = Math.max(0, Math.min(info.index, phrases.length - 1));
          if (phrases.length > 0 && validIndex >= 0 && validIndex < phrases.length) {
            try {
              flatListRef.current.scrollToIndex({
                index: validIndex,
                animated: true,
                viewPosition: 0.5,
              });
            } catch (_) {
              const offset = info.averageItemLength * validIndex;
              flatListRef.current.scrollToOffset({ offset, animated: true });
            }
          }
        })
        .catch(() => { });
    },
    [phrases.length]
  );

  useEffect(() => {
    isMountedRef.current = true;
    isPlayingRef.current = false;
    setIsPlaying(false);

    return () => {
      isMountedRef.current = false;
      stopAndUnload();
    };
  }, []);

  const handlePlayPause = async () => {
    if (!isPlaying) {
      isPlayingRef.current = true;
      setIsPlaying(true);
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync().catch(() => null);
        if (status && status.isLoaded && !status.didJustFinish) {
          soundRef.current.playAsync().catch(() => { });
          return;
        }
      }
      playCurrentPhrase(currentPhrase, playbackRate, true);
    } else {
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (soundRef.current) soundRef.current.pauseAsync().catch(() => { });
    }
  };

  const handleNext = () => {
    const next = stepIndexRef.current + 1;
    if (next >= totalSteps) return;
    goToStep(next, true);
  };

  const handlePrev = () => {
    const prev = stepIndexRef.current - 1;
    if (prev < 0) return;
    goToStep(prev, true);
  };

  const handleSpeedSelect = (speed: number) => {
    setPlaybackRate(speed);
    playbackRateRef.current = speed;
    if (soundRef.current) soundRef.current.setRateAsync(speed, true, Audio.PitchCorrectionQuality.High).catch(() => { });
    setShowSpeedPicker(false);
  };

  const toggleLoop = () => {
    const newLoop = !isLooping;
    setIsLooping(newLoop);
    isLoopingRef.current = newLoop;
    if (soundRef.current) {
      soundRef.current.setIsLoopingAsync(newLoop).catch(() => { });
    }
  };

  const toggleFontSize = () => {
    setFontSize(prev => {
      const fontSizes = [10, 12, 14, 16, 18, 20, 22, 24];
      const nextIdx = fontSizes.indexOf(prev) + 1;
      return nextIdx > 0 && nextIdx < fontSizes.length ? fontSizes[nextIdx] : fontSizes[0];
    });
  };

  const accentColor = colors.primary;
  const progressBarBg = colors.surfaceSecondary;

  // Build pose->rakat map once for Full Arabic mode
  const poseRakatMap = useMemo(() => buildPoseRakatMap(prayerData), [prayerData]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={hideHeader ? ['left', 'right'] : ['top', 'left', 'right']}>
      {!hideHeader && (
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onBack} style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {prayerData.title.en}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Step {stepIndex + 1} of {totalSteps}
            </Text>
          </View>
          <View style={[styles.rakatBadge, { backgroundColor: colors.surfaceSecondary, borderColor: accentColor }]}>
            <Ionicons name="sparkles" size={11} color={accentColor} style={{ marginRight: 4 }} />
            <Text style={[styles.rakatBadgeText, { color: accentColor }]}>
              Rakat {currentRakatNumber}/{totalRakats}
            </Text>
          </View>
        </View>
      )}



      {/* ── Render content based on viewMode ── */}
      {viewMode === 'fullArabic' ? (
        /* ── Full Arabic View: pose-by-pose complete text (inline in guided mode) ── */
        <FullArabicPoseView
          poses={poses}
          rakatMap={poseRakatMap}
          bottomPadding={bottomPadding}
          fontSize={fontSize}
          onFontSizeToggle={toggleFontSize}
          onSwitchToGuided={() => setViewMode('guided')}
          initialPoseIndex={steps[stepIndex]?.poseIndex ?? 0}
        />
      ) : (
        /* ── Guided Tab: existing step-by-step recitation ── */
        <View style={{ flex: 1 }}>
          {/* ── Compact Progress Strip with Setting Icon ── */}
          <View style={[styles.progressSection, { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.progressCompactRow}>
              <Ionicons name="list-outline" size={12} color={colors.textSecondary} />
              <View style={[styles.progressTrack, { backgroundColor: progressBarBg, flex: 1, marginHorizontal: 8 }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>
              <Text style={[styles.progressCompactLabel, { color: accentColor }]}>
                {stepIndex + 1}/{totalSteps}
              </Text>
              {audioDuration > 0 && (
                <Text style={[styles.progressCompactLabel, { color: colors.textSecondary, marginLeft: 8 }]}>
                  {formatMs(audioPosition)}/{formatMs(audioDuration)}
                </Text>
              )}
              {/* Three-dots menu trigger */}
              <TouchableOpacity
                onPress={() => setShowViewMenu(prev => !prev)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[
                  styles.progressMenuTrigger,
                  showViewMenu && { backgroundColor: accentColor + '20' },
                ]}
                accessibilityLabel="Menu"
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={17}
                  color={showViewMenu ? accentColor : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Sleek Dropdown Context Menu (Inspired by Screenshot) ── */}
          {showViewMenu && (
            <>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setShowViewMenu(false)}
                style={styles.menuBackdrop}
              />
              <View
                style={[
                  styles.dropdownMenu,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    shadowColor: '#000',
                  },
                ]}
              >
                {/* Option 1: Guided Mode (Active) */}
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => setShowViewMenu(false)}
                  style={[
                    styles.dropdownItem,
                    { backgroundColor: accentColor + '14' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="book-open-page-variant-outline"
                    size={17}
                    color={accentColor}
                    style={styles.dropdownItemIcon}
                  />
                  <Text style={[styles.dropdownItemLabel, { color: accentColor, fontWeight: '700' }]}>
                    Guided Mode
                  </Text>
                  <Ionicons name="checkmark" size={17} color={accentColor} />
                </TouchableOpacity>

                {/* Option 2: Full Arabic */}
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => { setViewMode('fullArabic'); setShowViewMenu(false); }}
                  style={styles.dropdownItem}
                >
                  <MaterialCommunityIcons
                    name="text-box-outline"
                    size={17}
                    color={colors.textPrimary}
                    style={styles.dropdownItemIcon}
                  />
                  <Text style={[styles.dropdownItemLabel, { color: colors.textPrimary }]}>
                    Full Arabic
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={[styles.dropdownDivider, { backgroundColor: colors.border }]} />

                {/* Option 3: Font Size */}
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={toggleFontSize}
                  style={styles.dropdownItem}
                >
                  <Ionicons
                    name="text-outline"
                    size={17}
                    color={colors.textPrimary}
                    style={styles.dropdownItemIcon}
                  />
                  <Text style={[styles.dropdownItemLabel, { color: colors.textPrimary }]}>
                    Font Size
                  </Text>
                  <Text style={[styles.dropdownItemTrailing, { color: accentColor }]}>
                    A {fontSize}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── Horizontal Pose Card */}
          <View style={[styles.poseHorizCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.poseHorizTextSide]}>
              <View style={[styles.rakatHorizBadge, { backgroundColor: accentColor + '20' }]}>
                <Text style={[styles.rakatHorizBadgeText, { color: accentColor }]}>
                  {`Rakat ${currentRakatNumber}`}
                </Text>
              </View>
              <View style={{ marginLeft: 6 }}>
                <Text style={[styles.poseHorizTitleEn, { color: colors.textPrimary }]}>
                  {currentPose?.label?.en}
                </Text>
                {currentPose?.label?.ur ? (
                  <Text style={[styles.poseHorizTitleUr, { color: colors.textSecondary }]}>
                    {currentPose.label.ur}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.poseHorizImageSide}>
              {currentPose?.posture_img && ImageAssets[currentPose.posture_img] ? (
                <Image source={ImageAssets[currentPose.posture_img]} style={styles.poseHorizImage} resizeMode="contain" />
              ) : (
                <Ionicons name="person" size={64} color={colors.textSecondary} />
              )}
            </View>
          </View>

          {/* Phrase List */}
          {phrases.length > 0 ? (
            <FlatList
              key={`pose_list_${currentStep?.poseIndex ?? 0}`}
              ref={flatListRef}
              data={phrases}
              extraData={currentPhraseIndex}
              keyExtractor={keyExtractor}
              renderItem={renderPhraseItem}
              removeClippedSubviews={false}
              initialNumToRender={8}
              maxToRenderPerBatch={10}
              windowSize={5}
              onScrollToIndexFailed={handleScrollToIndexFailed}
              contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding + 80 }]}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyPhrasesContainer}>
              <Ionicons name="time-outline" size={32} color={colors.textSecondary} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyPhrasesText, { color: colors.textSecondary }]}>Transition — no recitation</Text>
            </View>
          )}

          {/* Compact Floating Speed Toolbar */}
          {showSpeedPicker && (
            <Animated.View
              style={[
                styles.compactSpeedToolbar,
                {
                  backgroundColor: colors.surface,
                  borderColor: accentColor,
                  shadowColor: accentColor,
                  bottom: bottomPadding + 62,
                },
              ]}
            >
              <View style={styles.compactSpeedHeaderRow}>
                <Ionicons name="speedometer-outline" size={13} color={accentColor} style={{ marginRight: 4 }} />
                <Text style={[styles.compactSpeedHeaderTitle, { color: colors.textSecondary }]}>SPEED</Text>
              </View>
              <View style={styles.speedScrollWrapper}>
                <Ionicons name="chevron-back" size={16} color={accentColor} style={{ marginRight: 4 }} />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.compactSpeedPillsRow}
                >
                  {SPEED_OPTIONS.map((speed) => {
                    const isSelected = Math.abs(playbackRate - speed) < 0.01;
                    return (
                      <TouchableOpacity
                        key={speed}
                        onPress={() => handleSpeedSelect(speed)}
                        style={[
                          styles.compactSpeedPill,
                          { backgroundColor: isSelected ? accentColor : colors.surfaceSecondary },
                        ]}
                      >
                        <Text
                          style={[
                            styles.compactSpeedPillText,
                            {
                              color: isSelected ? '#FFFFFF' : colors.textPrimary,
                              fontWeight: isSelected ? '700' : '600',
                            },
                          ]}
                        >
                          {speed % 1 === 0 ? `${speed.toFixed(0)}x` : `${speed}x`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <Ionicons name="chevron-forward" size={16} color={accentColor} style={{ marginLeft: 4 }} />
              </View>
            </Animated.View>
          )}

          {/* Controls Bar */}
          <View
            style={[
              styles.controlsContainer,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
                paddingBottom: bottomPadding,
              },
            ]}
          >
            {/* Speed Button */}
            <TouchableOpacity
              onPress={() => setShowSpeedPicker(prev => !prev)}
              style={styles.controlSideButton}
              accessibilityLabel="Playback speed"
            >
              <View style={[styles.speedBadge, { backgroundColor: showSpeedPicker ? accentColor : colors.surfaceSecondary }]}>
                <Text style={[styles.speedBadgeText, { color: showSpeedPicker ? '#FFFFFF' : accentColor }]}>
                  {playbackRate % 1 === 0 ? `${playbackRate.toFixed(0)}x` : `${playbackRate}x`}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Previous */}
            <TouchableOpacity
              onPress={handlePrev}
              style={[styles.controlSideButton, { opacity: stepIndex === 0 ? 0.35 : 1 }]}
              disabled={stepIndex === 0}
            >
              <Ionicons name="play-skip-back" size={26} color={colors.textPrimary} />
            </TouchableOpacity>

            {/* Play/Pause */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity onPress={handlePlayPause} style={styles.playButtonWrapper}>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.playButton}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={30}
                    color="#fff"
                    style={!isPlaying ? { marginLeft: 3 } : undefined}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Next */}
            <TouchableOpacity
              onPress={handleNext}
              style={[styles.controlSideButton, { opacity: stepIndex >= totalSteps - 1 ? 0.35 : 1 }]}
              disabled={stepIndex >= totalSteps - 1}
            >
              <Ionicons name="play-skip-forward" size={26} color={colors.textPrimary} />
            </TouchableOpacity>

            {/* Font Size Toggle Button */}
            <TouchableOpacity onPress={toggleFontSize} style={styles.controlSideButton}>
              <View style={[styles.speedBadge, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.speedBadgeText, { color: accentColor }]}>A {fontSize}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Draggable Floating Simulation Button (hidden while playing) ── */}
      {!isPlaying && (
        <Animated.View
          style={[
            fabStyles.fabContainer,
            {
              bottom: bottomPadding + 72, // sits just above the controls bar
              right: 16,
              transform: [
                { translateX: fabDragOffset.x },
                { translateY: fabDragOffset.y },
              ],
            },
          ]}
          {...fabPanResponder.panHandlers}
        >
          <TouchableOpacity
            onPress={() => simSheetRef.current?.open()}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={fabStyles.fabGradient}
            >
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={fabStyles.fabLabel}>Visuals</Text>
            </LinearGradient>
            {/* Subtle glow ring */}
            <View style={[fabStyles.fabGlow, { borderColor: colors.primary }]} />
          </TouchableOpacity>
        </Animated.View>

      )
      }

      <PrayerStepsBottomSheet
        ref={simSheetRef}
        prayerData={prayerData}
      />
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Progress Bar Menu Trigger
  progressMenuTrigger: {
    marginLeft: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sleek Dropdown Context Menu (Inspired by Screenshot)
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 38,
    right: 12,
    width: 200,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 5,
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 14,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 9,
    marginVertical: 1,
  },
  dropdownItemIcon: {
    marginRight: 10,
  },
  dropdownItemLabel: {
    fontSize: 13.5,
    fontWeight: '500',
    letterSpacing: -0.1,
    flex: 1,
  },
  dropdownItemTrailing: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dropdownDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
    marginHorizontal: 8,
  },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  headerSubtitle: { fontSize: 12, marginTop: 1 },
  rakatBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  rakatBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  // Progress
  progressSection: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6, backgroundColor: 'transparent' },
  progressCompactRow: { flexDirection: 'row', alignItems: 'center' },
  progressCompactLabel: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.3 },
  progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, overflow: 'hidden' },
  progressShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.18)' },
  progressThumb: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#fff', marginRight: -5, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 0 }, shadowRadius: 4, elevation: 4 },
  stepDotsRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6, justifyContent: 'center' },
  stepDot: { borderRadius: 2 },
  audioProgressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  audioTrack: { flex: 1, height: 3, borderRadius: 2, overflow: 'hidden' },
  audioFill: { height: '100%', borderRadius: 2 },
  audioTimeText: { fontSize: 10, marginLeft: 6, minWidth: 50, textAlign: 'right' },

  // Standard Flexbox 3:1 (75% : 25%) Proportional Pose Card
  poseHorizCard: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 4,
    paddingHorizontal: 3,
    borderRadius: 16,
    borderWidth: 1,
    height: 150,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',

  },
  poseHorizImageSide: {
    // flex: 3.5, // 75-80% horizontal ratio for pose image
    width: '55%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  poseHorizImage: {
    width: '100%',
    height: '100%',
  },
  poseHorizTextSide: {
    width: '45%',
    paddingHorizontal: 6,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 4,
  },
  rakatHorizBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  rakatHorizBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  poseHorizTitleEn: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  poseHorizTitleUr: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.75,
  },
  // Legacy (kept for safety)
  imageCardContainer: { marginHorizontal: 16, marginTop: 8, marginBottom: 4, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  imageContainer: { height: 175, alignItems: 'center', justifyContent: 'center', padding: 6 },
  poseImage: { width: '100%', height: '100%' },
  poseTitleBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 9, paddingHorizontal: 16, borderTopWidth: 1 },
  poseTitleText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },

  // List
  listContent: { paddingBottom: 110, paddingTop: 4 },
  emptyPhrasesContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyPhrasesText: { fontSize: 14, fontStyle: 'italic' },

  // Compact Speed Toolbar
  compactSpeedToolbar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 88 : 74,
    left: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
    zIndex: 100,
  },
  compactSpeedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactSpeedHeaderTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  speedScrollWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactSpeedPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 8,
  },
  compactSpeedPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactSpeedPillText: {
    fontSize: 13,
  },

  // Controls
  controlsContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1 },
  controlSideButton: { padding: 6, alignItems: 'center', justifyContent: 'center', minWidth: 44 },
  speedBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  speedBadgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  playButtonWrapper: { shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 8 },
  playButton: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },

  // Speed Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end', paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  speedModal: { marginHorizontal: 16, borderRadius: 20, borderWidth: 1, overflow: 'hidden', paddingTop: 4 },
  speedModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth },
  speedModalTitle: { fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  speedOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 13, marginHorizontal: 10, marginVertical: 2, borderRadius: 12, borderWidth: 1 },
  speedOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectedDot: { width: 7, height: 7, borderRadius: 4 },
  speedOptionLabel: { fontSize: 15 },
  speedOptionRight: { flexDirection: 'row', alignItems: 'center' },
  speedValue: { fontSize: 16, fontWeight: '700' },
  speedCancelBtn: { alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, marginTop: 4 },
  speedCancelText: { fontSize: 15, fontWeight: '500' },
});

// ── Floating Action Button styles ─────────────────────────────────────────────
const fabStyles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
  },
  fabGradient: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  fabLabel: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  fabGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1.5,
    opacity: 0.3,
  },
});
