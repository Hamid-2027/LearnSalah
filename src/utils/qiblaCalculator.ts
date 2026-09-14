/**
 * Qibla Direction & Distance Calculations (100% Offline)
 * Kaaba Coordinates: 21.4225° N, 39.8262° E
 */

export const KAABA_LAT = 21.4225;
export const KAABA_LON = 39.8262;

/**
 * Calculates the Qibla bearing angle from user's latitude and longitude.
 * @param lat User's latitude
 * @param lon User's longitude
 * @returns Bearing in degrees (0 - 360°) relative to True North.
 */
export function calculateQiblaDirection(lat: number, lon: number): number {
  const kaabaLatRad = KAABA_LAT * (Math.PI / 180);
  const kaabaLonRad = KAABA_LON * (Math.PI / 180);
  const userLatRad = lat * (Math.PI / 180);
  const userLonRad = lon * (Math.PI / 180);

  const deltaLon = kaabaLonRad - userLonRad;
  const y = Math.sin(deltaLon) * Math.cos(kaabaLatRad);
  const x =
    Math.cos(userLatRad) * Math.sin(kaabaLatRad) -
    Math.sin(userLatRad) * Math.cos(kaabaLatRad) * Math.cos(deltaLon);

  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  return (bearing + 360) % 360; // Normalize to 0 - 360°
}

/**
 * Calculates the great-circle distance between user's position and Kaaba in kilometers.
 * @param lat User's latitude
 * @param lon User's longitude
 * @returns Distance in kilometers
 */
export function calculateDistanceToMakkah(lat: number, lon: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (KAABA_LAT - lat) * (Math.PI / 180);
  const dLon = (KAABA_LON - lon) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat * (Math.PI / 180)) *
      Math.cos(KAABA_LAT * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Helper to turn bearing degrees into cardinal directions (e.g. 254° WSW)
 */
export function getCompassDirectionName(degree: number): string {
  const normalized = (degree + 360) % 360;
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW', 'N'
  ];
  const index = Math.round(normalized / 22.5);
  return directions[index];
}
