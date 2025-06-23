import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Field {
  id: number;
  key: string;
  label: string;
  placeholder: string;
  hasSpecialText: boolean;
}

export const defaultFields: Field[] = [
  {
    id: 1,
    key: 'planVida',
    label: "Plan de vida y trato con el Señor:",
    placeholder: "",
    hasSpecialText: false,
  },
  {
    id: 2,
    key: 'mortificacion',
    label: "Mortificación y espíritu de sacrificio. Carácter:",
    placeholder: "",
    hasSpecialText: true,
  },
  {
    id: 3,
    key: 'presenciaDios',
    label: "Presencia de Dios y aprovechamiento del tiempo:",
    placeholder: "",
    hasSpecialText: false,
  },
  {
    id: 4,
    key: 'fePurezaVocacion',
    label: "Fe / Pureza / Vocación:",
    placeholder: "",
    hasSpecialText: false,
  },
  {
    id: 5,
    key: 'trabajoEstudio',
    label: "Trabajo / Estudio:",
    placeholder: "",
    hasSpecialText: false,
  },
  {
    id: 6,
    key: 'fraternidad',
    label: "Fraternidad, amigos y apostolado:",
    placeholder: "",
    hasSpecialText: false,
  },
  {
    id: 7,
    key: 'familia',
    label: "Familia:",
    placeholder: "",
    hasSpecialText: false,
  },
  {
    id: 8,
    key: 'pobrezaGenerosidad',
    label: "Pobreza y generosidad:",
    placeholder: "",
    hasSpecialText: false,
  },
  {
    id: 9,
    key: 'preocupaciones',
    label: "Preocupaciones, tristezas, alegrías y preguntas:",
    placeholder: "",
    hasSpecialText: false,
  },
  {
    id: 10,
    key: 'puntoLucha',
    label: "Punto de lucha:",
    placeholder: "",
    hasSpecialText: false,
  },
];

// Custom fields storage key
export const CUSTOM_FIELDS_STORAGE_KEY = 'customFields';
export const EDITED_FIELD_LABELS_STORAGE_KEY = 'editedFieldLabels';

// Function to get all fields (default + custom)
export const getAllFields = async (): Promise<Field[]> => {
  try {
    const customFieldsJson = await AsyncStorage.getItem(CUSTOM_FIELDS_STORAGE_KEY);
    const customFields: Field[] = customFieldsJson ? JSON.parse(customFieldsJson) : [];
    
    // Load edited labels for default fields
    const editedLabelsJson = await AsyncStorage.getItem(EDITED_FIELD_LABELS_STORAGE_KEY);
    const editedLabels: Record<number, string> = editedLabelsJson ? JSON.parse(editedLabelsJson) : {};
    
    // Apply edited labels to default fields
    const updatedDefaultFields = defaultFields.map(field => ({
      ...field,
      label: editedLabels[field.id] || field.label
    }));
    
    return [...updatedDefaultFields, ...customFields];
  } catch (error) {
    console.error('Error loading custom fields:', error);
    return defaultFields;
  }
};

// Function to edit a field label
export const editFieldLabel = async (fieldId: number, newLabel: string): Promise<void> => {
  try {
    const editedLabelsJson = await AsyncStorage.getItem(EDITED_FIELD_LABELS_STORAGE_KEY);
    const editedLabels: Record<number, string> = editedLabelsJson ? JSON.parse(editedLabelsJson) : {};
    
    editedLabels[fieldId] = newLabel;
    await AsyncStorage.setItem(EDITED_FIELD_LABELS_STORAGE_KEY, JSON.stringify(editedLabels));
  } catch (error) {
    console.error('Error editing field label:', error);
    throw error;
  }
};

// Function to reset a field label to default
export const resetFieldLabel = async (fieldId: number): Promise<void> => {
  try {
    const editedLabelsJson = await AsyncStorage.getItem(EDITED_FIELD_LABELS_STORAGE_KEY);
    const editedLabels: Record<number, string> = editedLabelsJson ? JSON.parse(editedLabelsJson) : {};
    
    delete editedLabels[fieldId];
    await AsyncStorage.setItem(EDITED_FIELD_LABELS_STORAGE_KEY, JSON.stringify(editedLabels));
  } catch (error) {
    console.error('Error resetting field label:', error);
    throw error;
  }
};

