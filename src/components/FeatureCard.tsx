import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { CardCornerDecoration } from './CornerDecoration';

interface FeatureCardProps {
  title: string;
  icon: React.ReactNode;
  onPress?: () => void;
  badgeText?: string;
  cornerColor?: string;
  cardStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<ViewStyle>;
  isDark?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  icon,
  onPress,
  badgeText,
  cornerColor,
  cardStyle,
  titleStyle,
  isDark = false,
}) => {
  const defaultCornerColor = isDark ? '#7A7A80' : '#8E88B4';
  const finalCornerColor = cornerColor || defaultCornerColor;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isDark ? styles.cardDark : styles.cardLight,
        cardStyle,
      ]}
      activeOpacity={0.78}
      onPress={onPress}
    >
      {/* 4 Islamic/Arabesque Corner Ornaments from side-corner-design.svg */}
      <CardCornerDecoration color={finalCornerColor} size={40} offset={2} />

      {/* Top "NEW" Badge Ribbon if provided */}
      {badgeText && (
        <View style={styles.badgeRibbon}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      )}

      {/* Centered Content Block */}
      <View style={styles.contentContainer}>
        {/* Centered Icon */}
        <View style={styles.iconContainer}>
          {icon}
        </View>

        {/* Centered Card Title */}
        <Text
          style={[
            styles.titleText,
            isDark ? styles.titleDark : styles.titleLight,
            titleStyle,
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 125,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    margin: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8E8EE',
  },
  cardDark: {
    backgroundColor: '#38383A',
    borderColor: '#4A4A4E',
  },
  badgeRibbon: {
    position: 'absolute',
    top: -1,
    alignSelf: 'center',
    backgroundColor: '#FF2D55',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  titleLight: {
    color: '#1F1F1F',
  },
  titleDark: {
    color: '#FFFFFF',
  },
});
