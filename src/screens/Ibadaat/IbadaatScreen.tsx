import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  Dimensions,
  StatusBar as RNStatusBar,
  Easing,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useIsFocused, useScrollToTop } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme, useSidebar } from '../../store/hooks';
import { PRAYERS_DATA, PrayerType } from '../../data/ibadaatData';
import { getSkyThemes, SkyThemeConfig } from '../../constants/skyThemes';
import { SunGraphic, FajrBirds, FajrCloud } from '../../components/SkyGraphics';
import { MajorPosesModal, MAJOR_POSES } from '../../components/MajorPosesModal';
import { ImageAssets } from '../../utils/assetsMap';

const { width } = Dimensions.get('window');

export const IbadaatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const { openSidebar } = useSidebar();
  const { t } = useTranslation();

  const [selectedPrayer, setSelectedPrayer] = useState<PrayerType>('Dhuhr');

  // Major Poses & Recitations Modal State
  const [showMajorPosesModal, setShowMajorPosesModal] = useState(false);
  const [selectedMajorPoseId, setSelectedMajorPoseId] = useState<string>('takbeer');

  const openMajorPoses = (poseId?: string) => {
    if (poseId) {
      setSelectedMajorPoseId(poseId);
    }
    setShowMajorPosesModal(true);
  };

  // Load screen width dependent themes configuration once
  const SKY_THEMES = useRef(getSkyThemes(width)).current;

  // Background Gradient Cross-fade States
  const [currentTheme, setCurrentTheme] = useState<SkyThemeConfig>(SKY_THEMES.Dhuhr);
  const [prevTheme, setPrevTheme] = useState<SkyThemeConfig>(SKY_THEMES.Dhuhr);
  const bgCrossfadeAnim = useRef(new Animated.Value(1)).current;

  // Trajectory Animations along Diurnal Arc
  const sunXAnim = useRef(new Animated.Value(SKY_THEMES.Dhuhr.sunX)).current;
  const sunYAnim = useRef(new Animated.Value(SKY_THEMES.Dhuhr.sunY)).current;
  const sunScaleAnim = useRef(new Animated.Value(SKY_THEMES.Dhuhr.sunScale)).current;
  const rayRotateAnim = useRef(new Animated.Value(0)).current;

  // Continuous Sun Rays Rotation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rayRotateAnim, {
        toValue: 1,
        duration: 22000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rayRotateAnim]);

  // Handle Prayer Switch with Smooth Diurnal Solar Arc Trajectory & Sky Cross-fade
  const handleSelectPrayer = (newPrayer: PrayerType) => {
    if (newPrayer === selectedPrayer) return;

    const newTheme = SKY_THEMES[newPrayer];
    setPrevTheme(currentTheme);
    setCurrentTheme(newTheme);
    setSelectedPrayer(newPrayer);

    // Reset cross-fade opacity and animate to 1
    bgCrossfadeAnim.setValue(0);
    Animated.timing(bgCrossfadeAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // Animate Sun along Diurnal Arc trajectory
    Animated.parallel([
      Animated.timing(sunXAnim, {
        toValue: newTheme.sunX,
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sunYAnim, {
        toValue: newTheme.sunY,
        duration: 1100,
        easing: Easing.out(Easing.back(1.05)),
        useNativeDriver: true,
      }),
      Animated.timing(sunScaleAnim, {
        toValue: newTheme.sunScale,
        duration: 1100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    if (isFocused) {
      RNStatusBar.setBarStyle(newTheme.isDarkContent ? 'dark-content' : 'light-content', true);
    }
  };

  const spinRays = rayRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Moon doesn't spin — only the sun graphic rotates
  const celestialRotation = currentTheme.sunType === 'moon' || currentTheme.sunType === 'hidden' ? '0deg' : spinRays;

  const topInset = insets.top > 0 ? insets.top : Platform.OS === 'android' ? RNStatusBar.currentHeight || 24 : 44;
  const bottomPad = Platform.OS === 'android' ? Math.max(insets.bottom, 12) + 90 : Math.max(insets.bottom, 8) + 85;

  const mainScrollRef = useRef<ScrollView>(null);
  useScrollToTop(mainScrollRef);

  useEffect(() => {
    if (isFocused) {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [isFocused]);

  return (
    <View style={[styles.rootContainer, { backgroundColor: colors.background }]}>
      {isFocused && (
        <StatusBar
          style={currentTheme.isDarkContent ? 'dark' : 'light'}
          backgroundColor="transparent"
          translucent={true}
          animated={true}
        />
      )}

      <ScrollView
        ref={mainScrollRef}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Bounded Dynamic Sky Hero Banner with Smooth Gradient Cross-fade */}
        <View style={styles.headerBannerWrapper}>
          {/* Base Previous Sky Gradient */}
          <LinearGradient
            colors={prevTheme.gradientColors}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.headerBannerGradient, { paddingTop: topInset + 12 }]}
          />

          {/* Animated Overlay Current Sky Gradient */}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgCrossfadeAnim }]}>
            <LinearGradient
              colors={currentTheme.gradientColors}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={[styles.headerBannerGradient, { paddingTop: topInset + 12 }]}
            />
          </Animated.View>

          {/* Fajr Pre-Dawn: Subtle horizon glow at the bottom of the header */}
          {selectedPrayer === 'Fajr' && (
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { opacity: bgCrossfadeAnim, justifyContent: 'flex-end' }]}
            >
              <LinearGradient
                colors={['transparent', 'rgba(251, 113, 133, 0.18)', 'rgba(253, 186, 116, 0.32)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{ height: 72, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
              />
              {/* Wispy pre-dawn cloud catching warm horizon glow */}
              <FajrCloud topInset={topInset} />
              {/* Bird silhouettes flying at dawn */}
              <FajrBirds topInset={topInset} />
            </Animated.View>
          )}

          {/* Maghrib Sunset: Horizon bloom glow at base of header */}
          {selectedPrayer === 'Maghrib' && (
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { opacity: bgCrossfadeAnim, justifyContent: 'flex-end' }]}
            >
              {/* Wide amber bloom across the horizon */}
              <LinearGradient
                colors={['transparent', 'rgba(255, 140, 30, 0.38)', 'rgba(255, 80, 20, 0.55)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{ height: 90, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
              />
            </Animated.View>
          )}

          {/* Isha: Moon atmospheric glow spread across header */}
          {selectedPrayer === 'Isha' && (
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { opacity: bgCrossfadeAnim }]}
            >
              {/* Soft blue moonlight radial highlight in top-right corner */}
              <LinearGradient
                colors={['rgba(100, 160, 255, 0.14)', 'rgba(70, 120, 220, 0.06)', 'transparent']}
                start={{ x: 1.0, y: 0 }}
                end={{ x: 0.3, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>
          )}

          {/* Stars for Fajr / Isha sky */}
          {(selectedPrayer === 'Fajr' || selectedPrayer === 'Isha') && (
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { opacity: bgCrossfadeAnim }]}
            >
              {/* Dense star field — more stars for Isha, fewer for Fajr */}
              {(selectedPrayer === 'Isha' ? [
                { top: topInset + 8, left: width * 0.08, size: 2.8, opacity: 0.92 },
                { top: topInset + 22, left: width * 0.22, size: 1.6, opacity: 0.70 },
                { top: topInset + 5, left: width * 0.38, size: 2.0, opacity: 0.80 },
                { top: topInset + 32, left: width * 0.48, size: 1.4, opacity: 0.62 },
                { top: topInset + 12, left: width * 0.62, size: 1.8, opacity: 0.72 },
                { top: topInset + 40, left: width * 0.75, size: 1.3, opacity: 0.58 },
                { top: topInset + 18, left: width * 0.14, size: 1.5, opacity: 0.65 },
                { top: topInset + 48, left: width * 0.28, size: 2.2, opacity: 0.76 },
                { top: topInset + 55, left: width * 0.52, size: 1.2, opacity: 0.55 },
                { top: topInset + 28, left: width * 0.85, size: 3.0, opacity: 0.88 },
                { top: topInset + 60, left: width * 0.42, size: 1.0, opacity: 0.48 },
                { top: topInset + 10, left: width * 0.93, size: 1.6, opacity: 0.68 },
              ] : [
                { top: topInset + 8, left: width * 0.12, size: 2.0, opacity: 0.72 },
                { top: topInset + 22, left: width * 0.38, size: 1.5, opacity: 0.58 },
                { top: topInset + 6, left: width * 0.58, size: 1.8, opacity: 0.65 },
                { top: topInset + 30, left: width * 0.74, size: 1.3, opacity: 0.50 },
                { top: topInset + 44, left: width * 0.22, size: 1.4, opacity: 0.45 },
              ]).map((star, i) => (
                <View
                  key={i}
                  style={{
                    position: 'absolute',
                    top: star.top,
                    left: star.left,
                    width: star.size,
                    height: star.size,
                    borderRadius: star.size / 2,
                    backgroundColor: selectedPrayer === 'Isha' ? '#C8DFFF' : '#FFFFFF',
                    opacity: star.opacity,
                  }}
                />
              ))}
            </Animated.View>
          )}

          {/* Maghrib: A few stars beginning to appear at twilight */}
          {selectedPrayer === 'Maghrib' && (
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { opacity: bgCrossfadeAnim }]}
            >
              {[
                { top: topInset + 10, left: width * 0.08, size: 1.8, opacity: 0.60 },
                { top: topInset + 24, left: width * 0.22, size: 1.3, opacity: 0.48 },
                { top: topInset + 8, left: width * 0.42, size: 1.5, opacity: 0.52 },
              ].map((star, i) => (
                <View
                  key={i}
                  style={{
                    position: 'absolute',
                    top: star.top,
                    left: star.left,
                    width: star.size,
                    height: star.size,
                    borderRadius: star.size / 2,
                    backgroundColor: '#FFE4B5',
                    opacity: star.opacity,
                  }}
                />
              ))}
            </Animated.View>
          )}

          {/* Animated Sun / Moon Body (Glides smoothly along Diurnal Arc) */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.celestialWrapper,
              {
                top: topInset + 6,
                transform: [
                  { translateX: sunXAnim },
                  { translateY: sunYAnim },
                  { scale: sunScaleAnim },
                  { rotate: celestialRotation },
                ],
              },
            ]}
          >
            <SunGraphic type={currentTheme.sunType} sunColor={currentTheme.sunColor} rayColor={currentTheme.rayColor} />
          </Animated.View>

          {/* Header Top Bar - Menu Button Only */}
          <View style={[styles.headerTitleBox, { paddingTop: topInset + 6 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 4 }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={openSidebar}
                style={{ padding: 8, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
              >
                <Ionicons name="menu" size={24} color={currentTheme.textColorPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Professional Daily Prayers List */}
        <View style={styles.cardsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DAILY PRAYERS</Text>

          {PRAYERS_DATA.map((item) => {
            const isSelected = selectedPrayer === item.id;

            // Solid opaque background colors for selected state to prevent Android elevation shadow artifacts
            const cardBgColor = isSelected
              ? (isDarkMode ? '#1E2D4A' : '#EFF6FF')
              : colors.surface;

            const cardBorderColor = isSelected
              ? (isDarkMode ? '#3B82F6' : '#2563EB')
              : colors.border;

            // Localized Rakat detail & time text
            const localizedDetail = t(item.detailKey, { defaultValue: item.defaultDetail });
            const localizedTime = t(item.timeKey, { defaultValue: item.defaultTime });

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => handleSelectPrayer(item.id)}
                style={[
                  styles.prayerCard,
                  {
                    backgroundColor: cardBgColor,
                    borderColor: cardBorderColor,
                    borderWidth: isSelected ? 1.5 : 1,
                  },
                ]}
              >
                {/* Left accent bar for selected */}
                {isSelected && (
                  <View
                    style={[
                      styles.cardAccentBar,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                )}

                <View style={styles.cardMainRow}>
                  {/* Icon Pill */}
                  <View
                    style={[
                      styles.cardIconBox,
                      { backgroundColor: item.iconBg },
                    ]}
                  >
                    {item.iconLib === 'mci' ? (
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={20}
                        color={isSelected ? item.iconColor : colors.textSecondary}
                      />
                    ) : (
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={isSelected ? item.iconColor : colors.textSecondary}
                      />
                    )}
                  </View>

                  {/* Prayer Info */}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                        <Text
                          style={[
                            styles.prayerNameText,
                            {
                              color: isSelected ? colors.primary : colors.textPrimary,
                              fontWeight: isSelected ? '700' : '600',
                            },
                          ]}
                        >
                          {item.name}
                        </Text>
                        <Text style={[styles.arabicLabel, { color: colors.textSecondary }]}>
                          {item.arabic}
                        </Text>
                      </View>

                      {/* Rakat pill badge */}
                      <View
                        style={[
                          styles.rakatPill,
                          {
                            backgroundColor: isSelected
                              ? (isDarkMode ? '#1E3A8A' : '#DBEAFE')
                              : colors.surfaceSecondary,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.rakatPillText,
                            { color: isSelected ? colors.primary : colors.textSecondary },
                          ]}
                        >
                          {localizedDetail}
                        </Text>
                      </View>
                    </View>

                    {/* Time row — always visible, subtle */}
                    <Text style={[styles.timeDetailText, { color: colors.textSecondary, marginTop: 3 }]}>
                      {localizedTime}
                    </Text>
                  </View>

                  {/* Chevron / active indicator */}
                  <Ionicons
                    name={isSelected ? 'chevron-forward-circle' : 'chevron-forward'}
                    size={isSelected ? 20 : 16}
                    color={isSelected ? colors.primary : colors.textSecondary + '55'}
                    style={{ marginLeft: 6 }}
                  />
                </View>

                {/* Compact action button — only on selected */}
                {isSelected && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('PrayerGuide', { prayerId: item.id.toLowerCase() })}
                    style={[styles.startGuideBtn, { backgroundColor: colors.primary }]}
                  >
                    <Ionicons name="book-outline" size={14} color="#fff" />
                    <Text style={styles.startGuideBtnText}>Begin Step-by-Step Guide</Text>
                    <Ionicons name="arrow-forward" size={14} color="#fff" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Floating Quick Access Button in Bottom Right Corner ── */}
      <View
        style={[styles.floatingPillContainer, { bottom: Math.max(insets.bottom, 12) + 5 }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => openMajorPoses()}
          style={styles.floatingPillBtn}
        >
          <LinearGradient
            colors={[colors.primary, '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.floatingPillGradient}
          >
            <MaterialCommunityIcons name="book-open-page-variant" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.floatingPillText}>Major Poses</Text>
            <View style={styles.floatingBadge}>
              <Text style={styles.floatingBadgeText}>6</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Standalone Full Major Poses Recitation Modal */}
      <MajorPosesModal
        visible={showMajorPosesModal}
        onClose={() => setShowMajorPosesModal(false)}
        initialPoseId={selectedMajorPoseId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  // Bottom Core Postures Section Styles
  posesSectionWrapper: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  posesBannerCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  audioPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  audioPillBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bannerUrduText: {
    fontSize: 12,
    marginTop: 3,
  },
  exploreBtnCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  posturesScrollRow: {
    flexDirection: 'row',
    paddingTop: 14,
    gap: 10,
  },
  postureAvatarPill: {
    width: 72,
    alignItems: 'center',
    padding: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  postureAvatarImg: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  postureAvatarText: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  postureAvatarRatio: {
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 1,
  },

  // Floating Quick Access Pill
  floatingPillContainer: {
    position: 'absolute',
    right: 18,
    zIndex: 99,
  },
  floatingPillBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingPillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 24,
  },
  floatingPillText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  floatingBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  floatingBadgeText: {
    color: '#1D4ED8',
    fontSize: 10.5,
    fontWeight: '800',
  },
  headerBannerWrapper: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  headerBannerGradient: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  celestialWrapper: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  cardsContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 7,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  prayerCard: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  cardAccentBar: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3.5,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerNameText: {
    fontSize: 15,
    letterSpacing: -0.3,
  },
  arabicLabel: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.65,
  },
  rakatPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  rakatPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  timeDetailText: {
    fontSize: 11.5,
    fontWeight: '500',
    opacity: 0.6,
  },
  startGuideBtn: {
    marginTop: 9,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  startGuideBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
