import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface BottomTabBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabPress }) => {
  const insets = useSafeAreaInsets();

  const tabs = [
    { id: 'Quran', label: 'Quran', icon: 'book-open-variant', type: 'mci' },
    { id: 'Hadith', label: 'Hadith', icon: 'star-four-points-outline', type: 'mci' },
    { id: 'Home', label: 'Home', icon: 'home-outline', type: 'ion' },
    { id: 'Ibadaat', label: 'Ibadaat', icon: 'mosque', type: 'mci' },
    { id: 'More', label: 'More', icon: 'ellipsis-horizontal-circle-outline', type: 'ion' },
  ];

  // Dynamic bottom padding to ensure zero overlap with Android bottom navigation bar
  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 12) : Math.max(insets.bottom, 8);

  return (
    <View style={[styles.tabContainer, { paddingBottom: bottomPadding }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const color = isActive ? '#3D348B' : '#8A8A93';

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            activeOpacity={0.7}
            onPress={() => onTabPress(tab.id)}
          >
            {tab.type === 'ion' ? (
              <Ionicons name={tab.icon as any} size={22} color={color} />
            ) : (
              <MaterialCommunityIcons name={tab.icon as any} size={22} color={color} />
            )}
            <Text style={[styles.tabLabel, { color, fontWeight: isActive ? '700' : '500' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBE8F5',
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
  },
});
