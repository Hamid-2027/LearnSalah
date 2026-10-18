import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ── Types ─────────────────────────────────────────────────────────────────────

export type OnboardingGender = 'male' | 'female' | 'unset';
export type OnboardingAvatar =
  | 'oasis'
  | 'mountain'
  | 'sun'
  | 'moon'
  | 'olive'
  | 'unset';
export type IslamicJourney = 'born_muslim' | 'reverted' | null;
export type PrayerConfidence =
  | 'very_confident'
  | 'second_guess'
  | 'mostly_gaps'
  | 'never_learned'
  | null;

export interface OnboardingData {
  /** Step tracking */
  currentStep: number;
  totalSteps: number;

  /** Personal profile */
  name: string;
  gender: OnboardingGender;
  avatar: OnboardingAvatar;
  age: number | null;

  /** Prayer habits */
  dailyPrayersCount: number; // 0 to 5
  islamicJourney: IslamicJourney;
  prayerConfidence: PrayerConfidence;

  /** Permissions & Engagement */
  remindersEnabled: boolean;
  batteryOptimizationGranted: boolean;

  /** Sacred pledge */
  pledgeCompleted: boolean;
  pledgeCompletedAt: string | null;

  /** Completion state */
  isCompleted: boolean;
  completedAt: string | null;
}

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState: OnboardingData = {
  currentStep: 0,
  totalSteps: 13,

  name: '',
  gender: 'unset',
  avatar: 'unset',
  age: null,

  dailyPrayersCount: 0,
  islamicJourney: null,
  prayerConfidence: null,

  remindersEnabled: false,
  batteryOptimizationGranted: false,

  pledgeCompleted: false,
  pledgeCompletedAt: null,

  isCompleted: false,
  completedAt: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    // Step navigation
    setOnboardingStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    goNextStep: (state) => {
      state.currentStep = Math.min(state.currentStep + 1, state.totalSteps - 1);
    },
    goPrevStep: (state) => {
      state.currentStep = Math.max(state.currentStep - 1, 0);
    },

    // Personal profile
    setOnboardingName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setOnboardingGender: (state, action: PayloadAction<OnboardingGender>) => {
      state.gender = action.payload;
    },
    setOnboardingAvatar: (state, action: PayloadAction<OnboardingAvatar>) => {
      state.avatar = action.payload;
    },
    setOnboardingAge: (state, action: PayloadAction<number | null>) => {
      state.age = action.payload;
    },

    // Prayer habits
    setDailyPrayersCount: (state, action: PayloadAction<number>) => {
      state.dailyPrayersCount = Math.min(Math.max(action.payload, 0), 5);
    },
    setIslamicJourney: (state, action: PayloadAction<IslamicJourney>) => {
      state.islamicJourney = action.payload;
    },
    setPrayerConfidence: (
      state,
      action: PayloadAction<PrayerConfidence>
    ) => {
      state.prayerConfidence = action.payload;
    },

    // Permissions
    setRemindersEnabled: (state, action: PayloadAction<boolean>) => {
      state.remindersEnabled = action.payload;
    },
    setBatteryOptimizationGranted: (state, action: PayloadAction<boolean>) => {
      state.batteryOptimizationGranted = action.payload;
    },

    // Pledge
    completePledge: (state) => {
      state.pledgeCompleted = true;
      state.pledgeCompletedAt = new Date().toISOString();
    },

    // Completion
    completeOnboarding: (state) => {
      state.isCompleted = true;
      state.completedAt = new Date().toISOString();
    },

    // Reset (for dev/testing)
    resetOnboarding: () => initialState,
  },
});

export const {
  setOnboardingStep,
  goNextStep,
  goPrevStep,
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
  resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
