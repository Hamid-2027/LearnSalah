export type PrayerType = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerItem {
  id: PrayerType;
  name: string;
  detailKey: string; // Key for i18n
  defaultDetail: string;
  arabic: string;
  timeKey: string; // Key for i18n
  defaultTime: string;
  icon: string;
  iconLib: 'ion' | 'mci';
  iconColor: string;
  iconBg: string;
  rakat: number;
}

export const PRAYERS_DATA: PrayerItem[] = [
  {
    id: 'Fajr',
    name: 'Fajr',
    detailKey: 'ibadaat.prayers.fajr.detail',
    defaultDetail: '2 Rakat',
    arabic: 'فجر',
    timeKey: 'ibadaat.prayers.fajr.time',
    defaultTime: '05:00 AM · Dawn',
    icon: 'partly-sunny-outline',
    iconLib: 'ion',
    iconColor: '#A78BFA',
    iconBg: 'rgba(167,139,250,0.12)',
    rakat: 2,
  },
  {
    id: 'Dhuhr',
    name: 'Dhuhr',
    detailKey: 'ibadaat.prayers.dhuhr.detail',
    defaultDetail: '4 Rakat',
    arabic: 'ظہر',
    timeKey: 'ibadaat.prayers.dhuhr.time',
    defaultTime: '12:30 PM · Midday',
    icon: 'weather-sunny',
    iconLib: 'mci',
    iconColor: '#FBBF24',
    iconBg: 'rgba(251,191,36,0.12)',
    rakat: 4,
  },
  {
    id: 'Asr',
    name: 'Asr',
    detailKey: 'ibadaat.prayers.asr.detail',
    defaultDetail: '4 Rakat',
    arabic: 'عصر',
    timeKey: 'ibadaat.prayers.asr.time',
    defaultTime: '04:30 PM · Afternoon',
    icon: 'time-outline',
    iconLib: 'ion',
    iconColor: '#F97316',
    iconBg: 'rgba(249,115,22,0.12)',
    rakat: 4,
  },
  {
    id: 'Maghrib',
    name: 'Maghrib',
    detailKey: 'ibadaat.prayers.maghrib.detail',
    defaultDetail: '3 Rakat',
    arabic: 'مغرب',
    timeKey: 'ibadaat.prayers.maghrib.time',
    defaultTime: '06:40 PM · Sunset',
    icon: 'weather-sunset-down',
    iconLib: 'mci',
    iconColor: '#FB923C',
    iconBg: 'rgba(251,146,60,0.12)',
    rakat: 3,
  },
  {
    id: 'Isha',
    name: 'Isha',
    detailKey: 'ibadaat.prayers.isha.detail',
    defaultDetail: '4 Rakat',
    arabic: 'عشاء',
    timeKey: 'ibadaat.prayers.isha.time',
    defaultTime: '08:15 PM · Night',
    icon: 'moon-outline',
    iconLib: 'ion',
    iconColor: '#60A5FA',
    iconBg: 'rgba(96,165,250,0.12)',
    rakat: 4,
  },
];
