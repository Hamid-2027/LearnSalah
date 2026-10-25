import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../../store/hooks';

// Background Image Artworks for Challenges
const starterBg = require('../../assets/images/challenge_starter_bg.jpg');
const fortressBg = require('../../assets/images/challenge_fortress_bg.jpg');
const championBg = require('../../assets/images/challenge_champion_bg.jpg');

// Custom Professional SVG Badge Icons for Challenges
export const StarterSvgIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <SvgGradient id="starterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FBBF24" />
        <Stop offset="100%" stopColor="#F59E0B" />
      </SvgGradient>
    </Defs>
    <Path
      d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
      fill="url(#starterGrad)"
      stroke="#D97706"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ShieldSvgIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <SvgGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#60A5FA" />
        <Stop offset="100%" stopColor="#2563EB" />
      </SvgGradient>
    </Defs>
    <Path
      d="M12 2L4 5V11C4 16.55 7.4 21.74 12 23C16.6 21.74 20 16.55 20 11V5L12 2Z"
      fill="url(#shieldGrad)"
      stroke="#1D4ED8"
      strokeWidth="1.2"
    />
    <Path
      d="M12 7L13.2 9.8L16.2 10.1L13.9 12.1L14.6 15L12 13.5L9.4 15L10.1 12.1L7.8 10.1L10.8 9.8L12 7Z"
      fill="#FFFFFF"
      opacity="0.9"
    />
  </Svg>
);

export const CrownSvgIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <SvgGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#F59E0B" />
        <Stop offset="100%" stopColor="#D4AF37" />
      </SvgGradient>
    </Defs>
    <Path
      d="M3 18L1 6L7 10L12 3L17 10L23 6L21 18H3Z"
      fill="url(#crownGrad)"
      stroke="#B45309"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="4" r="1.5" fill="#FEF08A" />
    <Circle cx="1" cy="7" r="1.2" fill="#FEF08A" />
    <Circle cx="23" cy="7" r="1.2" fill="#FEF08A" />
    <Rect x="4" y="15.5" width="16" height="2" rx="1" fill="#FEF08A" opacity="0.8" />
  </Svg>
);

export const CustomPlusSvgIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" strokeDasharray="3 2" />
    <Path d="M12 7V17M7 12H17" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

export interface Challenge {
  id: string;
  title: string;
  daysTotal: number;
  prayersTotal: number;
  badge: string;
  iconType: 'starter' | 'shield' | 'crown' | 'custom';
  bgImage?: any;
  gradientColors: [string, string];
  description: string;
  isCustom?: boolean;
}

export const PREDEFINED_CHALLENGES: Challenge[] = [
  {
    id: '1_day',
    title: 'Istiqamah Starter',
    daysTotal: 1,
    prayersTotal: 5,
    badge: 'STARTER',
    iconType: 'starter',
    bgImage: starterBg,
    gradientColors: ['#FFF7ED', '#FFEDD5'],
    description: '1 Day • 5 Prayers',
  },
  {
    id: '3_day',
    title: 'Al-Muhafiz Fortress',
    daysTotal: 3,
    prayersTotal: 15,
    badge: 'FORTRESS',
    iconType: 'shield',
    bgImage: fortressBg,
    gradientColors: ['#EFF6FF', '#DBEAFE'],
    description: '3 Days • 15 Prayers',
  },
  {
    id: '7_day',
    title: 'As-Salah Champion',
    daysTotal: 7,
    prayersTotal: 35,
    badge: 'CHAMPION',
    iconType: 'crown',
    bgImage: championBg,
    gradientColors: ['#FEFCE8', '#FEF08A'],
    description: '7 Days • 35 Prayers',
  },
];

interface ChallengeCardsSectionProps {
  onChallengeChange?: (challenge: Challenge | null) => void;
}

