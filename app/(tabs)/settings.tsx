import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { defaultFields } from '@/constants/Fields';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [visibleFields, setVisibleFields] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadVisibleFields();
  }, []);

  const loadVisibleFields = async () => {
    try {
      const saved = await AsyncStorage.getItem('visibleFields');
      if (saved) {
        setVisibleFields(JSON.parse(saved));
      } else {
        // Default: all fields visible
        const defaultVisible = defaultFields.reduce((acc, field) => {
          acc[field.id] = true;
          return acc;
        }, {} as Record<number, boolean>);
        setVisibleFields(defaultVisible);
        await AsyncStorage.setItem('visibleFields', JSON.stringify(defaultVisible));
      }
    } catch (error) {
      console.error('Error loading visible fields:', error);
    }
  };

  const toggleField = async (fieldId: number) => {
    const newVisibleFields = {
      ...visibleFields,
      [fieldId]: !visibleFields[fieldId]
    };
    setVisibleFields(newVisibleFields);
    try {
      await AsyncStorage.setItem('visibleFields', JSON.stringify(newVisibleFields));
    } catch (error) {
      console.error('Error saving visible fields:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Field Visibility</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Choose which fields to show in your notes. Hidden fields will not display but your data will be preserved.
          </ThemedText>
          {defaultFields.map((field) => (
            <TouchableOpacity 
              key={field.id}
              style={[
                styles.fieldOption,
                { backgroundColor: Colors[colorScheme ?? 'light'].background }
              ]}
              onPress={() => toggleField(field.id)}
            >
              <View style={styles.checkboxContainer}>
                <View style={[
                  styles.checkbox,
                  visibleFields[field.id] && styles.checkboxChecked,
                  { borderColor: Colors[colorScheme ?? 'light'].text }
                ]}>
                  {visibleFields[field.id] && (
                    <ThemedText style={styles.checkmark}>✓</ThemedText>
                  )}
                </View>
              </View>
              <ThemedText style={styles.fieldLabel}>{field.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  fieldOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 16,
  },
  fieldLabel: {
    fontSize: 16,
    flex: 1,
  },
}); 