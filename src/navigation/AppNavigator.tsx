import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/Home/HomeScreen';
import { QuranScreen } from '../screens/Quran/QuranScreen';
import { HadithScreen } from '../screens/Hadith/HadithScreen';
import { IbadaatScreen } from '../screens/Ibadaat/IbadaatScreen';
import { MoreScreen } from '../screens/More/MoreScreen';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 12) : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3D348B',
        tabBarInactiveTintColor: '#8A8A93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EBE8F5',
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 6,
        },
        tabBarIcon: ({ color }) => {
          if (route.name === 'Quran') {
            return <MaterialCommunityIcons name="book-open-variant" size={22} color={color} />;
          } else if (route.name === 'Hadith') {
            return <MaterialCommunityIcons name="star-four-points-outline" size={22} color={color} />;
          } else if (route.name === 'Home') {
            return <Ionicons name="home-outline" size={22} color={color} />;
          } else if (route.name === 'Ibadaat') {
            return <MaterialCommunityIcons name="mosque" size={22} color={color} />;
          } else if (route.name === 'More') {
            return <Ionicons name="ellipsis-horizontal-circle-outline" size={22} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen name="Quran" component={QuranScreen} />
      <Tab.Screen name="Hadith" component={HadithScreen} />
      <Tab.Screen name="Home">
        {(props) => (
          <HomeScreen
            onResetOnboarding={() => props.navigation.replace('Onboarding')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Ibadaat" component={IbadaatScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen
          name="Onboarding"
          options={{
            headerShown: false,
          }}
        >
          {(props) => (
            <OnboardingScreen
              onFinish={() => props.navigation.replace('MainTabs')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
