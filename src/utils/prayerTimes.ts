export interface PrayerScheduleInfo {
  currentPrayer: string;
  nextPrayer: string;
  nextPrayerTime: string;
  gregorianDate: string;
  hijriDate: string;
}

const PRAYER_TIMINGS = [
  { id: 'fajr', en: 'FAJR', ur: 'فجر', minutes: 5 * 60 + 0, timeDisplay: '05:00 am' },
  { id: 'sunrise', en: 'SUNRISE', ur: 'اشراق', minutes: 6 * 60 + 15, timeDisplay: '06:15 am' },
  { id: 'dhuhr', en: 'DHUHR', ur: 'ظہر', minutes: 12 * 60 + 30, timeDisplay: '12:30 pm' },
  { id: 'asr', en: 'ASR', ur: 'عصر', minutes: 16 * 60 + 30, timeDisplay: '04:30 pm' },
  { id: 'maghrib', en: 'MAGHRIB', ur: 'مغرب', minutes: 18 * 60 + 40, timeDisplay: '06:40 pm' },
  { id: 'isha', en: 'ISHA', ur: 'عشاء', minutes: 20 * 60 + 0, timeDisplay: '08:00 pm' },
];

export function getPrayerScheduleForNow(lang: string = 'en'): PrayerScheduleInfo {
  const now = new Date();
  const isUrdu = lang === 'ur';

  // Format Gregorian Date dynamically (e.g. "Wed 09-09-26")
  const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysUr = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];
  const dayName = isUrdu ? daysUr[now.getDay()] : daysEn[now.getDay()];
  
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const gregorianDate = `${dayName} ${dd}-${mm}-${yy}`;

  // Hijri Date estimation
  const hijriDate = isUrdu ? '۱۸ ربیع الاول، ۱۴۴۸' : '18 Rabi I, 1448';

  // Current Minutes since midnight
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let currentItem = PRAYER_TIMINGS[PRAYER_TIMINGS.length - 1]; // Default Isha
  let nextItem = PRAYER_TIMINGS[0]; // Default Fajr

  for (let i = 0; i < PRAYER_TIMINGS.length; i++) {
    const item = PRAYER_TIMINGS[i];
    const nextIdx = (i + 1) % PRAYER_TIMINGS.length;
    const nextItemCandidate = PRAYER_TIMINGS[nextIdx];

    if (i === PRAYER_TIMINGS.length - 1) {
      if (currentMinutes >= item.minutes || currentMinutes < PRAYER_TIMINGS[0].minutes) {
        currentItem = item;
        nextItem = PRAYER_TIMINGS[0];
        break;
      }
    } else {
      if (currentMinutes >= item.minutes && currentMinutes < nextItemCandidate.minutes) {
        currentItem = item;
        nextItem = nextItemCandidate;
        break;
      }
    }
  }

  return {
    currentPrayer: isUrdu ? currentItem.ur : currentItem.en,
    nextPrayer: isUrdu ? nextItem.ur : nextItem.en,
    nextPrayerTime: nextItem.timeDisplay,
    gregorianDate,
    hijriDate,
  };
}
