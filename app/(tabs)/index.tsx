import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { defaultFields, Field, getAllFields, personalQuestions } from '@/constants/Fields';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/hooks/useTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const theme = useTheme();
  const planInputRef = useRef<TextInput>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Create dynamic styles based on theme
  const dynamicStyles = useMemo(() => ({
    fab: {
      backgroundColor: theme.colors.tint,
      ...theme.shadows.md,
    },
    noteContent: {
      backgroundColor: theme.colors.containerBackgroundActive,
    },
    noteContentSelected: {
      borderColor: theme.colors.border,
    },
    separator: {
      backgroundColor: theme.colors.separatorSubtle,
    },
    saveButton: {
      backgroundColor: theme.colors.buttonPrimary,
    },
    plusVertical: {
      backgroundColor: theme.colors.background,
    },
    plusHorizontal: {
      backgroundColor: theme.colors.background,
    },
  }), [theme]);

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
          style: "cancel",
          onPress: () => setSelectedNoteId(null)
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setMessages(messages.filter(msg => msg.id !== id));
            setSelectedNoteId(null);
          }
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
            style={[styles.fab, dynamicStyles.fab]} 
            onPress={handleNewNote}
          >
            <View style={styles.plusSign}>
              <View style={[styles.plusVertical, dynamicStyles.plusVertical]} />
              <View style={[styles.plusHorizontal, dynamicStyles.plusHorizontal]} />
            </View>
          </TouchableOpacity>

          <TouchableWithoutFeedback onPress={() => setSelectedNoteId(null)}>
            <View style={styles.listContainer}>
              <FlatList
                data={[...messages].sort((a, b) => b.date.getTime() - a.date.getTime())}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.noteContainer}>
                    <Pressable
                      style={[
                        styles.noteContent,
                        dynamicStyles.noteContent,
                        selectedNoteId === item.id && {
                          ...styles.noteContentSelected,
                          ...dynamicStyles.noteContentSelected,
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
                      <ThemedText style={[styles.dateText, theme.typography.caption]}>
                        {item.date.toLocaleDateString()}
                      </ThemedText>
                      {allFields
                        .map(field => {
                          const value = item[field.key as keyof Message];
                          const hasContent = typeof value === 'string' && value.trim() && visibleFields[field.id] === true;
                          return { field, value, hasContent };
                        })
                        .filter(item => item.hasContent)
                        .map(({ field, value }) => (
                          <React.Fragment key={field.key}>
                            <View style={styles.labelContainer}>
                              <TouchableOpacity 
                                onPress={(e) => {
                                  e.stopPropagation();
                                  handleInfoPress(field.id);
                                }}
                              >
                                <ThemedText style={Typography.label}>{field.label}</ThemedText>
                              </TouchableOpacity>
                            </View>
                            <ThemedText style={[styles.messageText, theme.typography.body]}>{value}</ThemedText>
                          </React.Fragment>
                        ))}
                      {selectedNoteId === item.id && (
                        <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={() => handleDelete(item.id)}
                        >
                          <IconSymbol
                            name="trash.fill"
                            size={20}
                            color={theme.colors.text}
                          />
                        </TouchableOpacity>
                      )}
                    </Pressable>
                  </View>
                )}
                ItemSeparatorComponent={() => (
                  <View style={[styles.separator, dynamicStyles.separator]} />
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
              style={styles.modalContainer}
            >
              <ThemedView style={styles.modalContent}>
                {getPreviousPuntoLucha() && (
                  <ThemedText style={[styles.previousPuntoLuchaText, theme.typography.body]}>
                    Anterior punto de lucha: {getPreviousPuntoLucha()}
                  </ThemedText>
                )}
                <View style={styles.modalHeader}>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={handleCancelEdit}
                  >
                    <ThemedText style={[styles.closeButtonText, theme.typography.header]}>✕</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.saveButton, dynamicStyles.saveButton]} 
                    onPress={handleSaveEdit}
                  >
                    <ThemedText style={[styles.saveButtonText, theme.typography.button]}>Save</ThemedText>
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
                            <ThemedText style={Typography.label}>{field.label}</ThemedText>
                          </TouchableOpacity>
                        </View>
                        <TextInput
                          ref={field.id === lowestVisibleId ? planInputRef : undefined}
                          style={[
                            styles.editInput,
                            theme.typography.input,
                            { borderColor: theme.colors.border }
                          ]}
                          value={editState[field.key]}
                          onChangeText={(text) => updateEditField(field.key, text)}
                          multiline={true}
                          autoFocus={field.id === lowestVisibleId}
                          placeholder={field.placeholder}
                          placeholderTextColor={theme.colors.tabIconDefault}
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
    zIndex: 1,
  },
  listContainer: {
    flex: 1,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noteContentSelected: {
    borderWidth: 1,
  },
  dateText: {
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
    marginRight: 8,
  },
  modalLabel: {
    marginRight: 8,
    opacity: 0.9,
  },
  messageText: {
    // Typography handled by theme
  },
  modalContainer: {
    flex: 1,
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
    // Typography handled by theme
  },
  saveButton: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  saveButtonText: {
    // Typography handled by theme
  },
  editInput: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
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
    marginBottom: 12,
    fontStyle: 'italic',
    paddingTop: 18,
    fontWeight: 'bold',
  },
  datePicker: {
    marginBottom: 16,
  },
}); 