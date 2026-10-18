import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import reducers
import themeReducer from './slices/themeSlice';
import userPreferencesReducer from './slices/userPreferencesSlice';
import prayerTimesReducer from './slices/prayerTimesSlice';
import sidebarReducer from './slices/sidebarSlice';
import onboardingReducer from './slices/onboardingSlice';
import authReducer from './slices/authSlice';

const rootReducer = combineReducers({
  theme: themeReducer,
  userPreferences: userPreferencesReducer,
  prayerTimes: prayerTimesReducer,
  sidebar: sidebarReducer,
  onboarding: onboardingReducer,
  auth: authReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // Persist theme, user preferences, onboarding, and auth state
  whitelist: ['theme', 'userPreferences', 'onboarding', 'auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required to ignore redux-persist non-serializable actions
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
