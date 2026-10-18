import { IslamicSect } from '../store/slices/userPreferencesSlice';

export const SECT_METHOD_MAP: Record<IslamicSect, number> = {
  sunni: 1,
  shia: 0,
};

export const SECT_METHOD_LABELS: Record<IslamicSect, string> = {
  sunni: 'University of Islamic Sciences, Karachi',
  shia: 'Shia Ithna-Ashari (LEVA, Qum)',
};
