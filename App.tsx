import React, { useState, useCallback, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreenComponent } from './src/screens/Splash/SplashScreen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const hasHiddenNativeSplash = useRef(false);

  const onLayoutRootView = useCallback(async () => {
    if (!hasHiddenNativeSplash.current) {
      hasHiddenNativeSplash.current = true;
      // Hide native splash immediately - our custom one is already rendered
      await SplashScreen.hideAsync();

      // Show custom splash for 2.5 seconds (between 2-3 seconds)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Hide custom splash and show main app
      setShowSplash(false);
    }
  }, []);

  // Show custom splash screen immediately
  if (showSplash) {
    return <SplashScreenComponent onLayout={onLayoutRootView} />;
  }

  // Show main app with navigator stack
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

