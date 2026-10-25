import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '../screens/Home/HomeScreen';
import { LearnScreen } from '../screens/Learn/LearnScreen';
import { LessonsListScreen } from '../screens/Learn/LessonsListScreen';
import { IbadaatScreen } from '../screens/Ibadaat/IbadaatScreen';
import { MoreScreen } from '../screens/More/MoreScreen';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { AuthScreen } from '../screens/Auth/AuthScreen';
import { PrivacyScreen } from '../screens/Privacy/PrivacyScreen';
import { PrayerScreen } from '../screens/PrayerScreen';
import { QiblaScreen } from '../screens/Qibla/QiblaScreen';
import { PrayerTimesScreen } from '../screens/PrayerTimes/PrayerTimesScreen';
import { CustomBottomTabBar } from '../components/BottomTabBar';
import { SidebarDrawer } from '../components/SidebarDrawer';
import { useSidebar, useAppSelector, useAppDispatch, useAuth } from '../store/hooks';
import { resetOnboarding } from '../store/slices/onboardingSlice';

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Privacy: undefined;
  MainTabs: undefined;
  PrayerGuide: { prayerId?: string } | undefined;
  Qibla: undefined;
  LessonsList: { level: string; moduleId?: string; initialStepId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  const dispatch = useAppDispatch();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomBottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="PrayerTimes" component={PrayerTimesScreen} options={{ tabBarLabel: 'Time' }} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Home">
        {(props) => (
          <HomeScreen
            onResetOnboarding={() => {
              dispatch(resetOnboarding());
              props.navigation.replace('Onboarding');
            }}
            navigation={props.navigation}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Prayer" component={IbadaatScreen} options={{ tabBarLabel: 'Prayer' }} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

/**
 * Inner navigator wrapper — reads Redux sidebar + onboarding + auth state.
 * New users → Onboarding → Auth; returning users → MainTabs directly.
 */
function AppWithSidebar() {
  const { isOpen, closeSidebar } = useSidebar();
  const isOnboardingComplete = useAppSelector((s) => s.onboarding.isCompleted);
  const { isAuthenticated, isGuest } = useAuth();

  const initialRoute: keyof RootStackParamList = !isOnboardingComplete
    ? 'Onboarding'
    : isAuthenticated || isGuest
      ? 'MainTabs'
      : 'Auth';

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator initialRouteName={initialRoute}>
        {/* Onboarding — gesture swipe-back disabled so user can't skip */}
        <Stack.Screen
          name="Onboarding"
          options={{ headerShown: false, gestureEnabled: false }}
        >
          {(props) => (
            <OnboardingScreen
              onFinish={() => {
                if (isAuthenticated || isGuest) {
                  props.navigation.replace('MainTabs');
                } else {
                  props.navigation.replace('Auth');
                }
              }}
            />
          )}
        </Stack.Screen>

        {/* Custom Supabase Auth Screen */}
        <Stack.Screen
          name="Auth"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_bottom',
          }}
        >
          {(props) => (
            <AuthScreen
              onSuccess={() => props.navigation.replace('MainTabs')}
              onGuestAccess={() => props.navigation.replace('MainTabs')}
            />
          )}
        </Stack.Screen>

        {/* Privacy Policy Screen */}
        <Stack.Screen
          name="Privacy"
          component={PrivacyScreen}
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />

        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
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
        <Stack.Screen
          name="LessonsList"
          component={LessonsListScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>

      {/* ✅ Global sidebar — rendered once here, accessible from every tab */}
      <SidebarDrawer
        visible={isOpen}
        onClose={closeSidebar}
      />
    </View>
  );
}

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <AppWithSidebar />
    </NavigationContainer>
  );
};