export const ChallengeCardsSection: React.FC<ChallengeCardsSectionProps> = ({ onChallengeChange }) => {
  const { isDarkMode, colors } = useTheme();

  const [challengesList, setChallengesList] = useState<Challenge[]>(PREDEFINED_CHALLENGES);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [challengeDay, setChallengeDay] = useState(1);
  const [prayersCompletedCount, setPrayersCompletedCount] = useState(0);

  // Custom challenge form state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDays, setNewDays] = useState(5);
  const [selectedIconType, setSelectedIconType] = useState<'starter' | 'shield' | 'crown' | 'custom'>('starter');

  const startChallenge = (ch: Challenge) => {
    setActiveChallenge(ch);
    setChallengeDay(1);
    setPrayersCompletedCount(0);
    onChallengeChange?.(ch);
  };

  const leaveChallenge = () => {
    setActiveChallenge(null);
    onChallengeChange?.(null);
  };

  const incrementProgress = () => {
    if (!activeChallenge) return;
    setPrayersCompletedCount((prev) => Math.min(activeChallenge.prayersTotal, prev + 1));
  };

  const handleCreateCustomChallenge = () => {
    const titleToUse = newTitle.trim() || `${newDays}-Day Custom Challenge`;
    const totalPr = newDays * 5;
    const newCh: Challenge = {
      id: `custom_${Date.now()}`,
      title: titleToUse,
      daysTotal: newDays,
      prayersTotal: totalPr,
      badge: `${newDays} DAYS`,
      iconType: selectedIconType,
      bgImage: starterBg,
      gradientColors: ['#EFF6FF', '#DBEAFE'],
      description: `${newDays} Days • ${totalPr} Prayers`,
      isCustom: true,
    };
    setChallengesList((prev) => [newCh, ...prev]);
    startChallenge(newCh);
    setNewTitle('');
    setCreateModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {activeChallenge ? (
        /* ── Active Challenge Tracker Banner (WITH RICH ARTWORK BG) ── */
        <View style={styles.activeChallengeWrapper}>
          <ImageBackground
            source={activeChallenge.bgImage || starterBg}
            style={styles.activeChallengeBg}
            imageStyle={{ borderRadius: 20, opacity: 0.95 }}
          >
            <LinearGradient
              colors={['rgba(7, 13, 24, 0.85)', 'rgba(15, 26, 46, 0.92)']}
              style={styles.activeChallengeCardOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.activeChallengeHeader}>
                <View style={styles.activeSvgIconBox}>
                  {activeChallenge.iconType === 'starter' && <StarterSvgIcon size={26} />}
                  {activeChallenge.iconType === 'shield' && <ShieldSvgIcon size={26} />}
                  {activeChallenge.iconType === 'crown' && <CrownSvgIcon size={26} />}
                  {(!activeChallenge.iconType || activeChallenge.iconType === 'custom') && (
                    <CustomPlusSvgIcon size={26} color="#60A5FA" />
                  )}
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.activeChallengeTitle} numberOfLines={1}>
                      {activeChallenge.title}
                    </Text>
                    <View style={styles.activeLevelPill}>
                      <Text style={styles.activeLevelText}>{activeChallenge.badge}</Text>
                    </View>
                  </View>

                  <Text style={styles.activeChallengeSubtitle}>
                    Day {challengeDay} of {activeChallenge.daysTotal} • {prayersCompletedCount}/{activeChallenge.prayersTotal} Prayers Done
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.leaveChallengeBtn}
                  onPress={leaveChallenge}
                  activeOpacity={0.8}
                >
                  <Text style={styles.leaveChallengeText}>Leave</Text>
                </TouchableOpacity>
              </View>

              {/* Progress Track */}
              <View style={styles.activeProgressContainer}>
                <View style={styles.progressTrack}>
                  <LinearGradient
                    colors={['#3B82F6', '#60A5FA', '#E2B842']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          100,
                          Math.max(5, (prayersCompletedCount / activeChallenge.prayersTotal) * 100)
                        )}%`,
                      },
                    ]}
                  />
                </View>

                <View style={styles.progressFooterRow}>
                  <Text style={styles.progressPctText}>
                    {Math.round((prayersCompletedCount / activeChallenge.prayersTotal) * 100)}% Complete
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.streakText}>
                      ⚡ {prayersCompletedCount} Completed
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={incrementProgress}
                      style={styles.checkInBtn}
                    >
                      <Ionicons name="add" size={14} color="#FFFFFF" />
                      <Text style={styles.checkInBtnText}>Log</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>
      ) : (
        /* ── Compact Executive Challenge Tags Carousel with VIBRANT ARTWORK BGs ── */
        <View style={styles.challengesSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="trophy" size={16} color="#F59E0B" />
              <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>
                Find Your Challenges
              </Text>
            </View>
            <Text style={[styles.sectionSubtitleText, { color: colors.textSecondary }]}>
              See more
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.challengesTagCarouselContainer}
          >
            {challengesList.map((ch) => (
              <TouchableOpacity
                key={ch.id}
                activeOpacity={0.8}
                onPress={() => startChallenge(ch)}
                style={styles.challengeTagCardWrapper}
              >
                <ImageBackground
                  source={ch.bgImage || starterBg}
                  style={styles.challengeTagCardBg}
                  imageStyle={{ borderRadius: 18, opacity: 0.95 }}
                >
                  <LinearGradient
                    colors={['rgba(7, 13, 24, 0.75)', 'rgba(15, 26, 46, 0.85)']}
                    style={styles.tagCardOverlay}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.tagSvgIconBadge}>
                      {ch.iconType === 'starter' && <StarterSvgIcon size={22} />}
                      {ch.iconType === 'shield' && <ShieldSvgIcon size={22} />}
                      {ch.iconType === 'crown' && <CrownSvgIcon size={22} />}
                      {(!ch.iconType || ch.iconType === 'custom') && (
                        <CustomPlusSvgIcon size={22} color="#60A5FA" />
                      )}
                    </View>

                    <View style={styles.tagTextGroup}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.tagTitleText} numberOfLines={1}>
                          {ch.title}
                        </Text>
                        <View style={styles.tagBadgePill}>
                          <Text style={styles.tagBadgePillText}>{ch.daysTotal}d</Text>
                        </View>
                      </View>
                      <Text style={styles.tagSubText}>
                        {ch.prayersTotal} prayers streak
                      </Text>
                    </View>

                    <View style={styles.tagArrowBox}>
                      <Ionicons name="chevron-forward" size={13} color="#FFFFFF" />
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}

            {/* Plus Custom Challenge Tag Pill */}
            <TouchableOpacity
              activeOpacity={0.78}
              onPress={() => setCreateModalVisible(true)}
              style={[
                styles.plusCustomTagCard,
                {
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  borderColor: colors.primary + '60',
                },
              ]}
            >
              <View style={[styles.tagSvgIconBadgeCustom, { backgroundColor: colors.primary + '15' }]}>
                <CustomPlusSvgIcon size={20} color={colors.primary} />
              </View>

              <View style={styles.tagTextGroup}>
                <Text style={[styles.tagTitleTextCustom, { color: colors.primary }]}>Create Custom</Text>
                <Text style={[styles.tagSubTextCustom, { color: colors.textSecondary }]}>Set custom goal</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ── Create Custom Challenge Modal ── */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDarkMode ? '#171717' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFF' : '#1A1A1A' }]}>
                  Create Custom Challenge
                </Text>
                <Text style={[styles.modalSubtitle, { color: isDarkMode ? '#A59B85' : '#665C4D' }]}>
                  Set your duration, title & badge icon
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCreateModalVisible(false)}
                style={[styles.modalCloseBtn, { backgroundColor: isDarkMode ? '#282828' : '#F4EFE6' }]}
              >
                <Ionicons name="close" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 6 }}>
              {/* Challenge Name Input */}
              <Text style={[styles.formLabel, { color: isDarkMode ? '#FFF' : '#1A1A1A' }]}>
                Challenge Name
              </Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: isDarkMode ? '#222' : '#FBFBFB',
                    color: isDarkMode ? '#FFF' : '#1A1A1A',
                    borderColor: colors.border,
                  },
                ]}
                placeholder="e.g. My 5-Day Salah Discipline"
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              {/* Number of Days Selection Chips */}
              <Text style={[styles.formLabel, { color: isDarkMode ? '#FFF' : '#1A1A1A', marginTop: 14 }]}>
                Duration (Days)
              </Text>
              <View style={styles.chipRow}>
                {[1, 3, 5, 7, 14, 21, 30].map((d) => {
                  const isSelected = newDays === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setNewDays(d)}
                      style={[
                        styles.chipBtn,
                        {
                          backgroundColor: isSelected ? colors.primary : isDarkMode ? '#222' : '#F4EFE6',
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFF' : isDarkMode ? '#FFF' : '#1A1A1A' },
                        ]}
                      >
                        {d} {d === 1 ? 'Day' : 'Days'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* SVG Icon Badge Selection */}
              <Text style={[styles.formLabel, { color: isDarkMode ? '#FFF' : '#1A1A1A', marginTop: 14 }]}>
                Select Badge Style
              </Text>
              <View style={styles.svgIconRow}>
                {(['starter', 'shield', 'crown', 'custom'] as const).map((iconKey) => {
                  const isSelected = selectedIconType === iconKey;
                  return (
                    <TouchableOpacity
                      key={iconKey}
                      onPress={() => setSelectedIconType(iconKey)}
                      style={[
                        styles.svgIconSelectBtn,
                        {
                          backgroundColor: isSelected ? colors.primary + '20' : isDarkMode ? '#222' : '#F4EFE6',
                          borderColor: isSelected ? colors.primary : 'transparent',
                        },
                      ]}
                    >
                      {iconKey === 'starter' && <StarterSvgIcon size={22} />}
                      {iconKey === 'shield' && <ShieldSvgIcon size={22} />}
                      {iconKey === 'crown' && <CrownSvgIcon size={22} />}
                      {iconKey === 'custom' && <CustomPlusSvgIcon size={22} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCreateCustomChallenge}
                style={[styles.submitChallengeBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.submitChallengeBtnText}>Create & Start Challenge</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },

  // Active Challenge Card
  activeChallengeWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  activeChallengeBg: {
    width: '100%',
  },
  activeChallengeCardOverlay: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  activeChallengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeSvgIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeChallengeTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  activeLevelPill: {
    backgroundColor: 'rgba(226, 184, 66, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(226, 184, 66, 0.4)',
  },
  activeLevelText: {
    color: '#E2B842',
    fontSize: 9,
    fontWeight: '800',
  },
  activeChallengeSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  leaveChallengeBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  leaveChallengeText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '700',
  },
  activeProgressContainer: {
    marginTop: 6,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  progressPctText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '800',
  },
  streakText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '800',
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(59, 130, 246, 0.35)',
    borderColor: 'rgba(96, 165, 250, 0.5)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  checkInBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Carousel Section
  challengesSection: {
    paddingVertical: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  sectionSubtitleText: {
    fontSize: 11,
    fontWeight: '500',
  },
  challengesTagCarouselContainer: {
    paddingVertical: 2,
    gap: 10,
  },
  challengeTagCardWrapper: {
    minWidth: 210,
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  challengeTagCardBg: {
    width: '100%',
    height: '100%',
  },
  tagCardOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  plusCustomTagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    minWidth: 160,
  },
  tagSvgIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tagSvgIconBadgeCustom: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  tagTextGroup: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  tagTitleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  tagTitleTextCustom: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  tagBadgePill: {
    backgroundColor: 'rgba(226, 184, 66, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(226, 184, 66, 0.4)',
  },
  tagBadgePillText: {
    color: '#E2B842',
    fontSize: 10,
    fontWeight: '800',
  },
  tagSubText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  tagSubTextCustom: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  tagArrowBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 22,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  svgIconRow: {
    flexDirection: 'row',
    gap: 12,
  },
  svgIconSelectBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitChallengeBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitChallengeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
