import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
        <TouchableOpacity 
          style={[
            styles.option,
            { backgroundColor: Colors[colorScheme ?? 'light'].background }
          ]}
        >
          <ThemedText style={styles.optionText}>Theme</ThemedText>
          <ThemedText style={styles.optionValue}>
            {colorScheme === 'dark' ? 'Dark' : 'Light'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>About</ThemedText>
        <TouchableOpacity 
          style={[
            styles.option,
            { backgroundColor: Colors[colorScheme ?? 'light'].background }
          ]}
        >
          <ThemedText style={styles.optionText}>Version</ThemedText>
          <ThemedText style={styles.optionValue}>1.0.0</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
  },
  optionValue: {
    fontSize: 16,
    opacity: 0.6,
  },
}); 