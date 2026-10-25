import { StyleSheet, Platform, Dimensions, Appearance } from 'react-native';

const { width } = Dimensions.get('window');

// Light and Dark theme color palettes
const LIGHT = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  secondary: '#3B82F6',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

const DARK = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  secondary: '#60A5FA',
  background: '#020B1C',
  surface: '#05142E',
  surfaceSecondary: '#091E42',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  border: '#183B70',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
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
    borderColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primaryDark,
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
