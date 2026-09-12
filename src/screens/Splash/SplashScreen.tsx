import React from 'react';
import { View, Image, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './SplashScreen.styles';

interface SplashScreenProps {
  onLayout: () => void;
}

export const SplashScreenComponent: React.FC<SplashScreenProps> = ({ onLayout }) => {
  return (
    <View style={styles.container} onLayout={onLayout}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#FFF8F3', '#E2ECE9']}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <View style={styles.content}>
          <Image 
            source={require('../../assets/images/splash-icon.png')} 
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.urduTitle}>نماز گائیڈ</Text>
          <Text style={styles.englishTitle}>Namaz Guide</Text>
          <Text style={styles.tagline}>Learn to pray, step by step.</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

