import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type IslamicSect = 'sunni' | 'shia';
export type UserGender = 'male' | 'female' | 'unset';

export interface UserPreferencesState {
  sect: IslamicSect;
  gender: UserGender;
}

const initialState: UserPreferencesState = {
  sect: 'sunni',
  gender: 'unset',
};

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferencesState>>) => {
      if (action.payload.sect) state.sect = action.payload.sect;
      if (action.payload.gender) state.gender = action.payload.gender;
    },
  },
});

export const { updatePreferences } = userPreferencesSlice.actions;
export default userPreferencesSlice.reducer;
