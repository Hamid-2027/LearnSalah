import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PrayerPlayer, PrayerData } from '../components/PrayerPlayer';
import { PrayerSimulation } from '../components/PrayerSimulation';
import { useTheme } from '../context/ThemeContext';

const fajrData: PrayerData = require('../data/fajrPrayer.json');

export const PrayerScreen = ({ navigation, route }: any) => {
  const { isDarkMode, colors } = useTheme();
  const prayerId = route?.params?.prayerId || 'fajr';
  const prayerData = fajrData; // TODO: Load different prayer data based on prayerId
  const [activeTab, setActiveTab] = useState<'guided' | 'simulation'>('guided');

  const handleBack = () => {
    navigation.goBack();
  };

  const accentColor = colors.primary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />

      {/* Screen Top Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {prayerData.title.en}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {activeTab === 'guided' ? 'Guided Audio Recitation' : 'Pose Pattern Simulation'}
          </Text>
        </View>

        <View style={[styles.rakatBadge, { backgroundColor: colors.surfaceSecondary, borderColor: colors.primary }]}>
          <Ionicons name="sparkles" size={11} color={colors.primary} style={{ marginRight: 4 }} />
          <Text style={[styles.rakatBadgeText, { color: colors.primary }]}>
            {prayerData.total_rakats} Rakats
          </Text>
        </View>
      </View>

      {/* Top Segmented Tab Bar */}
      <View style={[styles.tabBarContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.segmentedControl, { backgroundColor: colors.surfaceSecondary }]}>
          {/* Tab 1: Guided Recitation */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('guided')}
            style={[
              styles.tabButton,
              activeTab === 'guided' && [
                styles.activeTabButton,
                { backgroundColor: colors.surface, borderColor: colors.primary },
              ],
            ]}
          >
            <MaterialCommunityIcons
              name="book-open-page-variant-outline"
              size={17}
              color={activeTab === 'guided' ? colors.primary : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'guided' ? colors.primary : colors.textSecondary,
                  fontWeight: activeTab === 'guided' ? '700' : '600',
                },
              ]}
            >
              Guided Mode
            </Text>
          </TouchableOpacity>

          {/* Tab 2: Pose Simulation */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('simulation')}
            style={[
              styles.tabButton,
              activeTab === 'simulation' && [
                styles.activeTabButton,
                { backgroundColor: colors.surface, borderColor: colors.primary },
              ],
            ]}
          >
            <Ionicons
              name="body-outline"
              size={17}
              color={activeTab === 'simulation' ? colors.primary : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'simulation' ? colors.primary : colors.textSecondary,
                  fontWeight: activeTab === 'simulation' ? '700' : '600',
                },
              ]}
            >
              Pose Simulation
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content View */}
      <View style={styles.tabContent}>
        {activeTab === 'guided' ? (
          <PrayerPlayer prayerData={prayerData} onBack={handleBack} hideHeader={true} />
        ) : (
          <PrayerSimulation prayerData={prayerData} onBack={handleBack} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  rakatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  rakatBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tabBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  activeTabButton: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
  },
  tabContent: {
    flex: 1,
  },
});
