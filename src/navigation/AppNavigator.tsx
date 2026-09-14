import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '../screens/Home/HomeScreen';
import { LearnScreen } from '../screens/Learn/LearnScreen';
import { HadithScreen } from '../screens/Hadith/HadithScreen';
import { IbadaatScreen } from '../screens/Ibadaat/IbadaatScreen';
import { MoreScreen } from '../screens/More/MoreScreen';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { PrayerScreen } from '../screens/PrayerScreen';
import { QiblaScreen } from '../screens/Qibla/QiblaScreen';
import { PrayerTimesScreen } from '../screens/PrayerTimes/PrayerTimesScreen';
import { CustomBottomTabBar } from '../components/BottomTabBar';

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  PrayerGuide: undefined;
  Qibla: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomBottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Prayer" component={PrayerTimesScreen} options={{ tabBarLabel: 'Prayer' }} />
      <Tab.Screen name="Home">
        {(props) => (
          <HomeScreen
            onResetOnboarding={() => props.navigation.replace('Onboarding')}
            navigation={props.navigation}
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
      <Stack.Navigator initialRouteName="MainTabs">
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="PrayerGuide"
          component={PrayerScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Qibla"
          component={QiblaScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
