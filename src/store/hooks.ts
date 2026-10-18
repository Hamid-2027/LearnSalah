import { useState, useEffect, useCallback } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';
import { toggleTheme, setTheme } from './slices/themeSlice';
import { openSidebar as openSidebarAction, closeSidebar as closeSidebarAction } from './slices/sidebarSlice';
import { updatePreferences, UserPreferencesState } from './slices/userPreferencesSlice';
import {
  setOnboardingName,
  setOnboardingGender,
  setOnboardingAvatar,
  setOnboardingAge,
  setDailyPrayersCount,
  setIslamicJourney,
  setPrayerConfidence,
  setRemindersEnabled,
  setBatteryOptimizationGranted,
  completePledge,
  completeOnboarding,
  goNextStep,
  goPrevStep,
  resetOnboarding,
  OnboardingGender,
  OnboardingAvatar,
  IslamicJourney,
  PrayerConfidence,
} from './slices/onboardingSlice';
import {
  setDayOffset as setDayOffsetAction,
  updateLocationPreference,
  fetchTimingsForLocation,
  fetchDateTimingIfNeeded,
  initLocationAndTimings,
} from './slices/prayerTimesSlice';
import { lightColors, darkColors, ThemeColors } from '../constants/themeColors';
import { SECT_METHOD_MAP } from '../constants/userPreferences';
import { UserLocationPref, format24To12, AlAdhanDayData } from '../services/aladhanService';
import {
  setCredentials,
  setGuestMode,
  logout,
  setLoading as setAuthLoading,
  setError as setAuthError,
  clearError as clearAuthError,
  AuthUser,
} from './slices/authSlice';

// ── Standard Typed Redux Hooks ────────────────────────────────────────────────
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ── Redux Theme Hook ──────────────────────────────────────────────────────────
export function useTheme() {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);

  const toggleDarkMode = useCallback(
    (value?: boolean) => {
      if (value !== undefined) {
        dispatch(setTheme(value));
      } else {
        dispatch(toggleTheme());
      }
    },
    [dispatch]
  );

  const colors: ThemeColors = isDarkMode ? darkColors : lightColors;

  return { isDarkMode, toggleDarkMode, colors };
}

// ── Redux Sidebar Hook ────────────────────────────────────────────────────────
export function useSidebar() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.sidebar.isOpen);

  const openSidebar = useCallback(() => {
    dispatch(openSidebarAction());
  }, [dispatch]);

  const closeSidebar = useCallback(() => {
    dispatch(closeSidebarAction());
  }, [dispatch]);

  return { isOpen, openSidebar, closeSidebar };
}

// ── Redux User Preferences Hook ────────────────────────────────────────────────
export function useUserPreferences() {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector((state) => state.userPreferences);

  const updatePreferencesHandler = useCallback(
    async (updates: Partial<UserPreferencesState>) => {
      dispatch(updatePreferences(updates));
    },
    [dispatch]
  );

  const prayerMethod = SECT_METHOD_MAP[preferences.sect] ?? 1;

  return {
    preferences,
    isLoaded: true,
    updatePreferences: updatePreferencesHandler,
    prayerMethod,
  };
}

// ── Redux Prayer Times Hook ───────────────────────────────────────────────────
export interface ActivePrayerStatus {
  currentPrayerEn: string;
  currentPrayerUr: string;
  nextPrayerEn: string;
  nextPrayerUr: string;
  nextPrayerTimeDisplay: string;
  countdownStr: string;
  activeIndex: number;
}

const PRAYER_NAMES = [
  { id: 'fajr', en: 'Fajr', ur: 'فجر', key: 'Fajr' },
  { id: 'sunrise', en: 'Sunrise', ur: 'اشراق', key: 'Sunrise' },
  { id: 'dhuhr', en: 'Dhuhr', ur: 'ظہر', key: 'Dhuhr' },
  { id: 'asr', en: 'Asr', ur: 'عصر', key: 'Asr' },
  { id: 'maghrib', en: 'Maghrib', ur: 'مغرب', key: 'Maghrib' },
  { id: 'isha', en: 'Isha', ur: 'عشاء', key: 'Isha' },
];

