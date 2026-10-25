import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { C, StarryBackground } from '../Onboarding/components/OnboardingShared';

export const PrivacyScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <StarryBackground />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <Text style={styles.title}>Privacy Policy</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Last Updated */}
          <View style={styles.lastUpdated}>
            <Text style={styles.lastUpdatedText}>Last Updated: October 2024</Text>
          </View>

          {/* Introduction */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Introduction</Text>
            <Text style={styles.sectionText}>
              At Salah 786, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our application.
            </Text>
          </View>

          {/* Information We Collect */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information We Collect</Text>
            <Text style={styles.sectionText}>
              We collect the following types of information:
            </Text>
            <View style={styles.list}>
              <Text style={styles.bullet}>• Account information (name, email)</Text>
              <Text style={styles.bullet}>• Prayer tracking data</Text>
              <Text style={styles.bullet}>• Location data (for Qibla direction and prayer times)</Text>
              <Text style={styles.bullet}>• App usage and preferences</Text>
            </View>
          </View>

          {/* How We Use Your Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How We Use Your Information</Text>
            <Text style={styles.sectionText}>
              We use your information to:
            </Text>
            <View style={styles.list}>
              <Text style={styles.bullet}>• Provide accurate prayer times</Text>
              <Text style={styles.bullet}>• Calculate Qibla direction</Text>
              <Text style={styles.bullet}>• Track your prayer progress</Text>
              <Text style={styles.bullet}>• Send prayer reminders (if enabled)</Text>
              <Text style={styles.bullet}>• Improve app functionality</Text>
            </View>
          </View>

          {/* Data Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Security</Text>
            <Text style={styles.sectionText}>
              We implement appropriate security measures to protect your personal information:
            </Text>
            <View style={styles.list}>
              <Text style={styles.bullet}>• Data is encrypted in transit and at rest</Text>
              <Text style={styles.bullet}>• We use secure authentication protocols</Text>
              <Text style={styles.bullet}>• Regular security audits are conducted</Text>
              <Text style={styles.bullet}>• We comply with industry-standard security practices</Text>
            </View>
          </View>

          {/* Third-Party Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Third-Party Services</Text>
            <Text style={styles.sectionText}>
              We use the following third-party services:
            </Text>
            <View style={styles.list}>
              <Text style={styles.bullet}>• Supabase for authentication and data storage</Text>
              <Text style={styles.bullet}>• Google OAuth for sign-in functionality</Text>
              <Text style={styles.bullet}>• Location services for prayer times and Qibla</Text>
            </View>
          </View>

          {/* Your Rights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Rights</Text>
            <Text style={styles.sectionText}>
              You have the right to:
            </Text>
            <View style={styles.list}>
              <Text style={styles.bullet}>• Access your personal data</Text>
              <Text style={styles.bullet}>• Request data deletion</Text>
              <Text style={styles.bullet}>• Update your information</Text>
              <Text style={styles.bullet}>• Opt out of data collection</Text>
            </View>
          </View>

          {/* Contact Us */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.sectionText}>
              If you have any questions about this Privacy Policy, please contact us at:
            </Text>
            <Text style={styles.contactEmail}>support@salah786.com</Text>
          </View>

          {/* Closing */}
          <View style={styles.section}>
            <Text style={styles.sectionText}>
              By using Salah 786, you agree to the terms of this Privacy Policy. We reserve the right to update this policy periodically.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    marginTop: 20,
    marginBottom: 24,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: C.textSecondary,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: C.textSecondary,
    lineHeight: 22,
  },
  list: {
    marginTop: 12,
    marginLeft: 8,
  },
  bullet: {
    fontSize: 14,
    color: C.textSecondary,
    lineHeight: 24,
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 15,
    color: C.cyan,
    fontWeight: '600',
    marginTop: 8,
  },
});
