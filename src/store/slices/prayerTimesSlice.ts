import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  AlAdhanDayData,
  UserLocationPref,
  DEFAULT_LOCATION,
  loadLocationPref,
  saveLocationPref,
  fetchDayTimings,
  fetchAndCacheCalendar,
} from '../../services/aladhanService';

export interface PrayerTimesState {
  locationPref: UserLocationPref;
  todayData: AlAdhanDayData | null;
  selectedDateData: AlAdhanDayData | null;
  dayOffset: number;
  isLoading: boolean;
  scheduleCache: Record<string, AlAdhanDayData>;
}

const initialState: PrayerTimesState = {
  locationPref: DEFAULT_LOCATION,
  todayData: null,
  selectedDateData: null,
  dayOffset: 0,
  isLoading: true,
  scheduleCache: {},
};

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const initLocationAndTimings = createAsyncThunk(
  'prayerTimes/initLocationAndTimings',
  async (prayerMethod: number, { dispatch }) => {
    const pref = await loadLocationPref();
    const loc = { ...pref, method: prayerMethod };
    dispatch(setLocationPref(loc));
    await dispatch(fetchTimingsForLocation(loc));
  }
);

export const fetchTimingsForLocation = createAsyncThunk(
  'prayerTimes/fetchTimingsForLocation',
  async (location: UserLocationPref, { dispatch }) => {
    const today = new Date();
    const data = await fetchDayTimings(location, today);
    
    // Background fetch calendar cache
    fetchAndCacheCalendar(location, today).then((calendarMap) => {
      if (Object.keys(calendarMap).length > 0) {
        dispatch(updateScheduleCache(calendarMap));
      }
    });

    return data;
  }
);

export const fetchDateTimingIfNeeded = createAsyncThunk(
  'prayerTimes/fetchDateTimingIfNeeded',
  async (
    { dayOffset, locationPref }: { dayOffset: number; locationPref: UserLocationPref },
    { getState }
  ) => {
    const state = (getState() as { prayerTimes: PrayerTimesState }).prayerTimes;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dayOffset);

    const dd = String(targetDate.getDate()).padStart(2, '0');
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const yyyy = targetDate.getFullYear();
    const dateStr = `${yyyy}-${mm}-${dd}`;

    if (state.scheduleCache[dateStr]) {
      return state.scheduleCache[dateStr];
    }

    const data = await fetchDayTimings(locationPref, targetDate);
    return data;
  }
);

export const updateLocationPreference = createAsyncThunk(
  'prayerTimes/updateLocationPreference',
  async (
    newPrefPartial: Partial<UserLocationPref>,
    { getState, dispatch }
  ) => {
    const currentLoc = (getState() as { prayerTimes: PrayerTimesState }).prayerTimes.locationPref;
    const updated = { ...currentLoc, ...newPrefPartial };
    await saveLocationPref(updated);
    dispatch(setLocationPref(updated));
    await dispatch(fetchTimingsForLocation(updated));
  }
);

// ── Slice Definition ──────────────────────────────────────────────────────────

const prayerTimesSlice = createSlice({
  name: 'prayerTimes',
  initialState,
  reducers: {
    setLocationPref: (state, action: PayloadAction<UserLocationPref>) => {
      state.locationPref = action.payload;
    },
    setDayOffset: (state, action: PayloadAction<number>) => {
      state.dayOffset = action.payload;
    },
    updateScheduleCache: (state, action: PayloadAction<Record<string, AlAdhanDayData>>) => {
      state.scheduleCache = { ...state.scheduleCache, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimingsForLocation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTimingsForLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.todayData = action.payload;
          if (state.dayOffset === 0) {
            state.selectedDateData = action.payload;
          }
        }
      })
      .addCase(fetchTimingsForLocation.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchDateTimingIfNeeded.fulfilled, (state, action) => {
        if (action.payload) {
          state.selectedDateData = action.payload;
          state.scheduleCache[action.payload.dateStr] = action.payload;
        }
      });
  },
});

export const { setLocationPref, setDayOffset, updateScheduleCache } = prayerTimesSlice.actions;
export default prayerTimesSlice.reducer;
