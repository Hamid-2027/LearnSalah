import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const CustomBottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { isDarkMode, colors } = useTheme();

  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 8) : Math.max(insets.bottom, 6);

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
          borderTopColor: isDarkMode ? '#29241B' : '#EAE3D2',
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let label = route.name;
        if (options.tabBarLabel !== undefined) {
          label = options.tabBarLabel as string;
        } else if (options.title !== undefined) {
          label = options.title;
        }

        const renderIcon = (focused: boolean) => {
          const activeColor = isDarkMode ? '#D4AF37' : '#FFFFFF';
          const inactiveColor = isDarkMode ? '#60A5FA' : '#1D4ED8';
          
          const iconColor = focused ? activeColor : inactiveColor;
          const size = 20;

          if (route.name === 'Learn' || route.name === 'Quran') {
            return <MaterialCommunityIcons name={focused ? "school" : "school-outline"} size={size} color={iconColor} />;
          } else if (route.name === 'Prayer' || route.name === 'PrayerTimes') {
            return <MaterialCommunityIcons name={focused ? "clock-time-four" : "clock-time-four-outline"} size={size} color={iconColor} />;
          } else if (route.name === 'Hadith') {
            return <MaterialCommunityIcons name={focused ? "star-four-points" : "star-four-points-outline"} size={size} color={iconColor} />;
          } else if (route.name === 'Home') {
            return <Ionicons name={focused ? "home" : "home-outline"} size={size} color={iconColor} />;
          } else if (route.name === 'Ibadaat') {
            return <MaterialCommunityIcons name={focused ? "mosque" : "mosque"} size={size} color={iconColor} />;
          } else if (route.name === 'More') {
            return <Ionicons name={focused ? "ellipsis-horizontal" : "ellipsis-horizontal-circle-outline"} size={size} color={iconColor} />;
          }
          return null;
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={(options as any).tabBarTestID}
            onPress={onPress}
            activeOpacity={0.8}
            style={[styles.tabItem, isFocused && { flex: 1.3 }]}
          >
            {/* Top Golden Dot Indicator when active */}
            {isFocused && (
              <View
                style={[
                  styles.activeDot,
                  { backgroundColor: isDarkMode ? '#D4AF37' : (colors.primary || '#1E40AF') },
                ]}
              />
            )}

            <View
              style={[
                styles.pillBackground,
                isFocused ? (
                  isDarkMode
                    ? { backgroundColor: '#2B2414', borderColor: '#D4AF37', flexDirection: 'row' }
                    : { backgroundColor: colors.primary || '#1E40AF', borderColor: colors.primary || '#1E40AF', flexDirection: 'row' }
                ) : {
                  flexDirection: 'column',
                  paddingVertical: 4,
                  paddingHorizontal: 4,
                }
              ]}
            >
              {renderIcon(isFocused)}

              {isFocused ? (
                <Text
                  style={[
                    styles.activeTabText,
                    {
                      color: isDarkMode ? '#D4AF37' : '#FFFFFF',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              ) : (
                <Text
                  style={[
                    styles.unselectedTabText,
                    {
                      color: isDarkMode ? '#60A5FA' : '#1D4ED8',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1.5,
    paddingTop: 6,
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    top: -6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillBackground: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 44,
  },
  activeTabText: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  unselectedTabText: {
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.1,
  },
});
