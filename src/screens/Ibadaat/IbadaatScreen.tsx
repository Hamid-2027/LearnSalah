import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

export const IbadaatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();

  const prayers = [
    {
      id: 'fajr',
      name: 'Fajr',
      detail: '2 Rakat Fard',
      arabic: 'فجر — ۲ رکعت فرض',
      time: 'Dawn Prayer',
      color: colors.primary,
    },
    {
      id: 'dhuhr',
      name: 'Dhuhr',
      detail: '4 Rakat Fard',
      arabic: 'ظہر — ۴ رکعت فرض',
      time: 'Noon Prayer',
      color: colors.primary,
    },
    {
      id: 'asr',
      name: 'Asr',
      detail: '4 Rakat Fard',
      arabic: 'عصر — ۴ رکعت فرض',
      time: 'Afternoon Prayer',
      color: colors.primary,
    },
    {
      id: 'maghrib',
      name: 'Maghrib',
      detail: '3 Rakat Fard',
      arabic: 'مغرب — ۳ رکعت فرض',
      time: 'Sunset Prayer',
      color: colors.primary,
    },
    {
      id: 'isha',
      name: 'Isha',
      detail: '4 Rakat Fard',
      arabic: 'عشاء — ۴ رکعت فرض',
      time: 'Night Prayer',
      color: colors.primary,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="mosque" size={40} color={colors.primary} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>Ibadaat & Prayer Guide</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select a prayer to start step-by-step visual & audio guide
          </Text>
        </View>

        {/* Qibla Direction Quick Access Card */}
        <TouchableOpacity
          style={[styles.qiblaCard, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Qibla')}
        >
          <View style={styles.qiblaLeft}>
            <MaterialCommunityIcons name="compass-rose" size={32} color="#FFFFFF" />
            <View style={styles.qiblaTextGroup}>
              <Text style={styles.qiblaTitle}>Qibla Direction</Text>
              <Text style={styles.qiblaSubtitle}>Find the direction of Kaaba • Fully Offline</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

        {/* Prayer List Section */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Daily Prayers</Text>

        <View style={styles.listContainer}>
          {prayers.map((prayer) => (
            <TouchableOpacity
              key={prayer.id}
              style={[styles.prayerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('PrayerGuide', { prayerId: prayer.id })}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSecondary }]}>
                <MaterialCommunityIcons name="hand-heart" size={24} color={colors.primary} />
              </View>

              <View style={styles.cardInfo}>
                <Text style={[styles.prayerName, { color: colors.textPrimary }]}>
                  {prayer.name}: {prayer.detail}
                </Text>
                <Text style={[styles.prayerArabic, { color: colors.textSecondary }]}>{prayer.arabic}</Text>
                <Text style={[styles.prayerTime, { color: colors.textSecondary }]}>{prayer.time}</Text>
              </View>

              <View style={[styles.playBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="play" size={16} color="#FFFFFF" />
                <Text style={styles.playText}>Start</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },

  // Qibla Card
  qiblaCard: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  qiblaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  qiblaTextGroup: {
    marginLeft: 14,
    flex: 1,
  },
  qiblaTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  qiblaSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Section Label
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },

  // Prayer List
  listContainer: {
    gap: 10,
  },
  prayerCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  prayerArabic: {
    fontSize: 13,
    marginTop: 2,
  },
  prayerTime: {
    fontSize: 11,
    marginTop: 2,
  },
  playBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
