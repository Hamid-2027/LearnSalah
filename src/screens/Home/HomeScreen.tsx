import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  FontAwesome6,
} from '@expo/vector-icons';

import { HeaderBanner } from '../../components/HeaderBanner';
import { SidebarDrawer } from '../../components/SidebarDrawer';
import { QuranBannerCard } from '../../components/QuranBannerCard';
import { FeatureCard } from '../../components/FeatureCard';
import { styles } from './HomeScreen.styles';

interface HomeScreenProps {
  onResetOnboarding?: () => void;
  navigation?: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onResetOnboarding, navigation }) => {
  const insets = useSafeAreaInsets();
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || 'en');
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const isUrdu = lang === 'ur';

  const switchLang = (l: string) => {
    i18n.changeLanguage(l);
    setLang(l);
  };

  // Feature cards data representing all cards from reference images
  const cardsData = [
    {
      id: 'al_quran',
      title: isUrdu ? 'القرآن' : 'Al-Quran',
      icon: <FontAwesome5 name="book-open" size={32} color="#E5A93C" />,
      cornerColor: '#D2C4ED',
      onPress: () => navigation?.navigate?.('Quran'),
    },
    {
      id: 'aalim360',
      title: isUrdu ? 'عالِم 360' : 'Search with Aalim360',
      badgeText: 'NEW',
      icon: (
        <View style={styles.aalimLogoContainer}>
          <Text style={styles.aalimLogoText}>360</Text>
        </View>
      ),
      cornerColor: '#D2C4ED',
    },
    {
      id: 'allah_names',
      title: isUrdu ? 'اسماء الحسنیٰ' : 'Allah Names',
      icon: <Text style={styles.arabicSymbolText}>الله</Text>,
      cornerColor: '#D2C4ED',
    },
    {
      id: 'qibla',
      title: isUrdu ? 'قبلہ نما' : 'Qibla Direction',
      icon: <MaterialCommunityIcons name="compass-outline" size={34} color="#C85A48" />,
      cornerColor: '#D2C4ED',
    },
    {
      id: 'supplication',
      title: isUrdu ? 'مسنون دعائیں' : 'Supplication',
      icon: <FontAwesome6 name="hands-praying" size={30} color="#C85A48" />,
      cornerColor: '#D2C4ED',
    },
    {
      id: 'tasbeeh',
      title: isUrdu ? 'تسبیح' : 'Tasbeeh',
      icon: <MaterialCommunityIcons name="counter" size={34} color="#C85A48" />,
      cornerColor: '#D2C4ED',
    },
    {
      id: 'shahadat',
      title: isUrdu ? 'کلمہ شہادت' : 'Shahadat',
      icon: <MaterialCommunityIcons name="hand-pointing-up" size={32} color="#C85A48" />,
      cornerColor: '#D2C4ED',
    },
    {
      id: 'stopping_rules',
      title: isUrdu ? 'قواعد وقف' : 'Rules of stopping',
      icon: <Text style={styles.arabicSymbolText}>وقفہ</Text>,
      cornerColor: '#D2C4ED',
    }
  ];

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right']}>
      <StatusBar style="dark" />

      {/* Main Scroll Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Part with Hamburger Icon & Date (No Remove Ads) */}
        <HeaderBanner
          onOpenSidebar={() => setSidebarVisible(true)}
          hijriDate={isUrdu ? '۱۸ ربیع الاول، ۱۴۴۸' : '18 Rabi I, 1448'}
          gregorianDate="Tue 01-09-26"
          currentPrayer={isUrdu ? 'اشراق' : 'SUNRISE'}
          nextPrayer={isUrdu ? 'ظہر' : 'DHUHR'}
          nextPrayerTime="12:08 pm"
        />

        {/* Quran Calligraphy Banner Card */}
        <QuranBannerCard onReadQuran={() => navigation?.navigate?.('Quran')} />

        {/* Section Heading */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>
            {isUrdu ? 'اسلامی خدمات' : 'Islamic Services'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {isUrdu ? 'تمام زمرہ جات' : 'All Categories'}
          </Text>
        </View>

        {/* Grid of Feature Cards with Corner Ornaments */}
        <View style={styles.gridContainer}>
          {cardsData.map((card) => (
            <View key={card.id} style={styles.gridCol}>
              <FeatureCard
                title={card.title}
                icon={card.icon}
                badgeText={card.badgeText}
                cornerColor={card.cornerColor}
                onPress={card.onPress}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating 360 / WhatsApp Action Widget Button */}
      <TouchableOpacity
        style={[styles.floatingWidgetBtn, { bottom: 75 + Math.max(insets.bottom, 8) }]}
        activeOpacity={0.85}
        onPress={() => setSidebarVisible(true)}
      >
        <View style={styles.floatingWidgetCircle}>
          <MaterialCommunityIcons name="whatsapp" size={24} color="#FFFFFF" />
          <Text style={styles.floatingWidgetText}>360</Text>
        </View>
      </TouchableOpacity>

      {/* Sidebar Drawer (Opens from Left Edge) */}
      <SidebarDrawer
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        lang={lang}
        onSwitchLang={switchLang}
      />
    </SafeAreaView>
  );
};
