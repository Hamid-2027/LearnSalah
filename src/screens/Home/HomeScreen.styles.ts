import { StyleSheet, Platform, Dimensions, Appearance } from 'react-native';

const { width } = Dimensions.get('window');

// Light and Dark theme color palettes
const LIGHT = {
  primary: '#087F5B',
  primaryDark: '#056044',
  secondary: '#C99A2E',
  background: '#F9F7F0',
  surface: '#FFFFFF',
  surfaceSecondary: '#EEF5F1',
  textPrimary: '#17201C',
  textSecondary: '#64736C',
  border: '#DCE5E0',
  success: '#2E9B68',
  warning: '#D99A24',
  error: '#D9534F',
};

const DARK = {
  primary: '#636363ff',
  primaryDark: '#0B5D45',
  secondary: '#D8B35A',
  background: '#0B1713',
  surface: '#12241D',
  surfaceSecondary: '#193329',
  textPrimary: '#F3F6F3',
  textSecondary: '#AABBB3',
  border: '#29443A',
  success: '#4DC58D',
  warning: '#E2B94F',
  error: '#F27672',
};

const isDarkMode = Appearance.getColorScheme() === 'dark';
const colors = isDarkMode ? DARK : LIGHT;

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110, // Extra space for floating button and bottom tab bar
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  gridCol: {
    width: '50%',
  },

  // Custom Icon Badges & Calligraphy graphics inside feature cards
  arabicSymbolText: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Times New Roman', android: 'serif' }),
  },
  aalimLogoContainer: {
    borderWidth: 2,
    borderColor: '#E5A93C',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF5',
  },
  aalimLogoText: {
    color: '#E5A93C',
    fontSize: 14,
    fontWeight: '900',
  },

  // Floating 360 Action Button
  floatingWidgetBtn: {
    position: 'absolute',
    bottom: 80,
    right: 18,
    zIndex: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingWidgetCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#57b852ff',
    ...Platform.select({
      ios: {
        shadowColor: '#1F7E37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  floatingWidgetText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '900',
    marginTop: -2,
  },
});
