import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const PRIMARY = '#7966B2';
export const PRIMARY_GRADIENT = ['#A896D8', '#CBBDEB', '#D8CEF2'];
export const ACCENT_GOLD = '#E5A93C';
export const ACCENT_CORAL = '#C85A48';
export const BACKGROUND_LIGHT = '#F5F3FA';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT,
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
    color: '#2A2438',
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#7966B2',
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
    color: '#C85A48',
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
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginTop: -2,
  },
});
