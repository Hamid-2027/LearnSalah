import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

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

  const menuItems = [
    { icon: 'home-outline', titleEn: 'Home', titleUr: 'صفحہ اول', type: 'ion' },
    { icon: 'book-open-outline', titleEn: 'Al-Quran', titleUr: 'القرآن', type: 'ion' },
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
        <View style={styles.drawerContainer}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Drawer Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.appIconBadge}>
                  <Image
                    source={require('../assets/images/app_logo.png')}
                    style={{ width: 36, height: 36 }}
                    resizeMode="contain"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.appTitle}>Learn Namaz & Quran</Text>
                  <Text style={styles.appSubtitle}>
                    {isUrdu ? 'اسلامی ہدایت نامہ' : 'Your Islamic Guide'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={24} color="#555" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Language Selection Row */}
            <View style={styles.langSection}>
              <Text style={styles.sectionLabel}>
                {isUrdu ? 'زبان منتخب کریں' : 'Language'}
              </Text>
              <View style={styles.langToggleRow}>
                <TouchableOpacity
                  style={[styles.langOption, lang === 'en' && styles.langOptionActive]}
                  onPress={() => onSwitchLang('en')}
                >
                  <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>
                    English
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.langOption, lang === 'ur' && styles.langOptionActive]}
                  onPress={() => onSwitchLang('ur')}
                >
                  <Text style={[styles.langText, lang === 'ur' && styles.langTextActive]}>
                    اردو
                  </Text>
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
                        <Ionicons name={item.icon as any} size={20} color="#7966B2" />
                      ) : (
                        <MaterialCommunityIcons name={item.icon as any} size={20} color="#7966B2" />
                      )}
                    </View>
                    <Text style={styles.menuText}>
                      {isUrdu ? item.titleUr : item.titleEn}
                    </Text>
                    <Feather name="chevron-right" size={16} color="#BBB" style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.versionFooter}>
                <Text style={styles.versionText}>Learn Namaz v1.0.0</Text>
                <Text style={styles.blessingText}>جزاك اللهُ خيراً</Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>

        {/* Backdrop Touchable (Right Side) */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
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
    paddingVertical: 12,
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
