import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Phrase {
  id: string;
  arabic: string;
  transliteration: string;
  translation_ur: string;
  audio_ar?: string;
}

interface PhraseCardProps {
  phrase: Phrase;
  isActive: boolean;
  fontSize: number;
}

export const PhraseCard = React.memo(({ phrase, isActive, fontSize }: PhraseCardProps) => {
  const { isDarkMode, colors } = useTheme();

  const accentColor = colors.primary;
  const activeArabicColor = colors.textPrimary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isActive
            ? colors.surfaceSecondary
            : colors.surface,
          borderColor: isActive ? accentColor : colors.border,
        },
        isActive && (isDarkMode ? styles.activeShadowDark : styles.activeShadowLight),
      ]}
    >
      {isActive && <View style={[styles.activeAccentBar, { backgroundColor: accentColor }]} />}

      {isActive && (
        <View style={[styles.playingBadge, { backgroundColor: accentColor + '20' }]}>
          <Ionicons name="volume-medium" size={14} color={accentColor} />
          <Text style={[styles.playingBadgeText, { color: accentColor }]}>Reciting</Text>
        </View>
      )}

      <Text
        style={[
          styles.arabicText,
          {
            fontSize: fontSize * 1.55,
            color: isActive ? activeArabicColor : colors.textPrimary,
          },
        ]}
      >
        {phrase.arabic}
      </Text>

      <Text
        style={[
          styles.transliterationText,
          {
            fontSize: fontSize * 1.05,
            color: colors.primary,
          },
        ]}
      >
        {phrase.transliteration}
      </Text>

      <Text
        style={[
          styles.translationText,
          {
            fontSize: fontSize * 0.95,
            color: colors.textSecondary,
          },
        ]}
      >
        {phrase.translation_ur}
      </Text>
    </View>
  );
});
PhraseCard.displayName = 'PhraseCard';

const styles = StyleSheet.create({
  card: {
    padding: 18,
    paddingTop: 20,
    borderRadius: 16,
    marginVertical: 7,
    marginHorizontal: 16,
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
  },
  activeAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  playingBadge: {
    position: 'absolute',
    top: 10,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  playingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  activeShadowLight: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  activeShadowDark: {
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  arabicText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
    lineHeight: 42,
    letterSpacing: 0.5,
  },
  transliterationText: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  translationText: {
    textAlign: 'center',
    lineHeight: 22,
  },
});


