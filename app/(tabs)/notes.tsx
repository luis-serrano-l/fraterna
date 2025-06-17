import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Alert, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

type Message = {
  id: string;
  date: Date;
  plan: string;
  apostolado: string;
  timestamp: Date;
};

export default function NotesScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editDate, setEditDate] = useState(new Date());
  const [editPlan, setEditPlan] = useState('');
  const [editApostolado, setEditApostolado] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const colorScheme = useColorScheme();
  const planInputRef = useRef<TextInput>(null);

  const handleNewNote = () => {
    const newDate = new Date();
    setEditingMessage({
      id: Date.now().toString(),
      date: newDate,
      plan: '',
      apostolado: '',
      timestamp: newDate,
    });
    setEditDate(newDate);
    setEditPlan('');
    setEditApostolado('');
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setEditDate(message.date);
    setEditPlan(message.plan);
    setEditApostolado(message.apostolado);
  };

  const handleSaveEdit = () => {
    if (editingMessage) {
      if (messages.some(msg => msg.id === editingMessage.id)) {
        // Update existing note
        setMessages(messages.map(msg => 
          msg.id === editingMessage.id 
            ? { 
                ...msg, 
                date: editDate,
                plan: editPlan.trim(),
                apostolado: editApostolado.trim(),
                timestamp: new Date() 
              }
            : msg
        ));
      } else {
        // Add new note
        setMessages([...messages, {
          id: editingMessage.id,
          date: editDate,
          plan: editPlan.trim(),
          apostolado: editApostolado.trim(),
          timestamp: editingMessage.timestamp,
        }]);
      }
      setEditingMessage(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
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

  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => {
        planInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }, [])
  );

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

          <FlatList
            data={[...messages].sort((a, b) => b.date.getTime() - a.date.getTime())}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.noteContainer}>
                <Pressable 
                  style={styles.noteContent}
                  onPress={() => handleEdit(item)}
                >
                  <ThemedText style={styles.dateText}>
                    {item.date.toLocaleDateString()}
                  </ThemedText>
                  {item.plan.trim() && (
                    <>
                      <ThemedText style={styles.label}>Plan:</ThemedText>
                      <ThemedText style={styles.messageText}>{item.plan}</ThemedText>
                    </>
                  )}
                  {item.apostolado.trim() && (
                    <>
                      <ThemedText style={styles.label}>Apostolado:</ThemedText>
                      <ThemedText style={styles.messageText}>{item.apostolado}</ThemedText>
                    </>
                  )}
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
                </Pressable>
              </View>
            )}
            ItemSeparatorComponent={() => (
              <View style={[
                styles.separator,
                { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault }
              ]} />
            )}
            style={styles.messageList}
          />

          <Modal
            animationType="slide"
            transparent={true}
            visible={editingMessage !== null}
            onRequestClose={handleCancelEdit}
          >
            <ThemedView style={styles.modalContent}>
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

              <DateTimePicker
                value={editDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                style={styles.datePicker}
              />

              <ThemedText style={styles.label}>Plan:</ThemedText>
              <TextInput
                ref={planInputRef}
                style={[
                  styles.editInput,
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}
                value={editPlan}
                onChangeText={setEditPlan}
                multiline={true}
                autoFocus={true}
                placeholder="Enter your plan..."
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
              />

              <ThemedText style={styles.label}>Apostolado:</ThemedText>
              <TextInput
                style={[
                  styles.editInput,
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}
                value={editApostolado}
                onChangeText={setEditApostolado}
                multiline={true}
                placeholder="San Pablo a tope..."
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
              />
            </ThemedView>
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
    top: 80,
    width: 50,
    height: 50,
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    position: 'relative',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
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
    color: 'white',
  },
  datePicker: {
    marginBottom: 16,
  },
  editInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  plusSign: {
    width: 24,
    height: 24,
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
    bottom: 8,
    right: 8,
    padding: 8,
  },
}); 