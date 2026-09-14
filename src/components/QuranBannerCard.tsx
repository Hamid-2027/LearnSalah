import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { CardCornerDecoration } from './CornerDecoration';

interface QuranBannerCardProps {
  onReadQuran?: () => void;
}

export const QuranBannerCard: React.FC<QuranBannerCardProps> = ({ onReadQuran }) => {
  const { isDarkMode, colors } = useTheme();

  return (
    <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <CardCornerDecoration color={colors.gold} size={36} offset={2} />
      {/* Background Watermark Pattern */}
      <View style={styles.watermarkContainer}>
        <MaterialCommunityIcons name="flower-poppy" size={90} color={isDarkMode ? 'rgba(255,255,255,0.05)' : colors.surfaceSecondary} />
      </View>

      {/* Content Row */}
      <View style={styles.contentRow}>
        {/* Left Side: Calligraphy & Action Button */}
        <View style={styles.leftSection}>
          <Text style={[styles.arabicCalligraphy, { color: colors.textPrimary }]}>القرآن الكريم</Text>
          
          <TouchableOpacity
            style={[styles.readBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={onReadQuran}
          >
            <Text style={styles.readBtnText}>Read Quran</Text>
          </TouchableOpacity>
        </View>

        {/* Right Side: Graphic Illustration */}
        <View style={styles.rightSection}>
          <View style={styles.readerIllustration}>
            {/* Person sitting in Thobe icon graphic */}
            <View style={styles.rehalStand}>
              <FontAwesome5 name="book-open" size={26} color={colors.primary} />
            </View>

            <View style={styles.personBody}>
              {/* Kufi / Cap */}
              <View style={[styles.personCap, { backgroundColor: colors.primary }]} />
              {/* Person Head */}
              <View style={styles.personHead} />
              <View style={[styles.personThobe, { backgroundColor: isDarkMode ? colors.surfaceSecondary : '#F0EFF5', borderColor: isDarkMode ? colors.border : '#D4CEE8' }]} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#C5BAEB',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginHorizontal: 16,
    marginVertical: 12,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#8C77C7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  watermarkContainer: {
    position: 'absolute',
    top: -15,
    left: -15,
    opacity: 0.6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    alignItems: 'flex-start',
    zIndex: 2,
  },
  arabicCalligraphy: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E1A29',
    marginBottom: 12,
    letterSpacing: 0.5,
    fontFamily: Platform.select({ ios: 'Times New Roman', android: 'serif' }),
  },
  readBtn: {
    backgroundColor: '#3E965E',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  readBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  readerIllustration: {
    width: 100,
    height: 90,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  rehalStand: {
    position: 'absolute',
    left: 10,
    bottom: 8,
    alignItems: 'center',
  },
  personBody: {
    alignItems: 'center',
    position: 'absolute',
    right: 12,
    bottom: 4,
  },
  personCap: {
    width: 16,
    height: 6,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: '#3E965E',
    marginBottom: 1,
  },
  personHead: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FADCB8',
    marginBottom: 2,
  },
  personThobe: {
    width: 32,
    height: 38,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#F0EFF5',
    borderWidth: 1.5,
    borderColor: '#D4CEE8',
  },
});
