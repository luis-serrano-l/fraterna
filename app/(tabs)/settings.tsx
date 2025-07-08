import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { addCustomField, defaultFields, editFieldLabel, Field, getAllFields, removeCustomField, resetFieldLabel } from '@/constants/Fields';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/hooks/useTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

export default function SettingsScreen() {
  const [allFields, setAllFields] = useState<Field[]>([]);
  const [visibleFields, setVisibleFields] = useState<Record<number, boolean>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [fieldLabel, setFieldLabel] = useState('');
  const [originalFieldLabel, setOriginalFieldLabel] = useState('');
  const theme = useTheme();

  useEffect(() => {
    loadFields();
    loadVisibleFields();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadFields();
      loadVisibleFields();
    }, [])
  );

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

  const handleDragEnd = async ({ data }: { data: Field[] }) => {
    setAllFields(data);
    // Save the new order to AsyncStorage
    try {
      await AsyncStorage.setItem('fieldOrder', JSON.stringify(data.map(field => field.id)));
    } catch (error) {
      console.error('Error saving field order:', error);
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
        placeholder: ''
      });

      // Update field order to include the new field at the end
      try {
        const currentOrderJson = await AsyncStorage.getItem('fieldOrder');
        let currentOrder: number[] = currentOrderJson ? JSON.parse(currentOrderJson) : [];
        
        // If no current order exists, create one with all default fields first
        if (currentOrder.length === 0) {
          currentOrder = defaultFields.map(field => field.id);
        }
        
        // Add the new field to the end of the order
        currentOrder.push(newField.id);
        await AsyncStorage.setItem('fieldOrder', JSON.stringify(currentOrder));
      } catch (error) {
        console.error('Error updating field order:', error);
      }

      // Load fields with the updated order and update visibility
      await loadFields();
      const newVisibleFields = {
        ...visibleFields,
        [newField.id]: true, // Make new field visible by default
      };
      setVisibleFields(newVisibleFields);
      await AsyncStorage.setItem('visibleFields', JSON.stringify(newVisibleFields));

      // Reset form and close modal
      resetFieldForm();
    } catch (error) {
      console.error('Error adding field:', error);
      Alert.alert('Error', 'Failed to add custom field');
    }
  };

  const handleDeleteField = async (field: Field, onCancel?: () => void) => {
    Alert.alert(
      'Remove Field',
      `Are you sure you want to remove "${field.label}"? This action cannot be undone.`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => {
            // Reset animation state when user cancels
            if (onCancel) {
              onCancel();
            }
          }
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              if (field.id > 10) {
                // Remove custom field using the proper function
                await removeCustomField(field.id);
              } else {
                // Reset default field label to original
                await resetFieldLabel(field.id);
              }
              
              // Update field order to remove the deleted field
              try {
                const currentOrderJson = await AsyncStorage.getItem('fieldOrder');
                if (currentOrderJson) {
                  const currentOrder: number[] = JSON.parse(currentOrderJson);
                  const updatedOrder = currentOrder.filter(id => id !== field.id);
                  await AsyncStorage.setItem('fieldOrder', JSON.stringify(updatedOrder));
                }
              } catch (error) {
                console.error('Error updating field order:', error);
              }
              
              // Remove from visible fields
              const newVisibleFields = { ...visibleFields };
              delete newVisibleFields[field.id];
              setVisibleFields(newVisibleFields);
              await AsyncStorage.setItem('visibleFields', JSON.stringify(newVisibleFields));
              
              // Reload fields to ensure consistency
              await loadFields();
            } catch (error) {
              console.error('Error removing field:', error);
              Alert.alert('Error', 'Failed to remove field');
            }
          }
        }
      ]
    );
  };

  const handleEditField = (field: Field) => {
    setEditingField(field);
    setFieldLabel(field.label);
    setOriginalFieldLabel(field.label);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleSaveFieldEdit = async () => {
    if (!editingField || !fieldLabel.trim()) return;

    try {
      await editFieldLabel(editingField.id, fieldLabel.trim());
      
      // Update local state
      setAllFields(prev => prev.map(field => 
        field.id === editingField.id 
          ? { ...field, label: fieldLabel.trim() }
          : field
      ));
      
      resetFieldForm();
    } catch (error) {
      console.error('Error updating field:', error);
      Alert.alert('Error', 'Failed to update field');
    }
  };

  const handleRemoveField = async (field: Field) => {
    Alert.alert(
      'Remove Field',
      `Are you sure you want to remove "${field.label}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await handleDeleteField(field);
          }
        }
      ]
    );
  };

  const resetFieldForm = () => {
    setFieldLabel('');
    setOriginalFieldLabel('');
    setEditingField(null);
    setModalVisible(false);
  };

  const openAddFieldModal = () => {
    setModalMode('add');
    setModalVisible(true);
  };

  const renderFieldItem = ({ item, drag, isActive }: RenderItemParams<Field>) => {
    const translateX = useSharedValue(0);
    const deleteOpacity = useSharedValue(0);

    const resetAnimation = () => {
      translateX.value = withSpring(0);
      deleteOpacity.value = withSpring(0);
    };

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, context: any) => {
        context.startX = translateX.value;
        context.startY = 0;
      },
      onActive: (event, context: any) => {
        // Only handle horizontal gestures, ignore vertical scrolling
        if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
          const newTranslateX = context.startX + event.translationX;
          translateX.value = Math.min(0, Math.max(-80, newTranslateX));
          
          // Show delete button when swiped left
          if (translateX.value < -40) {
            deleteOpacity.value = withSpring(1);
          } else {
            deleteOpacity.value = withSpring(0);
          }
        }
      },
      onEnd: (event) => {
        // Only trigger delete for horizontal swipes
        if (Math.abs(event.translationX) > Math.abs(event.translationY) && event.translationX < -60) {
          // Trigger delete if swiped far enough horizontally
          runOnJS(handleDeleteField)(item, resetAnimation);
        } else {
          // Snap back if not swiped far enough or if it was a vertical gesture
          translateX.value = withSpring(0);
          deleteOpacity.value = withSpring(0);
        }
      },
    });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translateX.value }],
      };
    });

    const deleteButtonStyle = useAnimatedStyle(() => {
      return {
        opacity: deleteOpacity.value,
      };
    });

    return (
      <View style={styles.fieldItemContainer}>
        {/* Delete Button Background */}
        <Animated.View style={[
          styles.deleteBackground,
          deleteButtonStyle,
          { backgroundColor: '#FF3B30' }
        ]}>
          <IconSymbol
            name="trash.fill"
            size={24}
            color="white"
          />
        </Animated.View>

        {/* Main Field Content */}
        <PanGestureHandler 
          onGestureEvent={gestureHandler}
          activeOffsetX={[-10, 10]} // Only activate for horizontal gestures
          failOffsetY={[-10, 10]}   // Fail if vertical gesture exceeds threshold
        >
          <Animated.View style={[
            styles.fieldContainer,
            isActive && styles.fieldContainerActive,
            animatedStyle
          ]}>
            {/* Drag Handle */}
            <TouchableOpacity
              style={styles.dragHandle}
              onPressIn={drag}
            >
              <View style={styles.dragHandleIcon}>
                <View style={[styles.dragLine, { backgroundColor: theme.colors.text }]} />
                <View style={[styles.dragLine, { backgroundColor: theme.colors.text }]} />
                <View style={[styles.dragLine, { backgroundColor: theme.colors.text }]} />
              </View>
            </TouchableOpacity>

            {/* Checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => toggleField(item.id)}
            >
              <View style={[
                styles.checkbox,
                visibleFields[item.id] && styles.checkboxChecked,
                { borderColor: theme.colors.text }
              ]}>
                {visibleFields[item.id] && (
                  <ThemedText style={styles.checkmark}>✓</ThemedText>
                )}
              </View>
            </TouchableOpacity>

            {/* Field Text */}
            <TouchableOpacity 
              style={[
                styles.fieldTextContainer,
                { backgroundColor: theme.colors.background }
              ]}
              onPress={() => handleEditField(item)}
            >
              <ThemedText style={styles.fieldLabel}>{item.label}</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        {/* Header-style container for description */}
        <View style={styles.header}> 
          <ThemedText style={styles.sectionDescription}>
            Hidden fields will preserve their data.
          </ThemedText>
        </View>
        {/* Section for the rest of the content */}
        <View style={styles.section}>
          {/* Draggable Fields List */}
          <DraggableFlatList
            data={allFields}
            renderItem={renderFieldItem}
            keyExtractor={(item) => item.id.toString()}
            onDragEnd={handleDragEnd}
            contentContainerStyle={styles.draggableListContent}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Floating Add Button */}
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: theme.colors.buttonPrimary }
          ]}
          onPress={openAddFieldModal}
        >
          <View style={styles.plusSign}>
            <View style={[styles.plusVertical, { backgroundColor: 'white' }]} />
            <View style={[styles.plusHorizontal, { backgroundColor: 'white' }]} />
          </View>
        </TouchableOpacity>

        {/* Reusable Field Modal */}
        <Modal
          visible={modalVisible}
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
              { backgroundColor: theme.colors.background }
            ]}>
              <View style={[
                styles.modalHeader,
                { borderBottomColor: theme.colors.tabIconDefault }
              ]}>
                <ThemedText style={styles.modalTitle}>
                  {modalMode === 'add' ? 'Add Custom Field' : 'Edit Field'}
                </ThemedText>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={resetFieldForm}
                >
                  <ThemedText style={[
                    styles.modalCloseButtonText,
                    { color: theme.colors.text }
                  ]}>✕</ThemedText>
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalContent}>
                <ThemedText style={styles.inputLabel}>Field Label:</ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    { 
                      color: theme.colors.text,
                      borderColor: theme.colors.tabIconDefault,
                      backgroundColor: theme.colors.background
                    }
                  ]}
                  value={fieldLabel}
                  onChangeText={setFieldLabel}
                  placeholder="Enter field label"
                  placeholderTextColor={theme.colors.tabIconDefault}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[
                      styles.cancelButton,
                      { 
                        borderColor: theme.colors.tabIconDefault,
                        backgroundColor: theme.colors.background
                      }
                    ]}
                    onPress={resetFieldForm}
                  >
                    <ThemedText style={[
                      styles.cancelButtonText,
                      { color: theme.colors.text }
                    ]}>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.addButton,
                      { backgroundColor: theme.colors.buttonPrimary },
                      (modalMode === 'add' && !fieldLabel.trim()) && styles.disabledButton
                    ]}
                    onPress={modalMode === 'add' ? handleAddField : handleSaveFieldEdit}
                    disabled={modalMode === 'add' && !fieldLabel.trim()}
                  >
                    <ThemedText style={[
                      styles.addButtonText,
                      { color: theme.colors.buttonText },
                      (modalMode === 'add' && !fieldLabel.trim()) && { opacity: 0.7 }
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  section: {
    flex: 1,
    padding: 16,
  },
  sectionDescription: {
    ...Typography.body,
    opacity: 0.7,
    // marginBottom: 16, // Remove this line to match History
  },
  header: {
    padding: 20,
    paddingBottom: 6,
  },
  draggableListContent: {
    paddingBottom: 100, // Space for floating button
  },
  fieldItemContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  fieldContainerActive: {
    opacity: 0.8,
    transform: [{ scale: 1.02 }],
  },
  dragHandle: {
    padding: 8,
    marginRight: 8,
  },
  dragHandleIcon: {
    width: 16,
    height: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dragLine: {
    width: 12,
    height: 1.5,
    borderRadius: 0.75,
  },
  checkboxContainer: {
    marginRight: 12,
    padding: 8,
  },
  fieldTextContainer: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    position: 'relative',
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
    ...Typography.small,
    textAlign: 'center',
  },
  fieldLabel: {
    ...Typography.label,
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  editButtonText: {
    ...Typography.header,
    color: '#007AFF',
  },
  resetButton: {
    padding: 8,
  },
  resetButtonText: {
    ...Typography.header,
    color: '#007AFF',
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
    ...Typography.button,
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
    ...Typography.modalTitle,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseButtonText: {
    ...Typography.header,
  },
  modalContent: {
    padding: 16,
  },
  inputLabel: {
    ...Typography.label,
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    ...Typography.input,
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
    ...Typography.button,
  },
  addButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    ...Typography.button,
    color: 'white',
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
  disabledButton: {
    backgroundColor: '#2D6ECF', // lighter blue for disabled state
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  plusSign: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  plusVertical: {
    position: 'absolute',
    width: 2,
    height: '100%',
    left: '50%',
    transform: [{ translateX: -1 }],
  },
  plusHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 2,
    top: '50%',
    transform: [{ translateY: -1 }],
  },
});