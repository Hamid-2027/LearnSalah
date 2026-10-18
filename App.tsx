import React, { useState, useEffect, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { SplashScreenComponent } from './src/screens/Splash/SplashScreen';
import { AppNavigator } from './src/navigation/AppNavigator';

// Keep native splash screen visible safely while app loads
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Ignore error if already hidden or unavailable */
});

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const hideSplash = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch (e) {
      // Ignore native splash hide errors
    } finally {
      setShowSplash(false);
    }
  }, []);

  useEffect(() => {
    // Guaranteed timer to dismiss splash after 2.5s regardless of native layout events
    const timer = setTimeout(() => {
      hideSplash();
    }, 2500);

    return () => clearTimeout(timer);
  }, [hideSplash]);

  // Show custom splash screen immediately
  if (showSplash) {
    return <SplashScreenComponent onLayout={hideSplash} />;
  }

  // Show main app with navigator stack wrapped in Redux Provider & PersistGate
  return (
    <Provider store={store}>
      <PersistGate loading={<SplashScreenComponent onLayout={() => {}} />} persistor={persistor}>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}


