import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import {
  calculateQiblaDirection,
  calculateDistanceToMakkah,
  getCompassDirectionName,
  KAABA_LAT,
  KAABA_LON,
} from '../../utils/qiblaCalculator';
import majorCities from '../../data/majorCities.json';

const CACHE_KEY = '@qibla_last_location';

interface CityItem {
  city: string;
  country: string;
  lat: number;
  lon: number;
}

interface QiblaScreenProps {
  navigation?: any;
}

export const QiblaScreen: React.FC<QiblaScreenProps> = ({ navigation }) => {
  const { isDarkMode, colors } = useTheme();

  // Position & Compass State
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('Islamabad, Pakistan');
  const [isManualLocation, setIsManualLocation] = useState<boolean>(false);
  const [heading, setHeading] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  // Calibration & City Modal
  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Animated values for smooth compass rotation
  const compassAnim = useRef(new Animated.Value(0)).current;
  const lastHeadingRef = useRef<number>(0);

  // 1. Initial Setup: Load cached location & start location/compass services
  useEffect(() => {
    let headingSubscription: Location.LocationSubscription | null = null;
    let magnetometerSubscription: any = null;

    const initializeQibla = async () => {
      // Step 9: Load cached location first (instant offline render)
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setUserLocation({ lat: parsed.lat, lon: parsed.lon });
          if (parsed.name) setLocationName(parsed.name);
          setLoading(false);
        }
      } catch (e) {
        console.log('Error reading cached location', e);
      }

      // Step 1: Request Location Permission
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setPermissionGranted(false);
          // Fallback to default city (Islamabad) if not already set
          if (!userLocation) {
            setUserLocation({ lat: 33.6844, lon: 73.0479 });
            setLocationName('Islamabad (Default Offline)');
          }
          setLoading(false);
        } else {
          setPermissionGranted(true);
          // Step 2: Get current GPS coordinates
          try {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            const coords = { lat: loc.coords.latitude, lon: loc.coords.longitude };
            setUserLocation(coords);

            // Reverse geocode city name if possible (graceful offline fallback)
            try {
              const geocode = await Location.reverseGeocodeAsync({
                latitude: coords.lat,
                longitude: coords.lon,
              });
              if (geocode && geocode.length > 0) {
                const city = geocode[0].city || geocode[0].region || geocode[0].name || 'Current Location';
                const country = geocode[0].country || '';
                const nameStr = country ? `${city}, ${country}` : city;
                setLocationName(nameStr);
                // Cache location
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ...coords, name: nameStr }));
              }
            } catch (geoErr) {
              const nameStr = `GPS (${coords.lat.toFixed(2)}°, ${coords.lon.toFixed(2)}°)`;
              setLocationName(nameStr);
              await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ...coords, name: nameStr }));
            }
          } catch (posErr) {
            console.log('GPS fix timeout or offline, using cache/fallback');
          } finally {
            setLoading(false);
          }
        }
      } catch (err) {
        setPermissionGranted(false);
        setLoading(false);
      }

      // Step 4: Watch Heading (Expo Location watchHeadingAsync + Magnetometer fallback)
      try {
        headingSubscription = await Location.watchHeadingAsync((headingData) => {
          const h = headingData.trueHeading >= 0 ? headingData.trueHeading : headingData.magHeading;
          if (h !== undefined && h !== null && !isNaN(h)) {
            updateHeadingAnimated(h);
          }
        });
      } catch (hErr) {
        // Fallback to Magnetometer sensor
        Magnetometer.setUpdateInterval(100);
        magnetometerSubscription = Magnetometer.addListener((data) => {
          let { x, y } = data;
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          if (angle < 0) angle += 360;
          updateHeadingAnimated(angle);
        });
      }
    };

    initializeQibla();

    return () => {
      if (headingSubscription) headingSubscription.remove();
      if (magnetometerSubscription) magnetometerSubscription.remove();
    };
  }, []);

  // Smooth heading rotation handling (handles 360° -> 0° wrap-around)
  const updateHeadingAnimated = (newHeading: number) => {
    let diff = newHeading - lastHeadingRef.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const target = lastHeadingRef.current + diff;
    lastHeadingRef.current = target;
    setHeading((newHeading + 360) % 360);

    Animated.timing(compassAnim, {
      toValue: target,
      duration: 150,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  // Step 3: Calculate Qibla Bearing
  const qiblaBearing = userLocation
    ? calculateQiblaDirection(userLocation.lat, userLocation.lon)
    : 254.5; // default Islamabad

  // Step 10: Calculate distance to Makkah
  const distanceKm = userLocation
    ? calculateDistanceToMakkah(userLocation.lat, userLocation.lon)
    : 3450;

  // Relative rotation angle between phone heading & Qibla bearing
  const qiblaOffset = (qiblaBearing - heading + 360) % 360;
  // Is phone aligned towards Qibla within ±6° tolerance?
  const isAligned = qiblaOffset <= 6 || qiblaOffset >= 354;

  // Step 8: Manual City Selection
  const handleSelectCity = async (item: CityItem) => {
    const coords = { lat: item.lat, lon: item.lon };
    const nameStr = `${item.city}, ${item.country}`;
    setUserLocation(coords);
    setLocationName(nameStr);
    setIsManualLocation(true);
    setShowCityModal(false);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ...coords, name: nameStr }));
  };

  const filteredCities = majorCities.filter(
    (c) =>
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Qibla Direction</Text>
        <TouchableOpacity
          style={styles.cityBtn}
          onPress={() => setShowCityModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="location-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.container}>
        {/* Location & Distance Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.locationHeaderRow}>
            <View style={styles.locationTitleGroup}>
              <Ionicons name="navigate-circle" size={20} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.locationText, { color: colors.textPrimary }]} numberOfLines={1}>
                {locationName}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.changeCityBadge, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setShowCityModal(true)}
            >
              <Text style={[styles.changeCityText, { color: colors.primary }]}>
                {isManualLocation ? 'Manual' : 'Change'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Qibla Angle</Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {Math.round(qiblaBearing)}° {getCompassDirectionName(qiblaBearing)}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Distance</Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {distanceKm.toLocaleString()} km
              </Text>
            </View>
          </View>
        </View>

        {/* Alignment Status Banner */}
        <View
          style={[
            styles.alignmentBanner,
            {
              backgroundColor: isAligned
                ? (isDarkMode ? 'rgba(46, 155, 104, 0.25)' : 'rgba(46, 155, 104, 0.15)')
                : colors.surfaceSecondary,
              borderColor: isAligned ? '#2E9B68' : colors.border,
            },
          ]}
        >
          <FontAwesome6
            name="kaaba"
            size={18}
            color={isAligned ? '#2E9B68' : colors.primary}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.alignmentText,
              { color: isAligned ? '#2E9B68' : colors.textPrimary },
            ]}
          >
            {isAligned ? 'Facing Kaaba! (Aligned with Qibla)' : `Turn phone to ${Math.round(qiblaBearing)}°`}
          </Text>
        </View>

        {/* Interactive Compass Dial */}
        <View style={styles.compassWrapper}>
          {/* Static Outer Pointer (Top indicator showing phone direction) */}
          <View style={[styles.topPointer, { backgroundColor: isAligned ? '#2E9B68' : colors.primary }]} />

          {/* Rotating Compass Dial */}
          <Animated.View
            style={[
              styles.compassDial,
              {
                borderColor: isAligned ? '#2E9B68' : colors.border,
                backgroundColor: colors.surface,
                transform: [
                  {
                    rotate: compassAnim.interpolate({
                      inputRange: [-360, 360],
                      outputRange: ['360deg', '-360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Cardinal Markers (N, E, S, W) */}
            <Text style={[styles.cardinalN, { color: colors.primary }]}>N</Text>
            <Text style={[styles.cardinalE, { color: colors.textSecondary }]}>E</Text>
            <Text style={[styles.cardinalS, { color: colors.textSecondary }]}>S</Text>
            <Text style={[styles.cardinalW, { color: colors.textSecondary }]}>W</Text>

            {/* Qibla Needle / Kaaba Indicator inside Dial */}
            <View
              style={[
                styles.qiblaPointerLine,
                {
                  transform: [{ rotate: `${qiblaBearing}deg` }],
                },
              ]}
            >
              <View style={[styles.kaabaIconMarker, { backgroundColor: isAligned ? '#2E9B68' : colors.secondary }]}>
                <FontAwesome6 name="kaaba" size={20} color="#FFFFFF" />
              </View>
              <View style={[styles.needleStem, { backgroundColor: isAligned ? '#2E9B68' : colors.secondary }]} />
            </View>

            {/* Compass Center Pivot Circle */}
            <View style={[styles.centerPivot, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
              <View style={styles.centerDot} />
            </View>
          </Animated.View>
        </View>

        {/* Compass Calibration Hint (Step 7) */}
        <TouchableOpacity
          style={styles.calibrateContainer}
          onPress={() => setShowCalibrationModal(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="rotate-3d-variant" size={18} color={colors.textSecondary} />
          <Text style={[styles.calibrateText, { color: colors.textSecondary }]}>
            Inaccurate? Wave phone in ∞ figure-8 pattern
          </Text>
        </TouchableOpacity>
      </View>

      {/* Step 8: City Selector Modal */}
      <Modal visible={showCityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select City (Offline)</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={[styles.searchInputContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search city or country..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* City List */}
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => `${item.city}-${item.country}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.cityListItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleSelectCity(item)}
                >
                  <View>
                    <Text style={[styles.cityItemName, { color: colors.textPrimary }]}>{item.city}</Text>
                    <Text style={[styles.cityItemCountry, { color: colors.textSecondary }]}>{item.country}</Text>
                  </View>
                  <Text style={[styles.cityItemBearing, { color: colors.primary }]}>
                    {Math.round(calculateQiblaDirection(item.lat, item.lon))}°
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Step 7: Calibration Prompt Modal */}
      <Modal visible={showCalibrationModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.calibrationContent, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons name="compass-rose" size={48} color={colors.primary} />
            <Text style={[styles.calibrationTitle, { color: colors.textPrimary }]}>Calibrate Compass</Text>
            <Text style={[styles.calibrationBody, { color: colors.textSecondary }]}>
              Move and wave your device smoothly in a large figure-8 motion (♾️) in the air to calibrate the magnetometer sensor for higher precision.
            </Text>
            <TouchableOpacity
              style={[styles.calibrationBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowCalibrationModal(false)}
            >
              <Text style={styles.calibrationBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cityBtn: {
    padding: 6,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 24,
  },

  // Info Card
  infoCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  changeCityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeCityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: 32,
  },

  // Alignment Banner
  alignmentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    width: '100%',
    marginVertical: 12,
  },
  alignmentText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Compass UI
  compassWrapper: {
    width: 270,
    height: 270,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 16,
  },
  topPointer: {
    position: 'absolute',
    top: -12,
    width: 14,
    height: 14,
    transform: [{ rotate: '45deg' }],
    zIndex: 20,
    borderRadius: 2,
  },
  compassDial: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardinalN: {
    position: 'absolute',
    top: 10,
    fontSize: 18,
    fontWeight: '900',
  },
  cardinalE: {
    position: 'absolute',
    right: 14,
    fontSize: 16,
    fontWeight: '700',
  },
  cardinalS: {
    position: 'absolute',
    bottom: 10,
    fontSize: 16,
    fontWeight: '700',
  },
  cardinalW: {
    position: 'absolute',
    left: 14,
    fontSize: 16,
    fontWeight: '700',
  },
  qiblaPointerLine: {
    position: 'absolute',
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  kaabaIconMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  needleStem: {
    width: 3,
    height: 80,
    borderRadius: 2,
    marginTop: -4,
  },
  centerPivot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  centerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },

  // Calibration
  calibrateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  calibrateText: {
    fontSize: 12,
    marginLeft: 6,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '75%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  cityListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  cityItemName: {
    fontSize: 15,
    fontWeight: '600',
  },
  cityItemCountry: {
    fontSize: 12,
    marginTop: 2,
  },
  cityItemBearing: {
    fontSize: 15,
    fontWeight: '700',
  },

  // Calibration Modal
  calibrationContent: {
    margin: 24,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  calibrationTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 12,
  },
  calibrationBody: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  calibrationBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  calibrationBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
