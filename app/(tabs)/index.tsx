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
  planVida: "Maestra de la vida espiritual y la oración, enseñó sobre las etapas del desarrollo espiritual y el mantenimiento de una relación personal con Dios.",
  mortificacion: "Doctor de la Iglesia que escribió extensamente sobre la abnegación, la purificación espiritual y la \"noche oscura del alma\".",
  presenciaDios: "Fundador del Opus Dei, enseñó sobre la santificación del trabajo ordinario y vivir en constante presencia de Dios, aprovechando cada momento para la oración y el apostolado.",
  fePurezaVocacion: "Mártir de la pureza que murió defendiendo su castidad a los 11 años, representando la fe, la pureza y la fidelidad a la propia vocación.",
  trabajoEstudio: "Patrón de estudiantes y académicos, el gran teólogo que armonizó fe y razón a través de su trabajo intelectual dedicado.",
  fraternidad: "Dedicó su vida a los jóvenes, creando un ambiente fraternal para la educación y evangelización, enfatizando la amistad en el trabajo apostólico.",
  familia: "Patrón de las familias y de la Iglesia universal, modelo del esposo y padre fiel que protegió a la Sagrada Familia.",
  pobrezaGenerosidad: "Abrazó la pobreza radical y regaló su herencia para servir a los pobres, fundando la orden franciscana basada en la pobreza evangélica.",
  preocupaciones: "Experimentó sequedad espiritual y dudas pero mantuvo la confianza en el amor de Dios, enseñando el \"caminito\" de la infancia espiritual y el abandono a la Divina Providencia.",
  puntoLucha: "Creador del examen de conciencia espiritual y fundador de los jesuitas, sistematizó la práctica del examen diario de conciencia.",
};

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
  const [activePlaceholder, setActivePlaceholder] = useState<keyof typeof descriptions | null>(null);
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
    setActivePlaceholder(activePlaceholder === key ? null : key);
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
                              disabled={editPlanVida.trim().length > 0}
                            >
                              <ThemedText style={[
                                styles.label,
                                editPlanVida.trim().length > 0 && styles.labelDisabled
                              ]}>Plan de vida y trato con el Señor:</ThemedText>
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
                              disabled={editMortificacion.trim().length > 0}
                            >
                              <ThemedText style={[
                                styles.label,
                                editMortificacion.trim().length > 0 && styles.labelDisabled
                              ]}>Mortificación y espíritu de sacrificio. Carácter:</ThemedText>
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
                              disabled={editPresenciaDios.trim().length > 0}
                            >
                              <ThemedText style={[
                                styles.label,
                                editPresenciaDios.trim().length > 0 && styles.labelDisabled
                              ]}>Presencia de Dios y aprovechamiento del tiempo:</ThemedText>
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
                              disabled={editFePurezaVocacion.trim().length > 0}
                            >
                              <ThemedText style={[
                                styles.label,
                                editFePurezaVocacion.trim().length > 0 && styles.labelDisabled
                              ]}>Fe / Pureza / Vocación:</ThemedText>
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
                              disabled={editTrabajoEstudio.trim().length > 0}
                            >
                              <ThemedText style={[
                                styles.label,
                                editTrabajoEstudio.trim().length > 0 && styles.labelDisabled
                              ]}>Trabajo / Estudio:</ThemedText>
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
                              disabled={editFraternidad.trim().length > 0}
                            >
                              <ThemedText style={[
                                styles.label,
                                editFraternidad.trim().length > 0 && styles.labelDisabled
                              ]}>Fraternidad, amigos y apostolado:</ThemedText>
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
                              disabled={editFamilia.trim().length > 0}
                            >
                              <ThemedText style={[
                                styles.label,
                                editFamilia.trim().length > 0 && styles.labelDisabled
                              ]}>Familia:</ThemedText>
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
                              disabled={editPobrezaGenerosidad.trim().length > 0}
                            >
                              <ThemedText style={[
                                styles.label,
                                editPobrezaGenerosidad.trim().length > 0 && styles.labelDisabled
                              ]}>Pobreza y generosidad:</ThemedText>
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
                              disabled={editPreocupaciones.trim().length > 0}
                            >
                              <ThemedText style={[
                                styles.label,
                                editPreocupaciones.trim().length > 0 && styles.labelDisabled
                              ]}>Preocupaciones, tristezas, alegrías y preguntas:</ThemedText>
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
                              disabled={editPuntoLucha.trim().length > 0}
                            >
                              <ThemedText style={[
                                styles.label,
                                editPuntoLucha.trim().length > 0 && styles.labelDisabled
                              ]}>Punto de lucha:</ThemedText>
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
                      disabled={editPlanVida.trim().length > 0}
                    >
                      <ThemedText style={[
                        styles.label,
                        editPlanVida.trim().length > 0 && styles.labelDisabled
                      ]}>Plan de vida y trato con el Señor:</ThemedText>
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
                    placeholder={activePlaceholder === 'planVida' ? descriptions.planVida : "Pensando en Santa Teresa de Ávila..."}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('mortificacion')}
                      disabled={editMortificacion.trim().length > 0}
                    >
                      <ThemedText style={[
                        styles.label,
                        editMortificacion.trim().length > 0 && styles.labelDisabled
                      ]}>Mortificación y espíritu de sacrificio. Carácter:</ThemedText>
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
                    placeholder={activePlaceholder === 'mortificacion' ? descriptions.mortificacion : "Cerca de San Juan de la Cruz..."}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('presenciaDios')}
                      disabled={editPresenciaDios.trim().length > 0}
                    >
                      <ThemedText style={[
                        styles.label,
                        editPresenciaDios.trim().length > 0 && styles.labelDisabled
                      ]}>Presencia de Dios y aprovechamiento del tiempo:</ThemedText>
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
                    placeholder={activePlaceholder === 'presenciaDios' ? descriptions.presenciaDios : "Como San Josemaría Escrivá..."}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('fePurezaVocacion')}
                      disabled={editFePurezaVocacion.trim().length > 0}
                    >
                      <ThemedText style={[
                        styles.label,
                        editFePurezaVocacion.trim().length > 0 && styles.labelDisabled
                      ]}>Fe / Pureza / Vocación:</ThemedText>
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
                    placeholder={activePlaceholder === 'fePurezaVocacion' ? descriptions.fePurezaVocacion : "Inspirándome en Santa María Goretti..."}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('trabajoEstudio')}
                      disabled={editTrabajoEstudio.trim().length > 0}
                    >
                      <ThemedText style={[
                        styles.label,
                        editTrabajoEstudio.trim().length > 0 && styles.labelDisabled
                      ]}>Trabajo / Estudio:</ThemedText>
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
                    placeholder={activePlaceholder === 'trabajoEstudio' ? descriptions.trabajoEstudio : "Siguiendo a Santo Tomás de Aquino..."}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('fraternidad')}
                      disabled={editFraternidad.trim().length > 0}
                    >
                      <ThemedText style={[
                        styles.label,
                        editFraternidad.trim().length > 0 && styles.labelDisabled
                      ]}>Fraternidad, amigos y apostolado:</ThemedText>
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
                    placeholder={activePlaceholder === 'fraternidad' ? descriptions.fraternidad : "Al estilo de San Juan Bosco..."}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('familia')}
                      disabled={editFamilia.trim().length > 0}
                    >
                      <ThemedText style={[
                        styles.label,
                        editFamilia.trim().length > 0 && styles.labelDisabled
                      ]}>Familia:</ThemedText>
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
                    placeholder={activePlaceholder === 'familia' ? descriptions.familia : "Imitando a San José..."}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('pobrezaGenerosidad')}
                      disabled={editPobrezaGenerosidad.trim().length > 0}
                    >
                      <ThemedText style={[
                        styles.label,
                        editPobrezaGenerosidad.trim().length > 0 && styles.labelDisabled
                      ]}>Pobreza y generosidad:</ThemedText>
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
                    placeholder={activePlaceholder === 'pobrezaGenerosidad' ? descriptions.pobrezaGenerosidad : "Caminando con San Francisco de Asís..."}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('preocupaciones')}
                      disabled={editPreocupaciones.trim().length > 0}
                    >
                      <ThemedText style={[
                        styles.label,
                        editPreocupaciones.trim().length > 0 && styles.labelDisabled
                      ]}>Preocupaciones, tristezas, alegrías y preguntas:</ThemedText>
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
                    placeholder={activePlaceholder === 'preocupaciones' ? descriptions.preocupaciones : "Confiando como Santa Teresita del Niño Jesús..."}
                    placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  />

                  <View style={styles.labelContainer}>
                    <TouchableOpacity 
                      onPress={() => handleInfoPress('puntoLucha')}
                      disabled={editPuntoLucha.trim().length > 0}
                    >
                      <ThemedText style={[
                        styles.label,
                        editPuntoLucha.trim().length > 0 && styles.labelDisabled
                      ]}>Punto de lucha:</ThemedText>
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
                    placeholder={activePlaceholder === 'puntoLucha' ? descriptions.puntoLucha : "Acompañando a San Ignacio de Loyola..."}
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
  labelDisabled: {
    textDecorationLine: 'none',
    opacity: 0.7,
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