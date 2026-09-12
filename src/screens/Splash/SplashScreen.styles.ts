import { StyleSheet, Platform } from 'react-native';

const PRIMARY_COLOR = '#2E7D5B';
const ACCENT_GOLD = '#C5A85A';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  urduTitle: {
    color: PRIMARY_COLOR,
    fontSize: 34,
    fontWeight: 'bold',
    fontFamily: Platform.select({
      ios: 'Noto Nastaliq Urdu',
      android: 'serif',
    }),
    lineHeight: Platform.select({
      ios: 52,
      android: 44,
    }),
    marginBottom: 8,
    textAlign: 'center',
  },
  englishTitle: {
    color: PRIMARY_COLOR,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    color: '#607268',
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.8,
    textAlign: 'center',
  },
});

