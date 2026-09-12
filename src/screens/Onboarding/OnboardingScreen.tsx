import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { 
  styles, 
  PRIMARY_COLOR, 
  CREAM_PEACH, 
  SAGE_GREEN, 
  ACCENT_GOLD,
  ACCENT_CORAL 
} from './OnboardingScreen.styles';

interface OnboardingScreenProps {
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const { t, i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentLang = i18n.language;

  const handleNext = () => {
    if (currentIndex < 4) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  // Render the illustrations based on current page index
  const renderIllustration = () => {
    switch (currentIndex) {
      case 0: // Welcome screen
        return (
          <View style={styles.mosqueWrapper}>
            {/* Soft background glow */}
            <View style={styles.mosqueGlow} />
            
            {/* Mosque minarets */}
            <View style={[styles.mosqueMinaret, styles.minaretLeft]}>
              <View style={styles.minaretDome} />
            </View>
            <View style={[styles.mosqueMinaret, styles.minaretRight]}>
              <View style={styles.minaretDome} />
            </View>
            
            {/* Main dome */}
            <View style={styles.mosqueDome} />
            
            {/* Door */}
            <View style={styles.mosqueDoor} />
            
            {/* Glowing crescent moon */}
            <View style={styles.crescentGlow}>
              <Ionicons name="moon-sharp" size={32} color={ACCENT_GOLD} />
            </View>
          </View>
        );

      case 1: // Offline access
        return (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {/* Circular outline badge */}
            <View style={styles.circleBadge}>
              <Feather name="wifi-off" size={36} color={PRIMARY_COLOR} />
            </View>
            
            {/* Phone Mockup */}
            <View style={styles.phoneMockup}>
              <View style={styles.phoneHeader} />
              
              <View style={styles.phoneScreenContent}>
                <Ionicons name="checkmark-circle" size={24} color={PRIMARY_COLOR} style={{ marginBottom: 4 }} />
                <Text style={styles.phoneMockText}>وضو گائیڈ</Text>
                <Text style={styles.phoneMockText}>مکمل نماز</Text>
                <Text style={styles.phoneMockText}>قبلہ رخ</Text>
              </View>
              
              {/* Signal badge overlay */}
              <View style={styles.phoneSignalBadge}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
            </View>
          </View>
        );

      case 2: // Audio recitation
        return (
          <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {/* Headphones badge */}
            <View style={styles.circleBadge}>
              <Feather name="headphones" size={36} color={PRIMARY_COLOR} />
            </View>
            
            {/* Sound Wave */}
            <View style={styles.audioWaveContainer}>
              <View style={[styles.waveBar, { height: 15 }]} />
              <View style={[styles.waveBar, styles.goldWaveBar, { height: 25 }]} />
              <View style={[styles.waveBar, { height: 40 }]} />
              <View style={[styles.waveBar, styles.goldWaveBar, { height: 50 }]} />
              <View style={[styles.waveBar, { height: 35 }]} />
              <View style={[styles.waveBar, styles.goldWaveBar, { height: 20 }]} />
              <View style={[styles.waveBar, { height: 45 }]} />
              <View style={[styles.waveBar, styles.goldWaveBar, { height: 30 }]} />
              <View style={[styles.waveBar, { height: 15 }]} />
            </View>
          </View>
        );

      case 3: // Learning Level system
        return (
          <View style={styles.levelsContainer}>
            {/* Level 1: Emerald Active */}
            <View style={[styles.levelBadge, styles.levelBadgeActive, { transform: [{ translateY: 15 }] }]}>
              <Text style={[styles.levelText, styles.levelTextActive]}>سطح ۱</Text>
              <Text style={styles.levelTitle}>Level 1</Text>
            </View>
            
            {/* Level 2: Outline Emerald */}
            <View style={[styles.levelBadge, styles.levelBadgeOutline, { transform: [{ translateY: 0 }] }]}>
              <Text style={[styles.levelText, styles.levelTextOutline]}>سطح ۲</Text>
              <Text style={[styles.levelTitle, { color: PRIMARY_COLOR }]}>Level 2</Text>
            </View>
            
            {/* Level 3: Faint Outline */}
            <View style={[styles.levelBadge, styles.levelBadgeFaint, { transform: [{ translateY: -15 }] }]}>
              <Text style={[styles.levelText, styles.levelTextFaint]}>سطح ۳</Text>
              <Text style={[styles.levelTitle, { color: '#9BB5AB' }]}>Level 3</Text>
            </View>
          </View>
        );

      case 4: // Final screen / get started
        return (
          <View style={styles.mosqueWrapper}>
            <View style={[styles.mosqueGlow, { backgroundColor: '#F9E5C9' }]} />
            
            {/* Crescent and mosque star illustration */}
            <Ionicons name="moon-sharp" size={72} color={PRIMARY_COLOR} />
            <View style={{ position: 'absolute', top: 50 }}>
              <FontAwesome5 name="pray" size={48} color={ACCENT_GOLD} />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[CREAM_PEACH, SAGE_GREEN]}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header with Skip Button (not visible on the last screen) */}
          <View style={styles.header}>
            {currentIndex < 4 ? (
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.7}>
                <Text style={styles.skipText}>
                  {currentLang === 'ur' ? 'چھوڑیں' : 'Skip'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Main Content Area */}
          <View style={styles.content}>
            {/* Top Illustration Wrapper */}
            <View style={styles.illustrationWrapper}>
              {renderIllustration()}
            </View>

            {/* Content white card */}
            <View style={styles.card}>
              <Text style={styles.urduHeading}>
                {t(`onboarding.screen${currentIndex + 1}.headingUrdu`)}
              </Text>
              <Text style={styles.englishSubtitle}>
                {t(`onboarding.screen${currentIndex + 1}.subtitle`)}
              </Text>

              {/* Language toggler visible only on final screen */}
              {currentIndex === 4 && (
                <View style={styles.toggleContainer}>
                  <View style={styles.togglePill}>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        currentLang === 'ur' && styles.toggleButtonActive,
                      ]}
                      onPress={() => changeLanguage('ur')}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.toggleText,
                          styles.toggleTextUrdu,
                          currentLang === 'ur' && styles.toggleTextActive,
                        ]}
                      >
                        اردو
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        currentLang === 'en' && styles.toggleButtonActive,
                      ]}
                      onPress={() => changeLanguage('en')}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.toggleText,
                          currentLang === 'en' && styles.toggleTextActive,
                        ]}
                      >
                        English
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Bottom Action Footer */}
          <View style={styles.footer}>
            {/* Pagination dots */}
            <View style={styles.paginationDots}>
              {[0, 1, 2, 3, 4].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentIndex === index && styles.dotActive,
                  ]}
                />
              ))}
            </View>

            {/* Next or Get Started button */}
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.9}
            >
              <View style={styles.nextButtonContent}>
                {currentIndex < 4 ? (
                  <>
                    <Text style={styles.nextButtonTextUrdu}>اگلا</Text>
                    <Text style={styles.nextButtonTextEnglish}>Next</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.nextButtonTextUrdu}>شروع کریں</Text>
                    <Text style={styles.nextButtonTextEnglish}>Get Started</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};
