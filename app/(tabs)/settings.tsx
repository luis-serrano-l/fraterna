import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { addCustomField, defaultFields, editCustomField, editFieldLabel, Field, getAllFields } from '@/constants/Fields';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [visibleFields, setVisibleFields] = useState<Record<number, boolean>>({});
  const [allFields, setAllFields] = useState<Field[]>([]);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [fieldLabel, setFieldLabel] = useState('');
  const [originalFieldLabel, setOriginalFieldLabel] = useState('');

  useEffect(() => {
    loadFields();
    loadVisibleFields();
  }, []);

  const loadFields = async () => {
    try {
      const fields = await getAllFields();
      setAllFields(fields);
    } catch (error) {
      console.error('Error loading fields:', error);
      setAllFields(defaultFields);
    }
  };

  const loadVisibleFields = async () => {
    try {
      const saved = await AsyncStorage.getItem('visibleFields');
      if (saved) {
        setVisibleFields(JSON.parse(saved));
      } else {
        // Default: all fields visible
        const fields = await getAllFields();
        const defaultVisible = fields.reduce((acc, field) => {
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

  const handleAddField = async () => {
    try {
      // Generate a unique key from the label
      const key = fieldLabel
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/\s+/g, '')
        .substring(0, 20);

      const newField = await addCustomField({
        key,
        label: fieldLabel.trim(),
        placeholder: '',
        hasSpecialText: false,
      });

      // Reload fields and update visibility
      await loadFields();
      const newVisibleFields = {
        ...visibleFields,
        [newField.id]: true, // Make new field visible by default
      };
      setVisibleFields(newVisibleFields);
      await AsyncStorage.setItem('visibleFields', JSON.stringify(newVisibleFields));

      // Reset form and close modal
      resetFieldForm();
      Alert.alert('Success', 'Custom field added successfully!');
    } catch (error) {
      console.error('Error adding field:', error);
      Alert.alert('Error', 'Failed to add custom field');
    }
  };

  const handleEditField = (field: Field) => {
    setEditingField(field);
    setFieldLabel(field.label);
    setOriginalFieldLabel(field.label);
    setModalMode('edit');
    setShowFieldModal(true);
  };

  const handleSaveFieldEdit = async () => {
    if (!editingField) return;

    try {
      if (editingField.id <= 10) {
        // Editing a default field - only save the label
        await editFieldLabel(editingField.id, fieldLabel.trim());
      } else {
        // Editing a custom field - save all properties
        await editCustomField(editingField.id, {
          label: fieldLabel.trim(),
          placeholder: '',
          hasSpecialText: editingField.hasSpecialText, // Keep existing value
        });
      }

      // Reload fields
      await loadFields();

      // Reset form and close modal
      resetFieldForm();
    } catch (error) {
      console.error('Error updating field:', error);
      Alert.alert('Error', 'Failed to update field');
    }
  };

  const resetFieldForm = () => {
    setFieldLabel('');
    setOriginalFieldLabel('');
    setEditingField(null);
    setShowFieldModal(false);
  };

  const openAddFieldModal = () => {
    setModalMode('add');
    setShowFieldModal(true);
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
 
          {/* Default Fields */}
          <ThemedText style={styles.subsectionTitle}>Default Fields</ThemedText>
          {allFields.filter(field => field.id <= 10).map((field) => (
            <View key={field.id} style={styles.fieldContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => toggleField(field.id)}
              >
                <View style={[
                  styles.checkbox,
                  visibleFields[field.id] && styles.checkboxChecked,
                  { borderColor: Colors[colorScheme ?? 'light'].text }
                ]}>
                  {visibleFields[field.id] && (
                    <ThemedText style={styles.checkmark}>✓</ThemedText>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.fieldTextContainer,
                  { backgroundColor: Colors[colorScheme ?? 'light'].background }
                ]}
                onPress={() => handleEditField(field)}
              >
                <ThemedText style={styles.fieldLabel}>{field.label}</ThemedText>
              </TouchableOpacity>
            </View>
          ))}

          {/* Custom Fields */}
          {allFields.filter(field => field.id > 10).length > 0 && (
            <>
              <ThemedText style={styles.subsectionTitle}>Custom Fields</ThemedText>
              {allFields.filter(field => field.id > 10).map((field) => (
                <View key={field.id} style={styles.fieldContainer}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => toggleField(field.id)}
                  >
                    <View style={[
                      styles.checkbox,
                      visibleFields[field.id] && styles.checkboxChecked,
                      { borderColor: Colors[colorScheme ?? 'light'].text }
                    ]}>
                      {visibleFields[field.id] && (
                        <ThemedText style={styles.checkmark}>✓</ThemedText>
                      )}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.fieldTextContainer,
                      { backgroundColor: Colors[colorScheme ?? 'light'].background }
                    ]}
                    onPress={() => handleEditField(field)}
                  >
                    <ThemedText style={styles.fieldLabel}>{field.label}</ThemedText>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          {/* Add Field Button */}
          <TouchableOpacity 
            style={[
              styles.addFieldButton,
              { backgroundColor: '#0056CC' }
            ]}
            onPress={openAddFieldModal}
          >
            <View style={styles.addIconContainer}>
              <View style={styles.addIcon}>
                <View style={[styles.addIconLine, { width: '100%', height: 2, top: '50%', transform: [{ translateY: -1 }] }]} />
                <View style={[styles.addIconLine, { width: 2, height: '100%', left: '50%', transform: [{ translateX: -1 }] }]} />
              </View>
            </View>
            <ThemedText style={styles.addFieldButtonText}>Add</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Reusable Field Modal */}
      <Modal
        visible={showFieldModal}
        animationType="slide"
        transparent={true}
        onRequestClose={resetFieldForm}
      >
        <View style={[
          styles.modalOverlay,
          { justifyContent: 'flex-start', paddingTop: 220 }
        ]}>
          <View style={[
            styles.modalContainer,
            { backgroundColor: Colors[colorScheme ?? 'light'].background }
          ]}>
            <View style={[
              styles.modalHeader,
              { borderBottomColor: Colors[colorScheme ?? 'light'].tabIconDefault }
            ]}>
              <ThemedText style={styles.modalTitle}>
                {modalMode === 'add' ? 'Add field' : 'Edit field'}
              </ThemedText>
              <TouchableOpacity
                onPress={resetFieldForm}
                style={styles.modalCloseButton}
              >
                <ThemedText style={[
                  styles.modalCloseButtonText,
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}>✕</ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <ThemedText style={styles.inputLabel}>Field Label:</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].tabIconDefault,
                    backgroundColor: Colors[colorScheme ?? 'light'].background
                  }
                ]}
                value={fieldLabel}
                onChangeText={setFieldLabel}
                placeholder="Enter field label"
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[
                    styles.cancelButton,
                    { 
                      borderColor: Colors[colorScheme ?? 'light'].tabIconDefault,
                      backgroundColor: Colors[colorScheme ?? 'light'].background
                    }
                  ]}
                  onPress={resetFieldForm}
                >
                  <ThemedText style={[
                    styles.cancelButtonText,
                    { color: Colors[colorScheme ?? 'light'].text }
                  ]}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.addButton,
                    { backgroundColor: '#0056CC' },
                    ((modalMode === 'edit' && fieldLabel.trim() === originalFieldLabel) || 
                     (modalMode === 'add' && !fieldLabel.trim())) && styles.disabledButton
                  ]}
                  onPress={modalMode === 'add' ? handleAddField : handleSaveFieldEdit}
                  disabled={(modalMode === 'edit' && fieldLabel.trim() === originalFieldLabel) || 
                           (modalMode === 'add' && !fieldLabel.trim())}
                >
                  <ThemedText style={[
                    styles.addButtonText,
                    ((modalMode === 'edit' && fieldLabel.trim() === originalFieldLabel) || 
                     (modalMode === 'add' && !fieldLabel.trim())) && { opacity: 0.7 }
                  ]}>
                    {modalMode === 'add' ? 'Add Field' : 'Save Changes'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    opacity: 0.8,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    padding: 8,
  },
  fieldTextContainer: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
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
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  resetButton: {
    padding: 8,
  },
  resetButtonText: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  addFieldButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addFieldButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
  },
  addButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  addIconContainer: {
    width: 20,
    height: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  addIconLine: {
    position: 'absolute',
    backgroundColor: 'white',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 20,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#0077FF',
  },
});