// Function to add a custom field
export const addCustomField = async (field: Omit<Field, 'id'>): Promise<Field> => {
  try {
    const customFieldsJson = await AsyncStorage.getItem(CUSTOM_FIELDS_STORAGE_KEY);
    const customFields: Field[] = customFieldsJson ? JSON.parse(customFieldsJson) : [];
    
    // Generate new ID (highest existing ID + 1)
    const allFields = [...defaultFields, ...customFields];
    const maxId = Math.max(...allFields.map(f => f.id));
    const newField: Field = {
      ...field,
      id: maxId + 1,
    };
    
    const updatedCustomFields = [...customFields, newField];
    await AsyncStorage.setItem(CUSTOM_FIELDS_STORAGE_KEY, JSON.stringify(updatedCustomFields));
    
    return newField;
  } catch (error) {
    console.error('Error adding custom field:', error);
    throw error;
  }
};

// Function to edit a custom field
export const editCustomField = async (fieldId: number, updatedField: Partial<Field>): Promise<void> => {
  try {
    const customFieldsJson = await AsyncStorage.getItem(CUSTOM_FIELDS_STORAGE_KEY);
    const customFields: Field[] = customFieldsJson ? JSON.parse(customFieldsJson) : [];
    
    const updatedCustomFields = customFields.map(field => 
      field.id === fieldId ? { ...field, ...updatedField } : field
    );
    
    await AsyncStorage.setItem(CUSTOM_FIELDS_STORAGE_KEY, JSON.stringify(updatedCustomFields));
  } catch (error) {
    console.error('Error editing custom field:', error);
    throw error;
  }
};

// Function to remove a custom field
export const removeCustomField = async (fieldId: number): Promise<void> => {
  try {
    const customFieldsJson = await AsyncStorage.getItem(CUSTOM_FIELDS_STORAGE_KEY);
    const customFields: Field[] = customFieldsJson ? JSON.parse(customFieldsJson) : [];
    
    const updatedCustomFields = customFields.filter(field => field.id !== fieldId);
    await AsyncStorage.setItem(CUSTOM_FIELDS_STORAGE_KEY, JSON.stringify(updatedCustomFields));
  } catch (error) {
    console.error('Error removing custom field:', error);
    throw error;
  }
};

export const descriptions = {
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

export const personalQuestions: Record<number, string> = {
  1: "1. ¿Cómo me siento hoy? ¿Qué me ha pasado? ¿Qué me ha enseñado? ¿Qué me ha hecho sentir?",
  2: `1. ¿Me dejo llevar por tendencias hedonistas que rechazan la contrariedad?

2. ¿Tengo un espíritu de mortificación estable o solo actos esporádicos?

3. ¿Acepto las mortificaciones pasivas con paz interior o me quejo?

4. ¿Practico la mortificación interior apartando pensamientos inútiles?

5. ¿Comprendo que la mortificación es necesaria para el progreso espiritual?`,
  // Add more field IDs and their questions here as needed
  // 3: "Questions for field 3...",
  // 5: "Questions for field 5...",
};

// Create mappings for easy access (will be updated dynamically)
export const createFieldMappings = (fields: Field[]) => {
  const fieldConfig = fields.reduce((acc, field) => {
    acc[field.key] = field;
    return acc;
  }, {} as Record<string, Field>);

  const fieldIdToKey: Record<number, string> = fields.reduce((acc, field) => {
    acc[field.id] = field.key;
    return acc;
  }, {} as Record<number, string>);

  const fieldKeyToId: Record<string, number> = fields.reduce((acc, field) => {
    acc[field.key] = field.id;
    return acc;
  }, {} as Record<string, number>);

  return { fieldConfig, fieldIdToKey, fieldKeyToId };
};

// Legacy mappings for backward compatibility (using default fields only)
export const fieldConfig = defaultFields.reduce((acc, field) => {
  acc[field.key] = field;
  return acc;
}, {} as Record<string, Field>);

export const fieldIdToKey: Record<number, string> = defaultFields.reduce((acc, field) => {
  acc[field.id] = field.key;
  return acc;
}, {} as Record<number, string>);

export const fieldKeyToId: Record<string, number> = defaultFields.reduce((acc, field) => {
  acc[field.key] = field.id;
  return acc;
}, {} as Record<string, number>); 