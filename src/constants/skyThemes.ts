import { Dimensions } from 'react-native';
import { PrayerType } from '../data/ibadaatData';

export interface SkyThemeConfig {
  gradientColors: [string, string, string];
  isDarkContent: boolean;
  textColorPrimary: string;
  textColorSecondary: string;
  sunX: number; // Left position in pixels along Diurnal Arc
  sunY: number; // Top position in pixels along Diurnal Arc
  sunScale: number;
  sunType: 'hidden' | 'dawn_sun' | 'midday_sun' | 'golden_sun' | 'dusk_sun' | 'moon';
  sunColor: string;
  rayColor: string;
}

export const getSkyThemes = (screenWidth: number = Dimensions.get('window').width): Record<PrayerType, SkyThemeConfig> => ({
  Fajr: {
    gradientColors: ['#0D0F1E', '#1A1E3C', '#3D2B4F'],
    isDarkContent: false,
    textColorPrimary: '#E8D5FF',
    textColorSecondary: 'rgba(220, 200, 255, 0.80)',
    sunX: -100,
    sunY: 200,
    sunScale: 0.7,
    sunType: 'hidden',
    sunColor: '#FDE047',
    rayColor: 'rgba(253, 224, 71, 0.25)',
  },
  Dhuhr: {
    gradientColors: ['#EAB308', '#FDE047', '#FEF9C3'],
    isDarkContent: true,
    textColorPrimary: '#1E293B',
    textColorSecondary: '#475569',
    sunX: screenWidth / 2 - 32,
    sunY: 6,
    sunScale: 1.1,
    sunType: 'midday_sun',
    sunColor: '#EA580C',
    rayColor: 'rgba(234, 88, 12, 0.45)',
  },
  Asr: {
    gradientColors: ['#F97316', '#FBBF24', '#FEF3C7'],
    isDarkContent: true,
    textColorPrimary: '#1E293B',
    textColorSecondary: '#475569',
    sunX: screenWidth * 0.65,
    sunY: 28,
    sunScale: 1.0,
    sunType: 'golden_sun',
    sunColor: '#EA580C',
    rayColor: 'rgba(234, 88, 12, 0.45)',
  },
  Maghrib: {
    gradientColors: ['#1A0533', '#7C1D56', '#E8450A'],
    isDarkContent: false,
    textColorPrimary: '#FFE4CC',
    textColorSecondary: 'rgba(255, 220, 180, 0.88)',
    sunX: screenWidth - 88,
    sunY: 54,
    sunScale: 1.05,
    sunType: 'dusk_sun',
    sunColor: '#FF5722',
    rayColor: 'rgba(255, 120, 50, 0.50)',
  },
  Isha: {
    gradientColors: ['#060818', '#0D1B3E', '#162448'],
    isDarkContent: false,
    textColorPrimary: '#E2ECFF',
    textColorSecondary: 'rgba(180, 210, 255, 0.82)',
    sunX: screenWidth - 92,
    sunY: 8,
    sunScale: 1.05,
    sunType: 'moon',
    sunColor: '#F8FAFC',
    rayColor: 'rgba(200, 220, 255, 0.35)',
  },
});
