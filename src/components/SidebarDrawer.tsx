import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface SidebarDrawerProps {
  visible: boolean;
  onClose: () => void;
  lang: string;
  onSwitchLang: (lang: string) => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  visible,
  onClose,
  lang,
  onSwitchLang,
}) => {
  const isUrdu = lang === 'ur';
  const { isDarkMode, toggleDarkMode, colors } = useTheme();

  const menuItems = [
    { icon: 'home-outline', titleEn: 'Home', titleUr: 'صفحہ اول', type: 'ion' },
    { icon: 'book-outline', titleEn: 'Al-Quran', titleUr: 'القرآن', type: 'ion' },
    { icon: 'star-outline', titleEn: 'Hadith Collection', titleUr: 'حدیث کا مجموعہ', type: 'ion' },
    { icon: 'compass-outline', titleEn: 'Qibla Direction', titleUr: 'قبلہ کی سمت', type: 'mci' },
    { icon: 'clock-outline', titleEn: 'Prayer Timings', titleUr: 'اوقاتِ نماز', type: 'mci' },
    { icon: 'hand-heart-outline', titleEn: 'Duas & Supplications', titleUr: 'دعائیں اور مناجات', type: 'mci' },
    { icon: 'counter', titleEn: 'Digital Tasbeeh', titleUr: 'ڈیجیٹل تسبیح', type: 'mci' },
    { icon: 'bookmark-outline', titleEn: 'Saved Bookmarks', titleUr: 'محفوظ شدہ', type: 'ion' },
    { icon: 'settings-outline', titleEn: 'Settings', titleUr: 'ترتیبات', type: 'ion' },
    { icon: 'share-social-outline', titleEn: 'Share App', titleUr: 'ایپ شیئر کریں', type: 'ion' },
    { icon: 'star-half-outline', titleEn: 'Rate Us', titleUr: 'درجہ بندی کریں', type: 'ion' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Drawer Content (Left Side) */}
        <View style={[styles.drawerContainer, { backgroundColor: colors.surface }]}>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
            {/* Drawer Header */}
            <View style={[styles.header, { backgroundColor: colors.surfaceSecondary, borderBottomColor: colors.border }]}>
              <View style={styles.headerContent}>
                <View style={[styles.appIconBadge, isDarkMode && { backgroundColor: '#2E2745' }]}>
                  <Image
                    source={require('../assets/images/app_logo.png')}
                    style={{ width: 36, height: 36 }}
                    resizeMode="contain"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.appTitle, { color: colors.textPrimary }]}>Learn Namaz & Quran</Text>
                  <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>
                    {isUrdu ? 'اسلامی ہدایت نامہ' : 'Your Islamic Guide'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={24} color={isDarkMode ? '#AAA' : '#555'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Language Selection Row */}
            <View style={[styles.langSection, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                {isUrdu ? 'زبان منتخب کریں' : 'Language'}
              </Text>
              <View style={[styles.langToggleRow, { backgroundColor: colors.surfaceSecondary }]}>
                <TouchableOpacity
                  style={[styles.langOption, lang === 'en' && { backgroundColor: colors.primary }]}
                  onPress={() => onSwitchLang('en')}
                >
                  <Text style={[styles.langText, { color: lang === 'en' ? '#FFF' : colors.textSecondary }]}>
                    English
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.langOption, lang === 'ur' && { backgroundColor: colors.primary }]}
                  onPress={() => onSwitchLang('ur')}
                >
                  <Text style={[styles.langText, { color: lang === 'ur' ? '#FFF' : colors.textSecondary }]}>
                    اردو
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Appearance / Dark Mode Selection Row */}
            <View style={[styles.langSection, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                {isUrdu ? 'تھیم (موضوع)' : 'Appearance'}
              </Text>
              <View style={[styles.langToggleRow, { backgroundColor: colors.surfaceSecondary }]}>
                <TouchableOpacity
                  style={[styles.langOption, !isDarkMode && { backgroundColor: colors.primary }]}
                  onPress={() => toggleDarkMode(false)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="sunny-outline" size={15} color={!isDarkMode ? '#FFF' : colors.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={[styles.langText, { color: !isDarkMode ? '#FFF' : colors.textSecondary }]}>
                      {isUrdu ? 'روشن' : 'Light'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.langOption, isDarkMode && { backgroundColor: colors.primary }]}
                  onPress={() => toggleDarkMode(true)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="moon" size={15} color={isDarkMode ? '#FFF' : colors.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={[styles.langText, { color: isDarkMode ? '#FFF' : colors.textSecondary }]}>
                      {isUrdu ? 'تاریک' : 'Dark'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Menu Options ScrollView */}
            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.menuList}>
                {menuItems.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={onClose}
                  >
                    <View style={styles.iconContainer}>
                      {item.type === 'ion' ? (
                        <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                      ) : (
                        <MaterialCommunityIcons name={item.icon as any} size={20} color={colors.primary} />
                      )}
                    </View>
                    <Text style={[styles.menuText, { color: colors.textPrimary }]}>
                      {isUrdu ? item.titleUr : item.titleEn}
                    </Text>
                    <Feather name="chevron-right" size={16} color={isDarkMode ? '#666' : '#BBB'} style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.versionFooter}>
                <Text style={styles.versionText}>Learn Namaz v1.0.0</Text>
                <Text style={[styles.blessingText, { color: colors.primary }]}>جزاك اللهُ خيراً</Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>

        {/* Backdrop Touchable (Right Side) */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[styles.backdrop, { backgroundColor: colors.modalOverlay }]} />
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawerContainer: {
    width: '78%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: '#F5F2FC',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8F2',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EAE4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2B2342',
  },
  appSubtitle: {
    fontSize: 12,
    color: '#7966B2',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  langSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EFF5',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777',
    marginBottom: 8,
  },
  langToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F0EDF7',
    borderRadius: 10,
    padding: 3,
  },
  langOption: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  langOptionActive: {
    backgroundColor: '#7966B2',
  },
  langText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  langTextActive: {
    color: '#FFF',
  },
  menuScroll: {
    flex: 1,
  },
  menuList: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  versionFooter: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 11,
    color: '#AAA',
  },
  blessingText: {
    fontSize: 13,
    color: '#7966B2',
    marginTop: 4,
    fontWeight: '600',
  },
});

