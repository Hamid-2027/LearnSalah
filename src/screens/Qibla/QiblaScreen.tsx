import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Animated,
  Easing,
  Platform,
  Dimensions,
  StatusBar as RNStatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../store/hooks';
import {
  calculateQiblaDirection,
  calculateDistanceToMakkah,
  getCompassDirectionName,
} from '../../utils/qiblaCalculator';
import majorCities from '../../data/majorCities.json';

const { width: SCREEN_W } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(SCREEN_W - 60, 280);
const CACHE_KEY = '@qibla_last_location_v2';

// ── Low-pass filter alpha (0 = very smooth/slow, 1 = instant/raw) ──────────
const LP_ALPHA = 0.18;

interface CityItem {
  city: string;
  country: string;
  lat: number;
  lon: number;
}

type AccuracyLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNAVAILABLE';

interface QiblaScreenProps {
  navigation?: any;
}

// ── Haversine wrap-around safe diff for smooth animation ──────────────────
function angleDiff(next: number, prev: number): number {
  let d = next - prev;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

export const QiblaScreen: React.FC<QiblaScreenProps> = ({ navigation }) => {
  const { isDarkMode, colors } = useTheme();
  const insets = useSafeAreaInsets();

  // ── Dynamic palette (midnight navy dark / crisp light) ─────────────────
  const C = {
    bg:            isDarkMode ? '#020B1C' : '#F8FAFC',
    surface:       isDarkMode ? '#05142E' : '#FFFFFF',
    surfaceSec:    isDarkMode ? '#091E42' : '#F1F5F9',
    border:        isDarkMode ? '#183B70' : '#E2E8F0',
    borderSubtle:  isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    textPrimary:   isDarkMode ? '#FFFFFF' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    accent:        isDarkMode ? '#3B82F6' : '#2563EB',
    accentLight:   isDarkMode ? '#60A5FA' : '#2563EB',
    accentSoft:    isDarkMode ? 'rgba(96,165,250,0.14)' : '#EFF6FF',
    success:       '#22C55E',
    successSoft:   isDarkMode ? 'rgba(34,197,94,0.18)' : 'rgba(34,197,94,0.12)',
    compassDial:   isDarkMode ? '#091E42' : '#F0F6FF',
    compassRing:   isDarkMode ? '#1E3A6E' : '#BFDBFE',
    needle:        isDarkMode ? '#3B82F6' : '#2563EB',
    needleTip:     isDarkMode ? '#60A5FA' : '#2563EB',
    shadow:        isDarkMode ? '#000000' : '#1D4ED8',
  };

  // ── State ────────────────────────────────────────────────────────────────
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('Detecting location…');
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [heading, setHeading] = useState(0);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [accuracy, setAccuracy] = useState<AccuracyLevel>('LOW');
  const [sensorAvailable, setSensorAvailable] = useState(true);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Animated values ──────────────────────────────────────────────────────
  const compassAnim = useRef(new Animated.Value(0)).current;
  const accumulatedHeadingRef = useRef(0); // For wrap-around safe rotation
  const smoothedHeadingRef = useRef(0);    // Low-pass filter state

  // ── Sensor refs (cleanup) ────────────────────────────────────────────────
  const headingSubRef = useRef<Location.LocationSubscription | null>(null);
  const magSubRef = useRef<any>(null);

  // ── Qibla math ──────────────────────────────────────────────────────────
  const qiblaBearing = userLocation
    ? calculateQiblaDirection(userLocation.lat, userLocation.lon)
    : 270; // Westward default

  const distanceKm = userLocation
    ? calculateDistanceToMakkah(userLocation.lat, userLocation.lon)
    : 0;

  // Angle from current phone direction to Qibla
  const qiblaOffset = (qiblaBearing - heading + 360) % 360;
  const isAligned = qiblaOffset <= 7 || qiblaOffset >= 353;

  // ── Low-pass + wrap-around safe heading update ──────────────────────────
  const applyHeading = useCallback((rawHeading: number) => {
    // Low-pass filter
    const diff = angleDiff(rawHeading, smoothedHeadingRef.current);
    const smoothed = smoothedHeadingRef.current + LP_ALPHA * diff;
    smoothedHeadingRef.current = (smoothed + 360) % 360;

    // Accumulate for smooth Animated rotation (handles 359→0 wrap)
    const animDiff = angleDiff(smoothedHeadingRef.current, accumulatedHeadingRef.current % 360);
    accumulatedHeadingRef.current += animDiff;

    setHeading(smoothedHeadingRef.current);

    Animated.timing(compassAnim, {
      toValue: accumulatedHeadingRef.current,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, []);

  // ── Initialize GPS + Compass ─────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      // 1. Load cached location first (instant offline render)
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setUserLocation({ lat: parsed.lat, lon: parsed.lon });
          if (parsed.name) setLocationName(parsed.name);
          setLoading(false);
        }
      } catch (_) {}

      // 2. Request location permission
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPermissionGranted(false);
          if (!userLocation) {
            setUserLocation({ lat: 33.6844, lon: 73.0479 });
            setLocationName('Islamabad (Default — GPS denied)');
          }
          setLoading(false);
        } else {
          setPermissionGranted(true);
          // 3. Get GPS fix
          try {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            const coords = { lat: loc.coords.latitude, lon: loc.coords.longitude };
            setUserLocation(coords);

            // Reverse geocode (graceful offline fallback)
            try {
              const geo = await Location.reverseGeocodeAsync({
                latitude: coords.lat,
                longitude: coords.lon,
              });
              if (geo?.length > 0) {
                const city = geo[0].city || geo[0].region || geo[0].name || 'Current Location';
                const country = geo[0].country || '';
                const name = country ? `${city}, ${country}` : city;
                setLocationName(name);
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ...coords, name }));
              }
            } catch (_) {
              const name = `GPS (${coords.lat.toFixed(3)}°, ${coords.lon.toFixed(3)}°)`;
              setLocationName(name);
              await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ...coords, name }));
            }
          } catch (_) {
            // GPS failed but location may be cached already
          } finally {
            setLoading(false);
          }
        }
      } catch (err) {
        setPermissionGranted(false);
        setLoading(false);
      }

      // 4. Start heading/compass
      startCompass();
    };

    init();

    return () => {
      headingSubRef.current?.remove();
      magSubRef.current?.remove();
    };
  }, []);

  const startCompass = async () => {
    // Prefer watchHeadingAsync (uses fusion sensor, trueHeading on iOS)
    try {
      const sub = await Location.watchHeadingAsync((data) => {
        // Use trueHeading if valid (≥ 0), else magHeading
        const raw = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
        if (typeof raw === 'number' && !isNaN(raw)) {
          applyHeading(raw);
          // Accuracy from Location API: 1=low, 2=medium, 3=high
          const acc = data.accuracy;
          if (acc >= 3) setAccuracy('HIGH');
          else if (acc >= 2) setAccuracy('MEDIUM');
          else setAccuracy('LOW');
        }
      });
      headingSubRef.current = sub;
    } catch (_) {
      // Fallback to raw Magnetometer
      try {
        Magnetometer.setUpdateInterval(100);
        const sub = Magnetometer.addListener((data) => {
          let { x, y } = data;
          // Standard bearing from magnetometer (atan2 in XY plane)
          let angle = (Math.atan2(y, x) * 180) / Math.PI;
          // Adjust for screen orientation (portrait: add 90°)
          angle = (angle + 90 + 360) % 360;
          applyHeading(angle);
          setAccuracy('LOW'); // Magnetometer alone = low accuracy
        });
        magSubRef.current = sub;
      } catch (_) {
        setSensorAvailable(false);
        setAccuracy('UNAVAILABLE');
      }
    }
  };

  // ── Manual City Selection ────────────────────────────────────────────────
  const handleSelectCity = async (item: CityItem) => {
    const coords = { lat: item.lat, lon: item.lon };
    const name = `${item.city}, ${item.country}`;
    setUserLocation(coords);
    setLocationName(name);
    setIsManualLocation(true);
    setShowCityModal(false);
    setSearchQuery('');
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ...coords, name }));
  };

  const filteredCities = (majorCities as CityItem[]).filter(
    (c) =>
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Derived compass rotation string ──────────────────────────────────────
  const rotateStr = compassAnim.interpolate({
    inputRange: [-7200, 7200],
    outputRange: ['-7200deg', '7200deg'],
  });

  // ── Accuracy indicator helpers ────────────────────────────────────────────
  const accuracyLabel = {
    HIGH: 'High Accuracy',
    MEDIUM: 'Medium Accuracy',
    LOW: 'Low — Calibrate',
    UNAVAILABLE: 'Compass Unavailable',
  }[accuracy];

  const accuracyColor = {
    HIGH: '#22C55E',
    MEDIUM: '#F59E0B',
    LOW: '#EF4444',
    UNAVAILABLE: '#94A3B8',
  }[accuracy];

  // ── Status bar ────────────────────────────────────────────────────────────
  const topPad = insets.top > 0 ? insets.top : (Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 44);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.bg }]} edges={['left', 'right', 'bottom']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: topPad + 6, backgroundColor: C.bg }]}>
        <TouchableOpacity
          style={[styles.headerIconBtn, { backgroundColor: C.surfaceSec, borderColor: C.border }]}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={C.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: C.textPrimary }]}>Qibla Direction</Text>

        <TouchableOpacity
          style={[styles.headerIconBtn, { backgroundColor: C.surfaceSec, borderColor: C.border }]}
          onPress={() => setShowCityModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="location-outline" size={20} color={C.accentLight} />
        </TouchableOpacity>
      </View>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <View style={styles.content}>

        {/* ── Location & Stats Card ───────────────────────────────────── */}
        <View style={[styles.infoCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          {/* Location Row */}
          <View style={styles.locationRow}>
            <View style={[styles.locationIconWrap, { backgroundColor: C.accentSoft }]}>
              <Ionicons name="navigate" size={16} color={C.accentLight} />
            </View>
            <Text style={[styles.locationName, { color: C.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
              {locationName}
            </Text>
            <TouchableOpacity
              style={[styles.changeBtn, { backgroundColor: C.accentSoft, borderColor: isDarkMode ? 'rgba(96,165,250,0.3)' : 'rgba(37,99,235,0.2)' }]}
              onPress={() => setShowCityModal(true)}
              activeOpacity={0.75}
            >
              <Text style={[styles.changeBtnText, { color: C.accentLight }]}>
                {isManualLocation ? 'Manual' : 'Change'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Thin divider */}
          <View style={[styles.cardDivider, { backgroundColor: C.borderSubtle }]} />

          {/* Stats Row: Qibla Angle | Distance */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={[styles.statLabel, { color: C.textSecondary }]}>Qibla Angle</Text>
              <Text style={[styles.statValue, { color: C.accentLight }]}>
                {loading && !userLocation
                  ? '—'
                  : `${Math.round(qiblaBearing)}° ${getCompassDirectionName(qiblaBearing)}`
                }
              </Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: C.border }]} />

            <View style={styles.statCol}>
              <Text style={[styles.statLabel, { color: C.textSecondary }]}>Distance</Text>
              <Text style={[styles.statValue, { color: C.accentLight }]}>
                {loading && !userLocation
                  ? '—'
                  : `${distanceKm.toLocaleString()} km`
                }
              </Text>
            </View>
          </View>
        </View>

        {/* ── Alignment Status Banner ──────────────────────────────────── */}
        <View
          style={[
            styles.statusBanner,
            {
              backgroundColor: isAligned ? C.successSoft : C.surfaceSec,
              borderColor: isAligned ? C.success : C.border,
            },
          ]}
        >
          {isAligned ? (
            <Ionicons name="checkmark-circle" size={18} color={C.success} style={{ marginRight: 8 }} />
          ) : (
            <FontAwesome6 name="kaaba" size={15} color={C.accentLight} style={{ marginRight: 8 }} />
          )}
          <Text style={[styles.statusText, { color: isAligned ? C.success : C.textPrimary }]}>
            {isAligned
              ? 'Facing the Kaaba ✨'
              : sensorAvailable
                ? `Turn phone to ${Math.round(qiblaBearing)}°`
                : `Static Qibla: ${Math.round(qiblaBearing)}° ${getCompassDirectionName(qiblaBearing)}`
            }
          </Text>
        </View>

        {/* ── Compass ─────────────────────────────────────────────────── */}
        <View style={[styles.compassOuterWrapper, { width: COMPASS_SIZE + 40, height: COMPASS_SIZE + 40 }]}>
          {/* North Diamond Pointer (static — always points up) */}
          <View
            style={[
              styles.northDiamond,
              {
                top: 4,
                backgroundColor: C.accentLight,
                shadowColor: C.shadow,
              },
            ]}
          />

          {/* Rotating Compass Dial */}
          <Animated.View
            style={[
              styles.compassDial,
              {
                width: COMPASS_SIZE,
                height: COMPASS_SIZE,
                borderRadius: COMPASS_SIZE / 2,
                backgroundColor: C.compassDial,
                borderColor: C.compassRing,
                shadowColor: C.shadow,
                transform: [{ rotate: rotateStr }],
              },
            ]}
          >
            {/* Cardinal Labels (rotate with dial) */}
            <Text style={[styles.cardN, { color: C.accentLight }]}>N</Text>
            <Text style={[styles.cardE, { color: C.textSecondary }]}>E</Text>
            <Text style={[styles.cardS, { color: C.textSecondary }]}>S</Text>
            <Text style={[styles.cardW, { color: C.textSecondary }]}>W</Text>

            {/* Tick marks at 45° intervals */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <View
                key={deg}
                style={[
                  styles.tickMark,
                  {
                    width: COMPASS_SIZE / 2,
                    transform: [{ rotate: `${deg}deg` }],
                  },
                ]}
              >
                <View style={[styles.tickDot, {
                  backgroundColor: deg % 90 === 0
                    ? (isDarkMode ? 'rgba(96,165,250,0.3)' : 'rgba(37,99,235,0.25)')
                    : (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                }]} />
              </View>
            ))}

            {/* Qibla Needle Line (fixed relative to compass — rotates with phone) */}
            {/* This line always points to qiblaBearing relative to N on dial */}
            <View
              style={[
                styles.qiblaLineWrapper,
                {
                  width: COMPASS_SIZE,
                  height: COMPASS_SIZE,
                  transform: [{ rotate: `${qiblaBearing}deg` }],
                },
              ]}
            >
              {/* Line stem from center to edge */}
              <View style={[styles.qiblaLineStem, { backgroundColor: C.needle, width: 2.5, height: COMPASS_SIZE / 2 - 30 }]} />
              {/* Large filled ball at Kaaba end */}
              <View style={[styles.qiblaLineBall, {
                backgroundColor: C.needle,
                shadowColor: C.needle,
              }]} />
            </View>

            {/* Center Pivot Dot */}
            <View style={[styles.centerPivot, { backgroundColor: C.surface, borderColor: C.compassRing }]}>
              <View style={[styles.centerDot, { backgroundColor: C.accent }]} />
            </View>
          </Animated.View>
        </View>

        {/* ── Accuracy + Calibration Row ──────────────────────────────── */}
        <View style={styles.bottomRow}>
          {/* Accuracy Indicator */}
          <View style={styles.accuracyRow}>
            <View style={[styles.accuracyDot, { backgroundColor: accuracyColor }]} />
            <Text style={[styles.accuracyText, { color: C.textSecondary }]}>{accuracyLabel}</Text>
          </View>

          {/* Calibration Hint */}
          <TouchableOpacity
            style={styles.calibrateBtn}
            onPress={() => setShowCalibrationModal(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="rotate-3d-variant" size={16} color={C.textSecondary} />
            <Text style={[styles.calibrateText, { color: C.textSecondary }]}>
              Inaccurate? Wave phone in ∞ figure-8 pattern
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* ── City Selector Modal ─────────────────────────────────────────── */}
      <Modal visible={showCityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.cityModalCard, { backgroundColor: C.surface }]}>
            {/* Header */}
            <View style={[styles.cityModalHeader, { borderBottomColor: C.border }]}>
              <Text style={[styles.cityModalTitle, { color: C.textPrimary }]}>Select City (Offline)</Text>
              <TouchableOpacity onPress={() => { setShowCityModal(false); setSearchQuery(''); }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <View style={[styles.cityCloseBtn, { backgroundColor: C.surfaceSec }]}>
                  <Ionicons name="close" size={18} color={C.textPrimary} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={[styles.searchBox, { backgroundColor: C.surfaceSec, borderColor: C.border }]}>
              <Ionicons name="search-outline" size={17} color={C.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: C.textPrimary }]}
                placeholder="Search city or country…"
                placeholderTextColor={C.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                autoCorrect={false}
              />
            </View>

            {/* City List */}
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => `${item.city}-${item.country}`}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const bearing = Math.round(calculateQiblaDirection(item.lat, item.lon));
                const dir = getCompassDirectionName(bearing);
                return (
                  <TouchableOpacity
                    style={[styles.cityRow, { borderBottomColor: C.borderSubtle }]}
                    onPress={() => handleSelectCity(item)}
                    activeOpacity={0.75}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cityName, { color: C.textPrimary }]}>{item.city}</Text>
                      <Text style={[styles.cityCountry, { color: C.textSecondary }]}>{item.country}</Text>
                    </View>
                    <View style={[styles.cityBearingBadge, { backgroundColor: C.accentSoft }]}>
                      <Text style={[styles.cityBearingText, { color: C.accentLight }]}>{bearing}° {dir}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="search" size={32} color={C.textSecondary} />
                  <Text style={[styles.emptyText, { color: C.textSecondary }]}>No cities found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* ── Calibration Modal ───────────────────────────────────────────── */}
      <Modal visible={showCalibrationModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.calibModal, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={[styles.calibIconWrap, { backgroundColor: C.accentSoft }]}>
              <MaterialCommunityIcons name="compass-rose" size={36} color={C.accentLight} />
            </View>
            <Text style={[styles.calibTitle, { color: C.textPrimary }]}>Calibrate Compass</Text>
            <Text style={[styles.calibBody, { color: C.textSecondary }]}>
              Wave your phone smoothly in a large figure-8 (♾️) pattern in the air. This resets the magnetometer and removes nearby magnetic interference.
            </Text>

            {/* Accuracy status inside modal */}
            <View style={[styles.calibAccuracyRow, { backgroundColor: C.surfaceSec, borderColor: C.border }]}>
              <View style={[styles.accuracyDot, { backgroundColor: accuracyColor }]} />
              <Text style={[styles.calibAccuracyText, { color: C.textPrimary }]}>Current: {accuracyLabel}</Text>
            </View>

            <TouchableOpacity
              style={[styles.calibOkBtn, { backgroundColor: C.accent }]}
              onPress={() => setShowCalibrationModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.calibOkText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  // Main content
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingBottom: 16,
  },

  // Info Card
  infoCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  locationName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  changeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    flexShrink: 0,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statDivider: {
    width: 1,
    height: 36,
    opacity: 0.6,
  },

  // Status Banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },

  // Compass Wrapper
  compassOuterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  northDiamond: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    zIndex: 20,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4 },
      android: { elevation: 6 },
    }),
  },
  compassDial: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2.5,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },

  // Cardinal labels
  cardN: {
    position: 'absolute',
    top: 14,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  cardE: {
    position: 'absolute',
    right: 16,
    fontSize: 14,
    fontWeight: '700',
  },
  cardS: {
    position: 'absolute',
    bottom: 14,
    fontSize: 14,
    fontWeight: '700',
  },
  cardW: {
    position: 'absolute',
    left: 16,
    fontSize: 14,
    fontWeight: '700',
  },

  // Tick marks
  tickMark: {
    position: 'absolute',
    height: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  tickDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: 6,
  },

  // Qibla Needle
  qiblaLineWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  qiblaLineBall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.45, shadowRadius: 6 },
      android: { elevation: 5 },
    }),
  },
  qiblaLineStem: {
    borderRadius: 2,
    marginBottom: 4,
  },

  // Center
  centerPivot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  // Bottom row
  bottomRow: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accuracyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  accuracyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  calibrateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  calibrateText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // City Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  cityModalCard: {
    height: '78%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 6,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.2, shadowRadius: 12 },
      android: { elevation: 12 },
    }),
  },
  cityModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  cityModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  cityCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cityName: {
    fontSize: 14,
    fontWeight: '600',
  },
  cityCountry: {
    fontSize: 11.5,
    marginTop: 2,
  },
  cityBearingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cityBearingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Calibration Modal
  calibModal: {
    margin: 24,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    alignSelf: 'center',
    width: SCREEN_W - 48,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16 },
      android: { elevation: 10 },
    }),
  },
  calibIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  calibTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  calibBody: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  calibAccuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  calibAccuracyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  calibOkBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 14,
  },
  calibOkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