export function usePrayerTimes() {
  const dispatch = useAppDispatch();
  const { prayerMethod } = useUserPreferences();

  const locationPref = useAppSelector((state) => state.prayerTimes.locationPref);
  const todayData = useAppSelector((state) => state.prayerTimes.todayData);
  const selectedDateData = useAppSelector((state) => state.prayerTimes.selectedDateData);
  const dayOffset = useAppSelector((state) => state.prayerTimes.dayOffset);
  const isLoading = useAppSelector((state) => state.prayerTimes.isLoading);

  const [now, setNow] = useState<Date>(new Date());

  // Real-time 1-second countdown ticker
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize on mount or when prayerMethod changes
  useEffect(() => {
    dispatch(initLocationAndTimings(prayerMethod));
  }, [dispatch, prayerMethod]);

  // Handle dayOffset changes
  const setDayOffset = useCallback(
    (offset: number) => {
      dispatch(setDayOffsetAction(offset));
      dispatch(fetchDateTimingIfNeeded({ dayOffset: offset, locationPref }));
    },
    [dispatch, locationPref]
  );

  // Update location preference
  const updateLocation = useCallback(
    async (newPrefPartial: Partial<UserLocationPref>) => {
      await dispatch(updateLocationPreference(newPrefPartial));
    },
    [dispatch]
  );

  // Manual refresh
  const refreshTimings = useCallback(async () => {
    await dispatch(fetchTimingsForLocation({ ...locationPref, method: prayerMethod }));
  }, [dispatch, locationPref, prayerMethod]);

  // Active status calculation
  const calculateActiveStatus = (): ActivePrayerStatus => {
    const defaultRes: ActivePrayerStatus = {
      currentPrayerEn: 'Fajr',
      currentPrayerUr: 'فجر',
      nextPrayerEn: 'Dhuhr',
      nextPrayerUr: 'ظہر',
      nextPrayerTimeDisplay: '12:30 pm',
      countdownStr: '00:00:00',
      activeIndex: 0,
    };

    if (!todayData?.timings) return defaultRes;

    const timings = todayData.timings;
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const currentSecs = currentMins * 60 + now.getSeconds();

    const getMins = (timeStr: string): number => {
      if (!timeStr) return 0;
      const clean = timeStr.split(' ')[0];
      const [h, m] = clean.split(':').map((v) => parseInt(v, 10));
      return (h || 0) * 60 + (m || 0);
    };

    const prayerListWithMins = PRAYER_NAMES.map((p) => {
      const rawTime = (timings as any)[p.key] || '00:00';
      const mins = getMins(rawTime);
      return {
        ...p,
        rawTime,
        mins,
        timeDisplay: format24To12(rawTime),
      };
    });

    let activeIdx = 0;
    for (let i = 0; i < prayerListWithMins.length; i++) {
      if (currentMins >= prayerListWithMins[i].mins) {
        activeIdx = i;
      }
    }

    const nextIdx = (activeIdx + 1) % prayerListWithMins.length;
    const currentP = prayerListWithMins[activeIdx];
    const nextP = prayerListWithMins[nextIdx];

    let targetMins = nextP.mins;
    if (targetMins <= currentMins) {
      targetMins += 24 * 60;
    }

    const diffSecs = Math.max(0, targetMins * 60 - currentSecs);
    const hrs = Math.floor(diffSecs / 3600);
    const mins = Math.floor((diffSecs % 3600) / 60);
    const secs = diffSecs % 60;
    const countdownStr = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    return {
      currentPrayerEn: currentP.en,
      currentPrayerUr: currentP.ur,
      nextPrayerEn: nextP.en,
      nextPrayerUr: nextP.ur,
      nextPrayerTimeDisplay: nextP.timeDisplay,
      countdownStr,
      activeIndex: activeIdx,
    };
  };

  const activeStatus = calculateActiveStatus();

  return {
    locationPref,
    todayData,
    selectedDateData,
    dayOffset,
    setDayOffset,
    isLoading,
    activeStatus,
    updateLocation,
    refreshTimings,
  };
}

// ── Redux Onboarding Hook ─────────────────────────────────────────────────────
export function useOnboarding() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.onboarding);

  return {
    // Selectors
    ...state,

    // Step navigation
    goNext: useCallback(() => dispatch(goNextStep()), [dispatch]),
    goPrev: useCallback(() => dispatch(goPrevStep()), [dispatch]),

    // Field setters
    saveName: useCallback(
      (name: string) => dispatch(setOnboardingName(name)),
      [dispatch]
    ),
    saveGender: useCallback(
      (gender: OnboardingGender) => dispatch(setOnboardingGender(gender)),
      [dispatch]
    ),
    saveAvatar: useCallback(
      (avatar: OnboardingAvatar) => dispatch(setOnboardingAvatar(avatar)),
      [dispatch]
    ),
    saveAge: useCallback(
      (age: number | null) => dispatch(setOnboardingAge(age)),
      [dispatch]
    ),
    saveDailyPrayersCount: useCallback(
      (count: number) => dispatch(setDailyPrayersCount(count)),
      [dispatch]
    ),
    saveIslamicJourney: useCallback(
      (journey: IslamicJourney) => dispatch(setIslamicJourney(journey)),
      [dispatch]
    ),
    savePrayerConfidence: useCallback(
      (confidence: PrayerConfidence) => dispatch(setPrayerConfidence(confidence)),
      [dispatch]
    ),
    saveRemindersEnabled: useCallback(
      (enabled: boolean) => dispatch(setRemindersEnabled(enabled)),
      [dispatch]
    ),
    saveBatteryOptimization: useCallback(
      (granted: boolean) => dispatch(setBatteryOptimizationGranted(granted)),
      [dispatch]
    ),

    // Pledge & completion
    lockPledge: useCallback(() => dispatch(completePledge()), [dispatch]),
    finish: useCallback(() => dispatch(completeOnboarding()), [dispatch]),
    reset: useCallback(() => dispatch(resetOnboarding()), [dispatch]),
  };
}

// ── Redux Auth Hook ──────────────────────────────────────────────────────────
export function useAuth() {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((s) => s.auth);

  return {
    ...authState,
    setCredentials: useCallback(
      (payload: { user: AuthUser; sessionToken?: string | null }) =>
        dispatch(setCredentials(payload)),
      [dispatch]
    ),
    enterGuestMode: useCallback(() => dispatch(setGuestMode()), [dispatch]),
    signOut: useCallback(() => dispatch(logout()), [dispatch]),
    setLoading: useCallback(
      (loading: boolean) => dispatch(setAuthLoading(loading)),
      [dispatch]
    ),
    setError: useCallback(
      (err: string | null) => dispatch(setAuthError(err)),
      [dispatch]
    ),
    clearError: useCallback(() => dispatch(clearAuthError()), [dispatch]),
  };
}
