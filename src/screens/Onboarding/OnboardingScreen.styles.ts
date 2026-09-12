import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const PRIMARY_COLOR = '#2E7D5B';
export const SAGE_GREEN = '#E2ECE9';
export const CREAM_PEACH = '#FFF8F3';
export const ACCENT_GOLD = '#C5A85A';
export const ACCENT_CORAL = '#E57373';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 10,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 15,
    color: PRIMARY_COLOR,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  illustrationWrapper: {
    height: height * 0.38,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  // Custom illustration style shapes
  mosqueWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  mosqueGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#FAF0D7',
    opacity: 0.5,
  },
  crescentGlow: {
    position: 'absolute',
    top: 20,
    right: 35,
    opacity: 0.8,
  },
  mosqueDome: {
    width: 90,
    height: 90,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    backgroundColor: PRIMARY_COLOR,
    borderWidth: 2,
    borderColor: ACCENT_GOLD,
    bottom: -10,
    position: 'absolute',
  },
  mosqueMinaret: {
    width: 20,
    height: 120,
    backgroundColor: PRIMARY_COLOR,
    borderWidth: 1.5,
    borderColor: ACCENT_GOLD,
    position: 'absolute',
  },
  minaretLeft: {
    left: 20,
    bottom: -10,
  },
  minaretRight: {
    right: 20,
    bottom: -10,
  },
  minaretDome: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ACCENT_GOLD,
    position: 'absolute',
    top: -15,
  },
  mosqueDoor: {
    width: 24,
    height: 40,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: ACCENT_GOLD,
    position: 'absolute',
    bottom: -10,
    zIndex: 2,
  },

  // Circle Badge styles
  circleBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  phoneMockup: {
    width: 140,
    height: 220,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  phoneHeader: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ECEFF1',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneScreenContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneSignalBadge: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: ACCENT_GOLD,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  phoneWifiOffText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  phoneMockText: {
    fontSize: 8,
    color: PRIMARY_COLOR,
    fontWeight: '600',
    marginTop: 4,
  },

  // Audio elements
  audioWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    width: '100%',
    marginTop: 20,
    gap: 6,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: PRIMARY_COLOR,
  },
  goldWaveBar: {
    backgroundColor: ACCENT_GOLD,
  },

  // Level Badge Elements
  levelsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 120,
    gap: 20,
    marginBottom: 20,
  },
  levelBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  levelBadgeActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  levelBadgeOutline: {
    backgroundColor: '#FFFFFF',
    borderColor: PRIMARY_COLOR,
  },
  levelBadgeFaint: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C8DCD5',
    opacity: 0.6,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  levelTextActive: {
    color: '#FFFFFF',
  },
  levelTextOutline: {
    color: PRIMARY_COLOR,
  },
  levelTextFaint: {
    color: '#9BB5AB',
  },
  levelTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: ACCENT_GOLD,
    marginTop: 2,
  },

  // Card Content Styles
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  urduHeading: {
    fontSize: 26,
    color: '#1C3127',
    textAlign: 'center',
    writingDirection: 'rtl',
    fontFamily: Platform.select({
      ios: 'Noto Nastaliq Urdu',
      android: 'serif',
    }),
    lineHeight: Platform.select({
      ios: 42,
      android: 38,
    }),
    marginBottom: 10,
    fontWeight: 'bold',
  },
  englishSubtitle: {
    fontSize: 14,
    color: '#607268',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },

  // Screen 5 specific language toggle
  toggleContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  togglePill: {
    flexDirection: 'row',
    backgroundColor: '#EAEFEF',
    borderRadius: 25,
    padding: 4,
    width: '80%',
    borderWidth: 1,
    borderColor: '#DFE5E5',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 21,
  },
  toggleButtonActive: {
    backgroundColor: PRIMARY_COLOR,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#607268',
  },
  toggleTextUrdu: {
    fontFamily: Platform.select({
      ios: 'Noto Nastaliq Urdu',
      android: 'serif',
    }),
    fontSize: 15,
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Bottom action bar styling
  footer: {
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    alignItems: 'center',
    gap: 20,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C2DFD3',
  },
  dotActive: {
    width: 24,
    backgroundColor: PRIMARY_COLOR,
  },
  nextButton: {
    backgroundColor: PRIMARY_COLOR,
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  nextButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonTextUrdu: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.select({
      ios: 'Noto Nastaliq Urdu',
      android: 'serif',
    }),
  },
  nextButtonTextEnglish: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: -1,
  },
});
