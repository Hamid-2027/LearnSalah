import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AlAdhanTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak?: string;
}

export interface AlAdhanHijriDate {
  day: string;
  monthEn: string;
  monthAr: string;
  year: string;
  designation: string;
  formattedEn: string;
  formattedUr: string;
}

export interface AlAdhanDayData {
  dateStr: string; // YYYY-MM-DD
  timings: AlAdhanTimings;
  hijri: AlAdhanHijriDate;
  gregorianReadable: string;
  locationName: string;
  methodName: string;
}

const STORAGE_KEY_LOCATION = '@aladhan_user_location';
const STORAGE_KEY_CACHE_PREFIX = '@aladhan_cache_v1_';

export interface UserLocationPref {
  isGPS: boolean;
  cityName: string;
  countryName: string;
  lat: number;
  lon: number;
  method: number; // Default 1: University of Islamic Sciences, Karachi
}

export const DEFAULT_LOCATION: UserLocationPref = {
  isGPS: false,
  cityName: 'Karachi',
  countryName: 'Pakistan',
  lat: 24.8607,
  lon: 67.0011,
  method: 1, // University of Islamic Sciences, Karachi
};

/**
 * Helper to convert 24-hour time string ("18:40" or "18:40 (PKT)") to 12-hour format ("06:40 pm")
 */
export function format24To12(time24: string): string {
  if (!time24) return '12:00 pm';
  const cleanTime = time24.split(' ')[0]; // Strip timezone offset if present
  const [hStr, mStr] = cleanTime.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);

  if (isNaN(h) || isNaN(m)) return time24;

  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  if (h === 0) h = 12;

  const hFormatted = String(h).padStart(2, '0');
  const mFormatted = String(m).padStart(2, '0');
  return `${hFormatted}:${mFormatted} ${ampm}`;
}

/**
 * Format Hijri date into clean readable English and Urdu strings,
 * applying Hijri date offset (default -3 days to align standard Saudi astronomical
 * AlAdhan API with regional moon-sighting calendar like South Asia/Pakistan/India/UK).
 */
function parseHijri(hijriRaw: any, adjustmentDays: number = -3): AlAdhanHijriDate {
  let dayNum = parseInt(hijriRaw?.day || '27', 10);
  let monthNum = hijriRaw?.month?.number || 4;
  let yearNum = parseInt(hijriRaw?.year || '1448', 10);

  if (isNaN(dayNum)) dayNum = 27;
  if (isNaN(monthNum)) monthNum = 4;
  if (isNaN(yearNum)) yearNum = 1448;

  const monthsEn = [
    "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
    "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
  ];

  const monthsAr = [
    'مُحَرَّم', 'صَفَر', 'رَبِيع الأَوَّل', 'رَبِيع الثَّانِي',
    'جُمَادَى الأُولَى', 'جُمَادَى الآخِرَة', 'رَجَب', 'شَعْبَان',
    'رَمَضَان', 'شَوَّال', 'ذُو القَعْدَة', 'ذُو الحِجَّة'
  ];

  let d = dayNum + adjustmentDays;
  let mIdx = monthNum - 1;
  let y = yearNum;

  if (d < 1) {
    mIdx = (mIdx - 1 + 12) % 12;
    if (mIdx === 11) y -= 1;
    d += 30;
  } else if (d > 30) {
    d -= 30;
    mIdx = (mIdx + 1) % 12;
    if (mIdx === 0) y += 1;
  }

  const dayStr = String(d);
  const monthEnStr = monthsEn[mIdx] || hijriRaw?.month?.en || "Rabi' al-Thani";
  const monthArStr = monthsAr[mIdx] || hijriRaw?.month?.ar || "رَبِيع الثَّانِي";
  const yearStr = String(y);
  const designation = hijriRaw?.designation?.abbreviated || 'AH';

  const formattedEn = `${dayStr} ${monthEnStr} ${yearStr} ${designation}`;
  const formattedUr = `${dayStr} ${monthArStr} ${yearStr} هـ`;

  return {
    day: dayStr,
    monthEn: monthEnStr,
    monthAr: monthArStr,
    year: yearStr,
    designation,
    formattedEn,
    formattedUr,
  };
}

/**
 * Save user location preference to AsyncStorage
 */
export async function saveLocationPref(pref: UserLocationPref): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(pref));
  } catch (e) {
    console.error('Error saving location pref', e);
  }
}

