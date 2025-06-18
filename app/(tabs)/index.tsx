import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

type Message = {
  id: string;
  date: Date;
  planVida: string;
  mortificacion: string;
  presenciaDios: string;
  fePurezaVocacion: string;
  trabajoEstudio: string;
  fraternidad: string;
  familia: string;
  pobrezaGenerosidad: string;
  preocupaciones: string;
  puntoLucha: string;
  timestamp: Date;
};

const descriptions = {
  planVida: "Plan de vida y trato con el Señor",
  mortificacion: "Mortificación y espíritu de sacrificio",
  presenciaDios: "Presencia de Dios y aprovechamiento del tiempo",
  fePurezaVocacion: "Fe, pureza y vocación",
  trabajoEstudio: "Trabajo y estudio",
  fraternidad: "Fraternidad, amigos y apostolado",
  familia: "Familia",
  pobrezaGenerosidad: "Pobreza y generosidad",
  preocupaciones: "Preocupaciones, tristezas, alegrías y preguntas",
  puntoLucha: "Punto de lucha",
};

const mortificacionText = `1. ¿En qué medida mi alma se deja llevar por la tendencia natural a rechazar lo que supone contrariedad, cediendo al ambiente hedonista que nos rodea?
Conviene examinar con sinceridad si en el cumplimiento de los deberes ingratos, en la puntualidad, en el orden, o en el vencimiento de la pereza que busca mil excusas, se manifiesta verdadero señorío sobrenatural sobre las cosas creadas, o si, por el contrario, el alma queda prisionera del desorden.

2. ¿Está arraigada en mi alma la costumbre estable del espíritu de mortificación, o se trata más bien de actos esporádicos sin continuidad?
Es preciso considerar si se ha formado ese hábito de la negación a uno mismo que ha de estar presente desde los comienzos hasta el final, manifestándose en toda la vida, aunque se actualice en momentos concretos, especialmente en las relaciones con quienes están más cerca.

3. ¿Acepto las mortificaciones pasivas con verdadero espíritu sobrenatural, o me dejo vencer por las quejas y la falta de paz interior?
Importa mucho examinar la actitud ante la enfermedad y el dolor, los imprevistos que aparecen en el trabajo, en la vida familiar, en los proyectos que teníamos para ese día, preguntándose si se reciben como ocasión de unirse a Cristo en la Cruz.

4. ¿Llevo a cabo con esmero la mortificación interior, apartando pensamientos y recuerdos inútiles que impiden el hábito de la presencia de Dios?
Es necesario considerar si el alma se refugia en esa interioridad irreal y fantástica donde la vanidad sale siempre triunfante, o si, por el contrario, mantiene el corazón libre de ataduras para que pueda subir hasta el Señor sin impedimentos.

5. ¿Comprendo que sin mortificación no hay progreso en la vida interior, o me dejo influir por la mentalidad que ve en la negación algo de épocas oscuras y tristes?
Conviene preguntarse si se tiene clara conciencia de que la mortificación no es simple privación, sino manifestación de amor, deseo de estar mejor dispuestos para tratar a Dios, y el puente levadizo que facilita la entrada en el castillo de la oración.`;

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editDate, setEditDate] = useState(new Date());
  const [editPuntoLucha, setEditPuntoLucha] = useState('');
  const [editPlanVida, setEditPlanVida] = useState('');
  const [editMortificacion, setEditMortificacion] = useState('');
  const [editPresenciaDios, setEditPresenciaDios] = useState('');
  const [editFePurezaVocacion, setEditFePurezaVocacion] = useState('');
  const [editTrabajoEstudio, setEditTrabajoEstudio] = useState('');
  const [editFraternidad, setEditFraternidad] = useState('');
  const [editFamilia, setEditFamilia] = useState('');
  const [editPobrezaGenerosidad, setEditPobrezaGenerosidad] = useState('');
  const [editPreocupaciones, setEditPreocupaciones] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const colorScheme = useColorScheme();
  const planInputRef = useRef<TextInput>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const handleNewNote = () => {
    const newDate = new Date();
    setEditingMessage({
      id: Date.now().toString(),
      date: newDate,
      planVida: '',
      mortificacion: '',
      presenciaDios: '',
      fePurezaVocacion: '',
      trabajoEstudio: '',
      fraternidad: '',
      familia: '',
      pobrezaGenerosidad: '',
      preocupaciones: '',
      puntoLucha: '',
      timestamp: newDate,
    });
    setEditDate(newDate);
    setEditPuntoLucha('');
    setEditPlanVida('');
    setEditMortificacion('');
    setEditPresenciaDios('');
    setEditFePurezaVocacion('');
    setEditTrabajoEstudio('');
    setEditFraternidad('');
    setEditFamilia('');
    setEditPobrezaGenerosidad('');
    setEditPreocupaciones('');
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setEditDate(message.date);
    setEditPuntoLucha(message.puntoLucha);
    setEditPlanVida(message.planVida);
    setEditMortificacion(message.mortificacion);
    setEditPresenciaDios(message.presenciaDios);
    setEditFePurezaVocacion(message.fePurezaVocacion);
    setEditTrabajoEstudio(message.trabajoEstudio);
    setEditFraternidad(message.fraternidad);
    setEditFamilia(message.familia);
    setEditPobrezaGenerosidad(message.pobrezaGenerosidad);
    setEditPreocupaciones(message.preocupaciones);
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
                planVida: editPlanVida.trim(),
                mortificacion: editMortificacion.trim(),
                presenciaDios: editPresenciaDios.trim(),
                fePurezaVocacion: editFePurezaVocacion.trim(),
                trabajoEstudio: editTrabajoEstudio.trim(),
                fraternidad: editFraternidad.trim(),
                familia: editFamilia.trim(),
                pobrezaGenerosidad: editPobrezaGenerosidad.trim(),
                preocupaciones: editPreocupaciones.trim(),
                puntoLucha: editPuntoLucha.trim(),
                timestamp: new Date() 
              }
            : msg
        ));
      } else {
        // Add new note
        setMessages([...messages, {
          id: editingMessage.id,
          date: editDate,
          planVida: editPlanVida.trim(),
          mortificacion: editMortificacion.trim(),
          presenciaDios: editPresenciaDios.trim(),
          fePurezaVocacion: editFePurezaVocacion.trim(),
          trabajoEstudio: editTrabajoEstudio.trim(),
          fraternidad: editFraternidad.trim(),
          familia: editFamilia.trim(),
          pobrezaGenerosidad: editPobrezaGenerosidad.trim(),
          preocupaciones: editPreocupaciones.trim(),
          puntoLucha: editPuntoLucha.trim(),
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

  const handleInfoPress = (key: keyof typeof descriptions) => {
    if (key === 'mortificacion') {
      Alert.alert(
        'Mortificación y espíritu de sacrificio',
        mortificacionText,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => {
        planInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }, [])
  );

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
                        selectedNoteId === item.id && styles.noteContentSelected
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
                      {item.planVida.trim() && (
                        <>
                          <View style={styles.labelContainer}>
                            <TouchableOpacity 
                              onPress={() => handleInfoPress('planVida')}
                            >
                              <ThemedText style={styles.label}>Plan de vida y trato con el Señor:</ThemedText>
                            </TouchableOpacity>
                          </View>
                          <ThemedText style={styles.messageText}>{item.planVida}</ThemedText>
                        </>
                      )}
                      {item.mortificacion.trim() && (
                        <>
                          <View style={styles.labelContainer}>
                            <TouchableOpacity 
                              onPress={() => handleInfoPress('mortificacion')}
                            >
                              <ThemedText style={styles.label}>Mortificación y espíritu de sacrificio. Carácter:</ThemedText>
                            </TouchableOpacity>
                          </View>
                          <ThemedText style={styles.messageText}>{item.mortificacion}</ThemedText>
                        </>
                      )}
                      {item.presenciaDios.trim() && (
                        <>
                          <View style={styles.labelContainer}>
                            <TouchableOpacity 
                              onPress={() => handleInfoPress('presenciaDios')}
                            >
                              <ThemedText style={styles.label}>Presencia de Dios y aprovechamiento del tiempo:</ThemedText>
                            </TouchableOpacity>
                          </View>
                          <ThemedText style={styles.messageText}>{item.presenciaDios}</ThemedText>
                        </>
                      )}
                      {item.fePurezaVocacion.trim() && (
                        <>
                          <View style={styles.labelContainer}>
                            <TouchableOpacity 
                              onPress={() => handleInfoPress('fePurezaVocacion')}
                            >
                              <ThemedText style={styles.label}>Fe / Pureza / Vocación:</ThemedText>
                            </TouchableOpacity>
                          </View>
                          <ThemedText style={styles.messageText}>{item.fePurezaVocacion}</ThemedText>
                        </>
                      )}
                      {item.trabajoEstudio.trim() && (
                        <>
                          <View style={styles.labelContainer}>
                            <TouchableOpacity 
                              onPress={() => handleInfoPress('trabajoEstudio')}
                            >
                              <ThemedText style={styles.label}>Trabajo / Estudio:</ThemedText>
                            </TouchableOpacity>
                          </View>
                          <ThemedText style={styles.messageText}>{item.trabajoEstudio}</ThemedText>
                        </>
                      )}
                      {item.fraternidad.trim() && (
                        <>
                          <View style={styles.labelContainer}>
                            <TouchableOpacity 
                              onPress={() => handleInfoPress('fraternidad')}
                            >
                              <ThemedText style={styles.label}>Fraternidad, amigos y apostolado:</ThemedText>
                            </TouchableOpacity>
                          </View>
                          <ThemedText style={styles.messageText}>{item.fraternidad}</ThemedText>
                        </>
                      )}
                      {item.familia.trim() && (
                        <>
                          <View style={styles.labelContainer}>
                            <TouchableOpacity 
                              onPress={() => handleInfoPress('familia')}
                            >
                              <ThemedText style={styles.label}>Familia:</ThemedText>
                            </TouchableOpacity>
                          </View>
                          <ThemedText style={styles.messageText}>{item.familia}</ThemedText>
                        </>
                      )}
                      {item.pobrezaGenerosidad.trim() && (
                        <>
                          <View style={styles.labelContainer}>
                            <TouchableOpacity 
                              onPress={() => handleInfoPress('pobrezaGenerosidad')}
                            >
                              <ThemedText style={styles.label}>Pobreza y generosidad:</ThemedText>
                            </TouchableOpacity>
                          </View>
                          <ThemedText style={styles.messageText}>{item.pobrezaGenerosidad}</ThemedText>
                        </>
                      )}
                      {item.preocupaciones.trim() && (
                        <>
                          <View style={styles.labelContainer}>
                            <TouchableOpacity 
                              onPress={() => handleInfoPress('preocupaciones')}
                            >
                              <ThemedText style={styles.label}>Preocupaciones, tristezas, alegrías y preguntas:</ThemedText>
                            </TouchableOpacity>
                          </View>
                          <ThemedText style={styles.messageText}>{item.preocupaciones}</ThemedText>
                        </>
                      )}
                      {item.puntoLucha.trim() && (
                        <>
                          <View style={styles.labelContainer}>
                            <TouchableOpacity 
                              onPress={() => handleInfoPress('puntoLucha')}
                            >
                              <ThemedText style={styles.label}>Punto de lucha:</ThemedText>
                            </TouchableOpacity>
                          </View>
                          <ThemedText style={styles.messageText}>{item.puntoLucha}</ThemedText>
                        </>
                      )}
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
                    { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault }
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

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('planVida')}
                    >
                      <ThemedText style={styles.label}>Plan de vida y trato con el Señor:</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    ref={planInputRef}
                    style={[
                      styles.editInput,
                      { color: Colors[colorScheme ?? 'light'].text }
                    ]}
                    value={editPlanVida}
                    onChangeText={setEditPlanVida}
                    multiline={true}
                    autoFocus={true}
                    placeholder={descriptions.planVida}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('mortificacion')}
                    >
                      <ThemedText style={styles.label}>Mortificación y espíritu de sacrificio. Carácter:</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[
                      styles.editInput,
                      { color: Colors[colorScheme ?? 'light'].text }
                    ]}
                    value={editMortificacion}
                    onChangeText={setEditMortificacion}
                    multiline={true}
                    placeholder={descriptions.mortificacion}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('presenciaDios')}
                    >
                      <ThemedText style={styles.label}>Presencia de Dios y aprovechamiento del tiempo:</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[
                      styles.editInput,
                      { color: Colors[colorScheme ?? 'light'].text }
                    ]}
                    value={editPresenciaDios}
                    onChangeText={setEditPresenciaDios}
                    multiline={true}
                    placeholder={descriptions.presenciaDios}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('fePurezaVocacion')}
                    >
                      <ThemedText style={styles.label}>Fe / Pureza / Vocación:</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[
                      styles.editInput,
                      { color: Colors[colorScheme ?? 'light'].text }
                    ]}
                    value={editFePurezaVocacion}
                    onChangeText={setEditFePurezaVocacion}
                    multiline={true}
                    placeholder={descriptions.fePurezaVocacion}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('trabajoEstudio')}
                    >
                      <ThemedText style={styles.label}>Trabajo / Estudio:</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[
                      styles.editInput,
                      { color: Colors[colorScheme ?? 'light'].text }
                    ]}
                    value={editTrabajoEstudio}
                    onChangeText={setEditTrabajoEstudio}
                    multiline={true}
                    placeholder={descriptions.trabajoEstudio}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('fraternidad')}
                    >
                      <ThemedText style={styles.label}>Fraternidad, amigos y apostolado:</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[
                      styles.editInput,
                      { color: Colors[colorScheme ?? 'light'].text }
                    ]}
                    value={editFraternidad}
                    onChangeText={setEditFraternidad}
                    multiline={true}
                    placeholder={descriptions.fraternidad}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('familia')}
                    >
                      <ThemedText style={styles.label}>Familia:</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[
                      styles.editInput,
                      { color: Colors[colorScheme ?? 'light'].text }
                    ]}
                    value={editFamilia}
                    onChangeText={setEditFamilia}
                    multiline={true}
                    placeholder={descriptions.familia}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('pobrezaGenerosidad')}
                    >
                      <ThemedText style={styles.label}>Pobreza y generosidad:</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[
                      styles.editInput,
                      { color: Colors[colorScheme ?? 'light'].text }
                    ]}
                    value={editPobrezaGenerosidad}
                    onChangeText={setEditPobrezaGenerosidad}
                    multiline={true}
                    placeholder={descriptions.pobrezaGenerosidad}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('preocupaciones')}
                    >
                      <ThemedText style={styles.label}>Preocupaciones, tristezas, alegrías y preguntas:</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[
                      styles.editInput,
                      { color: Colors[colorScheme ?? 'light'].text }
                    ]}
                    value={editPreocupaciones}
                    onChangeText={setEditPreocupaciones}
                    multiline={true}
                    placeholder={descriptions.preocupaciones}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('puntoLucha')}
                    >
                      <ThemedText style={styles.label}>Punto de lucha:</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[
                      styles.editInput,
                      { color: Colors[colorScheme ?? 'light'].text }
                    ]}
                    value={editPuntoLucha}
                    onChangeText={setEditPuntoLucha}
                    multiline={true}
                    placeholder={descriptions.puntoLucha}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />
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
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    position: 'relative',
  },
  noteContentSelected: {
    borderWidth: 1,
    borderColor: 'aqua',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
    textDecorationLine: 'underline',
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
    borderColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
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
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
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
    fontSize: 16,
    marginBottom: 12,
    fontStyle: 'italic',
    paddingTop: 18,
    fontWeight: 'bold',
  },
}); 