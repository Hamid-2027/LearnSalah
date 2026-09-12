import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export const MoreScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="ellipsis-horizontal-circle-outline" size={48} color="#7966B2" />
        <Text style={styles.title}>More Services</Text>
        <Text style={styles.subtitle}>Explore settings, bookmarks, calendar & tools</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FA',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2B2342',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#7966B2',
    textAlign: 'center',
    marginTop: 6,
  },
});