/**
 * Load user location preference from AsyncStorage
 */
export async function loadLocationPref(): Promise<UserLocationPref> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_LOCATION);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading location pref', e);
  }
  return DEFAULT_LOCATION;
}

/**
 * Fetch timings for a single day from AlAdhan API with local cache fallback
 */
export async function fetchDayTimings(
  location: UserLocationPref,
  dateObj: Date = new Date()
): Promise<AlAdhanDayData | null> {
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  const dateStr = `${yyyy}-${mm}-${dd}`;
  const apiDateParam = `${dd}-${mm}-${yyyy}`;

  // Cache key includes method so Sunni/Shia caches are isolated
  const cacheKey = `${STORAGE_KEY_CACHE_PREFIX}${location.cityName.toLowerCase()}_m${location.method}_${dateStr}`;

  // 1. Try fetching from network API
  try {
    let url = '';
    if (location.isGPS && location.lat && location.lon) {
      url = `https://api.aladhan.com/v1/timings/${apiDateParam}?latitude=${location.lat}&longitude=${location.lon}&method=${location.method}`;
    } else {
      url = `https://api.aladhan.com/v1/timingsByCity/${apiDateParam}?city=${encodeURIComponent(
        location.cityName
      )}&country=${encodeURIComponent(location.countryName)}&method=${location.method}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json?.data) {
        const data = json.data;
        const result: AlAdhanDayData = {
          dateStr,
          timings: data.timings,
          hijri: parseHijri(data.date?.hijri),
          gregorianReadable: data.date?.readable || `${dd} ${mm} ${yyyy}`,
          locationName: `${location.cityName}, ${location.countryName}`,
          methodName: data.meta?.method?.name || 'Univ. of Islamic Sciences, Karachi',
        };

        // Cache response locally for offline support
        AsyncStorage.setItem(cacheKey, JSON.stringify(result)).catch(() => {});
        return result;
      }
    }
  } catch (err) {
    console.log('AlAdhan network request failed or offline, trying cache...', err);
  }

  // 2. Offline Fallback: Load from AsyncStorage cache
  try {
    const cachedRaw = await AsyncStorage.getItem(cacheKey);
    if (cachedRaw) {
      return JSON.parse(cachedRaw);
    }
  } catch (cacheErr) {
    console.error('Cache read error', cacheErr);
  }

  return null;
}

/**
 * Pre-fetch and cache 7 to 30 days of prayer timings using AlAdhan Calendar API
 */
export async function fetchAndCacheCalendar(
  location: UserLocationPref,
  dateObj: Date = new Date()
): Promise<Record<string, AlAdhanDayData>> {
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  const scheduleMap: Record<string, AlAdhanDayData> = {};

  try {
    let url = '';
    if (location.isGPS && location.lat && location.lon) {
      url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${location.lat}&longitude=${location.lon}&method=${location.method}`;
    } else {
      url = `https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${encodeURIComponent(
        location.cityName
      )}&country=${encodeURIComponent(location.countryName)}&method=${location.method}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data)) {
        for (const dayItem of json.data) {
          const gDate = dayItem.date?.gregorian?.date; // "DD-MM-YYYY"
          if (gDate) {
            const [dd, mm, yyyy] = gDate.split('-');
            const dateStr = `${yyyy}-${mm}-${dd}`;

            const dayData: AlAdhanDayData = {
              dateStr,
              timings: dayItem.timings,
              hijri: parseHijri(dayItem.date?.hijri),
              gregorianReadable: dayItem.date?.readable || `${dd} ${mm} ${yyyy}`,
              locationName: `${location.cityName}, ${location.countryName}`,
              methodName: dayItem.meta?.method?.name || 'Univ. of Islamic Sciences, Karachi',
            };

            scheduleMap[dateStr] = dayData;

            // Save individual day to cache
            // Cache key includes method so Sunni/Shia caches are isolated
            const cacheKey = `${STORAGE_KEY_CACHE_PREFIX}${location.cityName.toLowerCase()}_m${location.method}_${dateStr}`;
            AsyncStorage.setItem(cacheKey, JSON.stringify(dayData)).catch(() => {});
          }
        }
      }
    }
  } catch (err) {
    console.log('Failed to fetch AlAdhan calendar, using local storage cache', err);
  }

  return scheduleMap;
}
