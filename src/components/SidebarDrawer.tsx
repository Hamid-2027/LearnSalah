import React, { useState, useRef, useEffect } from 'react';
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
  Dimensions,
  Animated,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useAuth } from '../store/hooks';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.80, 300);

interface SidebarDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ visible, onClose }) => {
  const navigation = useNavigation<any>();
  const { user, isAuthenticated, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const [lang, setLang] = useState<'en' | 'ur'>('en');

  const insets   = useSafeAreaInsets();
  const topPad   = insets.top > 0 ? insets.top : (Platform.OS === 'android' ? 24 : 44);
  const botPad   = insets.bottom > 0 ? insets.bottom : 16;

  // ── Slide + fade animation ───────────────────────────────────────────────────
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 68, friction: 11 }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 210, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  // ── Color aliases ────────────────────────────────────────────────────────────
  const C = colors;
  const primary = C.primary;

  // ── Navigation helper ────────────────────────────────────────────────────────
  const go = (screen: string) => {
    onClose();
    setTimeout(() => navigation.navigate(screen), 220);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: () => { signOut(); onClose(); setTimeout(() => navigation.navigate('Auth'), 220); },
      },
    ]);
  };

  // ── Shared row renderer ──────────────────────────────────────────────────────
  const NavRow = ({
    iconName, iconType = 'ion', label, onPress, isLast = false,
  }: {
    iconName: string; iconType?: 'ion' | 'mci'; label: string;
    onPress: () => void; isLast?: boolean;
  }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: primary + '15' }]}>
        {iconType === 'mci'
          ? <MaterialCommunityIcons name={iconName as any} size={18} color={primary} />
          : <Ionicons name={iconName as any} size={18} color={primary} />
        }
      </View>
      <Text style={[styles.rowLabel, { color: C.textPrimary }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={15} color={C.textSecondary} />
    </TouchableOpacity>
  );

  // ── Section wrapper ──────────────────────────────────────────────────────────
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: C.textSecondary }]}>
        {title.toUpperCase()}
      </Text>
      <View style={[styles.sectionCard, { backgroundColor: C.surfaceSecondary, borderColor: C.border }]}>
        {children}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>

        {/* ── Backdrop ── */}
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={[styles.backdrop, { backgroundColor: C.modalOverlay }]} />
          </TouchableWithoutFeedback>
        </Animated.View>

        {/* ── Drawer ── */}
        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor: C.surface,
              borderRightColor: C.border,
              paddingTop: topPad,
              paddingBottom: botPad,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >

          {/* ════ HEADER ════ */}
          <LinearGradient
            colors={isDarkMode ? ['#051833', C.surface] : ['#EFF6FF', '#FFFFFF']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            {/* Brand */}
            <View style={styles.brandRow}>
              <View style={[styles.appIconBg, { backgroundColor: primary + '20', borderColor: primary + '35' }]}>
                <Image
                  source={require('../assets/images/app_logo.png')}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.appName, { color: C.textPrimary }]}>Salah 786</Text>
                <Text style={[styles.appTagline, { color: C.textSecondary }]}>Your Islamic Companion</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={[styles.closeBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
              >
                <Ionicons name="close" size={17} color={C.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Profile card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => { if (!isAuthenticated) go('Auth'); }}
              style={[styles.profileCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(37,99,235,0.06)', borderColor: primary + '28' }]}
            >
              <View style={[styles.avatar, { backgroundColor: primary + '20', borderColor: primary + '40' }]}>
                <Ionicons name="person" size={17} color={primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.profileName, { color: C.textPrimary }]} numberOfLines={1}>
                  {isAuthenticated ? (user?.fullName || user?.email || 'Believer') : 'Guest User'}
                </Text>
                <Text style={[styles.profileSub, { color: C.textSecondary }]} numberOfLines={1}>
                  {isAuthenticated ? (user?.email || 'Signed in') : 'Tap to sign in'}
                </Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: isAuthenticated ? C.success : C.textSecondary + '60' }]} />
            </TouchableOpacity>
          </LinearGradient>

          {/* ════ SCROLLABLE MENU ════ */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >

            {/* ── Navigate ── */}
            <Section title="Navigate">
              <NavRow iconName="home-outline"  label="Home"         onPress={() => go('Home')} />
              <NavRow iconName="hands-pray"    iconType="mci" label="Prayer Guide" onPress={() => go('Prayer')} isLast />
            </Section>

            {/* ── Preferences ── */}
            <Section title="Preferences">

              {/* Dark Mode with Switch */}
              <View style={[styles.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border }]}>
                <View style={[styles.rowIcon, { backgroundColor: primary + '15' }]}>
                  <Ionicons name={isDarkMode ? 'moon' : 'sunny-outline'} size={18} color={primary} />
                </View>
                <Text style={[styles.rowLabel, { color: C.textPrimary }]}>Dark Mode</Text>
                <Switch
                  value={isDarkMode}
                  onValueChange={(val) => toggleDarkMode(val)}
                  thumbColor={isDarkMode
                    ? (Platform.OS === 'android' ? '#FFFFFF' : undefined)
                    : (Platform.OS === 'android' ? '#F1F5F9' : undefined)
                  }
                  trackColor={{ false: C.border, true: primary }}
                  ios_backgroundColor={C.border}
                />
              </View>

              {/* Language */}
              <View style={[styles.row, { borderBottomWidth: 0 }]}>
                <View style={[styles.rowIcon, { backgroundColor: primary + '15' }]}>
                  <Ionicons name="language-outline" size={18} color={primary} />
                </View>
                <Text style={[styles.rowLabel, { color: C.textPrimary }]}>Language</Text>
                {/* EN / UR pill toggle */}
                <View style={[styles.langPills, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setLang('en')}
                    style={[styles.langPill, lang === 'en' && { backgroundColor: primary }]}
                  >
                    <Text style={[styles.langPillText, { color: lang === 'en' ? '#FFF' : C.textSecondary }]}>EN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setLang('ur')}
                    style={[styles.langPill, lang === 'ur' && { backgroundColor: primary }]}
                  >
                    <Text style={[styles.langPillText, { color: lang === 'ur' ? '#FFF' : C.textSecondary }]}>اردو</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </Section>

            {/* ── Account ── */}
            <Section title="Account">
              {isAuthenticated ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleSignOut}
                  style={[styles.row, { borderBottomWidth: 0 }]}
                >
                  <View style={[styles.rowIcon, { backgroundColor: C.error + '15' }]}>
                    <Ionicons name="log-out-outline" size={18} color={C.error} />
                  </View>
                  <Text style={[styles.rowLabel, { color: C.error }]}>Sign Out</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => go('Auth')}
                  style={styles.signInWrap}
                >
                  <LinearGradient
                    colors={[C.primary, C.primaryDark]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.signInGrad}
                  >
                    <Ionicons name="person-add-outline" size={16} color="#FFF" />
                    <Text style={styles.signInText}>Sign In / Register</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </Section>

          </ScrollView>

          {/* ════ FOOTER ════ */}
          <View style={[styles.footer, { borderTopColor: C.border }]}>
            <Text style={[styles.footerVersion, { color: C.textSecondary }]}>v1.0.0</Text>
            <Text style={[styles.footerBlessing, { color: primary }]}>جزاك اللهُ خيراً</Text>
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1 },

  drawer: {
    width: DRAWER_WIDTH,
    height: SCREEN_HEIGHT,
    borderRightWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 16,
  },

  // Header
  header: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appIconBg: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  appTagline: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Profile
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    borderRadius: 13,
    borderWidth: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { fontSize: 13, fontWeight: '700' },
  profileSub:  { fontSize: 10.5, marginTop: 1 },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },

  // Sections
  section: {
    marginTop: 18,
    paddingHorizontal: 14,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 7,
    paddingHorizontal: 2,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },

  // Language pills
  langPills: {
    flexDirection: 'row',
    borderRadius: 9,
    padding: 3,
    gap: 2,
  },
  langPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Auth
  signInWrap: {
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  signInGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
  },
  signInText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.1,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerVersion:  { fontSize: 11, fontWeight: '500' },
  footerBlessing: { fontSize: 13, fontWeight: '700', marginTop: 4 },
});
