import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { defaultFields, Field, getAllFields, personalQuestions } from '@/constants/Fields';
import { Typography } from '@/constants/Typography';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

// Dynamic Message type based on field configuration
type Message = {
  id: string;
  date: Date;
  timestamp: Date;
} & {
  [K in typeof defaultFields[number]['key']]: string;
};

// Dynamic edit state type
type EditState = {
  [K in typeof defaultFields[number]['key']]: string;
};

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editDate, setEditDate] = useState(new Date());
  const [editState, setEditState] = useState<EditState>(() => {
    // Initialize edit state with empty strings for all fields
    const initialState = {} as EditState;
    defaultFields.forEach(field => {
      initialState[field.key] = '';
    });
    return initialState;
  });
  const [visibleFields, setVisibleFields] = useState<Record<number, boolean>>({});
  const [allFields, setAllFields] = useState<Field[]>([]);
  const colorScheme = useColorScheme();
  const planInputRef = useRef<TextInput>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Load all fields (default + custom)
  useEffect(() => {
    loadAllFields();
  }, []);

  const loadAllFields = async () => {
    try {
      const fields = await getAllFields();
      setAllFields(fields);

      // Update edit state to include all fields
      const newEditState = {} as EditState;
      fields.forEach(field => {
        newEditState[field.key] = editState[field.key] || '';
      });
      setEditState(newEditState);
    } catch (error) {
      console.error('Error loading fields:', error);
      setAllFields(defaultFields);
    }
  };

  const handleNewNote = () => {
    const newDate = new Date();
    const newMessage = {
      id: Date.now().toString(),
      date: newDate,
      timestamp: newDate,
    } as Message;
    
    // Initialize all fields with empty strings
    allFields.forEach(field => {
      newMessage[field.key] = '';
    });
    
    setEditingMessage(newMessage);
    setEditDate(newDate);
    
    // Reset edit state
    const resetState = {} as EditState;
    allFields.forEach(field => {
      resetState[field.key] = '';
    });
    setEditState(resetState);
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setEditDate(message.date);
    
    // Set edit state from message
    const newEditState = {} as EditState;
    allFields.forEach(field => {
      newEditState[field.key] = message[field.key] || '';
    });
    setEditState(newEditState);
  };

  const handleSaveEdit = () => {
    if (editingMessage) {
      const updatedMessage = {
        ...editingMessage,
        date: editDate,
        timestamp: new Date(),
      } as Message;
      
      // Update all fields from edit state
      allFields.forEach(field => {
        updatedMessage[field.key] = editState[field.key].trim();
      });
      
      if (messages.some(msg => msg.id === editingMessage.id)) {
        // Update existing note
        setMessages(messages.map(msg => 
          msg.id === editingMessage.id ? updatedMessage : msg
        ));
      } else {
        // Add new note
        setMessages([...messages, updatedMessage]);
      }
      setEditingMessage(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setEditDate(selectedDate);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setMessages(messages.filter(msg => msg.id !== id))
        }
      ]
    );
  };

  const handleInfoPress = (fieldId: number) => {
    const questionText = personalQuestions[fieldId];
    if (questionText) {
      const field = defaultFields.find(f => f.id === fieldId);
      const title = field ? field.label.replace(':', '') : 'Field Information';
      Alert.alert(
        title,
        questionText,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    }
  };

  const updateEditField = (fieldKey: string, value: string) => {
    setEditState(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  useFocusEffect(
    React.useCallback(() => {
      loadAllFields();
      loadVisibleFields();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => {
        planInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }, [])
  );

  const loadVisibleFields = async () => {
    try {
      const saved = await AsyncStorage.getItem('visibleFields');
      if (saved) {
        setVisibleFields(JSON.parse(saved));
      } else {
        // Default: all fields visible
        const defaultVisible = allFields.reduce((acc, field) => {
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

  const getPreviousPuntoLucha = () => {
    if (!editingMessage) return null;
    // Sort messages by date ascending
    const sorted = [...messages].sort((a, b) => a.date.getTime() - b.date.getTime());
    // Find the index of the current editing message (by id)
    const idx = sorted.findIndex(msg => msg.id === editingMessage.id);
    // If creating a new note (not found), use the last note as previous
    if (idx === -1) {
      return sorted.length > 0 ? sorted[sorted.length - 1].puntoLucha : null;
    }
    // Otherwise, use the previous note if it exists
    if (idx > 0) {
      return sorted[idx - 1].puntoLucha;
    }
    return null;
  };

  useEffect(() => {
    const loadMessages = async () => {
      const saved = await AsyncStorage.getItem('notes');
      if (saved) {
        const parsed = JSON.parse(saved).map((msg: any) => ({
          ...msg,
          date: msg.date ? new Date(msg.date) : new Date(),
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        }));
        setMessages(parsed);
      }
    };
    loadMessages();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('notes', JSON.stringify(messages));
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container}>
          <TouchableOpacity 
            style={[
              styles.fab,
              { backgroundColor: Colors[colorScheme ?? 'light'].tint }
            ]} 
            onPress={handleNewNote}
          >
            <View style={styles.plusSign}>
              <View style={[styles.plusVertical, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} />
              <View style={[styles.plusHorizontal, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} />
            </View>
          </TouchableOpacity>

          <TouchableWithoutFeedback onPress={() => setSelectedNoteId(null)}>
            <View style={{ flex: 1 }}>
              <FlatList
                data={[...messages].sort((a, b) => b.date.getTime() - a.date.getTime())}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.noteContainer}>
                    <Pressable
                      style={[
                        styles.noteContent,
                        {
                          backgroundColor: Colors[colorScheme ?? 'light'].containerBackgroundActive
                        },
                        selectedNoteId === item.id && {
                          ...styles.noteContentSelected,
                          borderColor: Colors[colorScheme ?? 'light'].border
                        }
                      ]}
                      onPress={() => {
                        setSelectedNoteId(null);
                        handleEdit(item);
                      }}
                      onLongPress={() => {
                        if (selectedNoteId === item.id) {
                          setSelectedNoteId(null);
                        } else {
                          setSelectedNoteId(item.id);
                        }
                      }}
                    >
                      <ThemedText style={styles.dateText}>
                        {item.date.toLocaleDateString()}
                      </ThemedText>
                      {allFields.map((field) => {
                        const value = item[field.key as keyof Message];
                        // Only show if field has content AND is marked as visible
                        if (typeof value === 'string' && value.trim() && visibleFields[field.id] === true) {
                          return (
                            <React.Fragment key={field.key}>
                              <View style={styles.labelContainer}>
                                <TouchableOpacity 
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    handleInfoPress(field.id);
                                  }}
                                >
                                  <ThemedText style={styles.label}>{field.label}</ThemedText>
                                </TouchableOpacity>
                              </View>
                              <ThemedText style={styles.messageText}>{value}</ThemedText>
                            </React.Fragment>
                          );
                        }
                        return null;
                      })}
                      {selectedNoteId === item.id && (
                        <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={() => handleDelete(item.id)}
                        >
                          <IconSymbol
                            name="trash.fill"
                            size={20}
                            color={Colors[colorScheme ?? 'light'].text}
                          />
                        </TouchableOpacity>
                      )}
                    </Pressable>
                  </View>
                )}
                ItemSeparatorComponent={() => (
                  <View style={[
                    styles.separator,
                    { backgroundColor: Colors[colorScheme ?? 'light'].separatorSubtle }
                  ]} />
                )}
                style={styles.messageList}
              />
            </View>
          </TouchableWithoutFeedback>

          <Modal
            animationType="slide"
            transparent={true}
            visible={editingMessage !== null}
            onRequestClose={handleCancelEdit}
          >
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <ThemedView style={styles.modalContent}>
                {getPreviousPuntoLucha() && (
                  <ThemedText style={[
                    styles.previousPuntoLuchaText,
                    { color: Colors[colorScheme ?? 'light'].text }
                  ]}>
                    Anterior punto de lucha: {getPreviousPuntoLucha()}
                  </ThemedText>
                )}
                <View style={styles.modalHeader}>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={handleCancelEdit}
                  >
                    <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.saveButton, styles.headerSaveButton]} 
                    onPress={handleSaveEdit}
                  >
                    <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  style={styles.formScrollView}
                  contentContainerStyle={styles.formScrollViewContent}
                  keyboardShouldPersistTaps="handled"
                >
                  <DateTimePicker
                    value={editDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    style={styles.datePicker}
                  />

                  {allFields.map((field) => {
                    // Only show if field is marked as visible
                    if (visibleFields[field.id] !== true) return null;
                    
                    // Find the lowest visible field ID for auto-focus
                    const lowestVisibleId = Math.min(...allFields
                      .filter(f => visibleFields[f.id] === true)
                      .map(f => f.id)
                    );
                    
                    return (
                      <React.Fragment key={field.key}>
                        <View style={styles.labelContainer}>
                          <TouchableOpacity 
                            onPress={(e) => {
                              e.stopPropagation();
                              handleInfoPress(field.id);
                            }}
                          >
                            <ThemedText style={styles.modalLabel}>{field.label}</ThemedText>
                          </TouchableOpacity>
                        </View>
                        <TextInput
                          ref={field.id === lowestVisibleId ? planInputRef : undefined}
                          style={[
                            styles.editInput,
                            { 
                              color: Colors[colorScheme ?? 'light'].text,
                              borderColor: Colors[colorScheme ?? 'light'].border
                            }
                          ]}
                          value={editState[field.key]}
                          onChangeText={(text) => updateEditField(field.key, text)}
                          multiline={true}
                          autoFocus={field.id === lowestVisibleId}
                          placeholder={field.placeholder}
                          placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                        />
                      </React.Fragment>
                    );
                  })}
                </ScrollView>
              </ThemedView>
            </KeyboardAvoidingView>
          </Modal>
        </ThemedView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  messageList: {
    flex: 1,
    padding: 16,
  },
  noteContainer: {
    marginBottom: 16,
  },
  noteContent: {
    padding: 12,
    borderRadius: 12,
    position: 'relative',
  },
  noteContentSelected: {
    borderWidth: 1,
  },
  dateText: {
    ...Typography.caption,
    opacity: 0.8,
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  label: {
    ...Typography.label,
    marginRight: 8,
  },
  modalLabel: {
    ...Typography.label,
    marginRight: 8,
    color: '#007AFF',
    opacity: 0.9,
  },
  messageText: {
    ...Typography.body,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    ...Typography.header,
  },
  headerSaveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  saveButton: {
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    ...Typography.button,
    color: 'white',
  },
  editInput: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    ...Typography.input,
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
  separator: {
    height: 1,
    marginVertical: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 10,
    padding: 8,
  },
  formScrollView: {
    flex: 1,
  },
  formScrollViewContent: {
    paddingBottom: 20,
  },
  previousPuntoLuchaText: {
    ...Typography.body,
    marginBottom: 12,
    fontStyle: 'italic',
    paddingTop: 18,
    fontWeight: 'bold',
  },
  datePicker: {
    marginBottom: 16,
  },
}); 