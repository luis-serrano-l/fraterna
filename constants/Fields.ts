import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Field {
  id: number;
  key: string;
  label: string;
  placeholder: string;
}

export const defaultFields: Field[] = [
  {
    id: 1,
    key: 'planVida',
    label: "Plan de vida y trato con el Señor",
    placeholder: "",
  },
  {
    id: 2,
    key: 'mortificacion',
    label: "Mortificación y espíritu de sacrificio. Carácter",
    placeholder: "",
  },
  {
    id: 3,
    key: 'presenciaDios',
    label: "Presencia de Dios y aprovechamiento del tiempo",
    placeholder: "",
  },
  {
    id: 4,
    key: 'fePurezaVocacion',
    label: "Fe / Pureza / Vocación",
    placeholder: "",
  },
  {
    id: 5,
    key: 'trabajoEstudio',
    label: "Trabajo / Estudio",
    placeholder: "",
  },
  {
    id: 6,
    key: 'fraternidad',
    label: "Fraternidad, amigos y apostolado",
    placeholder: "",
  },
  {
    id: 7,
    key: 'familia',
    label: "Familia",
    placeholder: "",
  },
  {
    id: 8,
    key: 'pobrezaGenerosidad',
    label: "Pobreza y generosidad",
    placeholder: "",
  },
  {
    id: 9,
    key: 'preocupaciones',
    label: "Preocupaciones, tristezas, alegrías y preguntas",
    placeholder: "",
  },
  {
    id: 10,
    key: 'puntoLucha',
    label: "Punto de lucha",
    placeholder: "",
  },
  {
    id: 11,
    key: 'libros',
    label: "Libros",
    placeholder: "",
  },
];

// Custom fields storage key
export const CUSTOM_FIELDS_STORAGE_KEY = 'customFields';
export const EDITED_FIELD_LABELS_STORAGE_KEY = 'editedFieldLabels';

// Function to get all fields (default + custom)
export const getAllFields = async (): Promise<Field[]> => {
  try {
    // Clean up field order first to remove any orphaned IDs
    await cleanupFieldOrder();

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

    // Get all fields (default + custom) - ensure no duplicates by ID
    const fieldMap = new Map<number, Field>();

    // Add default fields first
    updatedDefaultFields.forEach(field => {
      fieldMap.set(field.id, field);
    });

    // Add custom fields (they will override default fields if same ID, but shouldn't happen)
    customFields.forEach(field => {
      fieldMap.set(field.id, field);
    });

    const allFields = Array.from(fieldMap.values());

    // Load saved field order
    const fieldOrderJson = await AsyncStorage.getItem('fieldOrder');
    if (fieldOrderJson) {
      const fieldOrder: number[] = JSON.parse(fieldOrderJson);

      // Reorder fields based on saved order
      const orderedFields: Field[] = [];
      const usedIds = new Set<number>();

      // Add fields in the saved order
      fieldOrder.forEach(id => {
        const field = fieldMap.get(id);
        if (field) {
          orderedFields.push(field);
          usedIds.add(id);
        }
      });

      // Add any remaining fields that weren't in the order (new fields)
      allFields.forEach(field => {
        if (!usedIds.has(field.id)) {
          orderedFields.push(field);
        }
      });

      return orderedFields;
    }

    // If no saved order, return fields in default order
    return allFields;
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

    // Get all existing fields to find the next available ID
    const allFields = [...defaultFields, ...customFields];
    const existingIds = new Set(allFields.map(f => f.id));

    // Find the first available ID starting from 11 (since 1-10 are reserved for default fields)
    let nextId = 11;
    while (existingIds.has(nextId)) {
      nextId++;
    }

    const newField: Field = {
      ...field,
      id: nextId,
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

// Helper function to clean up field order by removing non-existent field IDs
export const cleanupFieldOrder = async (): Promise<void> => {
  try {
    const fieldOrderJson = await AsyncStorage.getItem('fieldOrder');
    if (!fieldOrderJson) return;

    const fieldOrder: number[] = JSON.parse(fieldOrderJson);

    // Get all existing fields
    const customFieldsJson = await AsyncStorage.getItem(CUSTOM_FIELDS_STORAGE_KEY);
    const customFields: Field[] = customFieldsJson ? JSON.parse(customFieldsJson) : [];
    const allFields = [...defaultFields, ...customFields];
    const existingIds = new Set(allFields.map(f => f.id));

    // Remove non-existent IDs from the order
    const cleanedOrder = fieldOrder.filter(id => existingIds.has(id));

    // Only update if there were changes
    if (cleanedOrder.length !== fieldOrder.length) {
      await AsyncStorage.setItem('fieldOrder', JSON.stringify(cleanedOrder));
    }
  } catch (error) {
    console.error('Error cleaning up field order:', error);
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
  preocupaciones: "Preocupaciones, tristezas, alegrías",
  puntoLucha: "Punto de lucha",
  libros: "Libros",
};

export const personalQuestions: Record<number, string> = {
  1: `1. ¿Busco momentos concretos para rezar y trato de que la oración sea parte esencial de mi día?
2. ¿Procuro vivir las normas de piedad con flexibilidad y sinceridad, evitando la rutina?
3. ¿Pongo medios para superar las dificultades que pueden afectar mi plan de vida espiritual?
4. ¿Intento crecer en mi relación personal con Jesús, amándole y siguiéndole cada vez más?`,

  2: `1. ¿Me dejo llevar por tendencias hedonistas que rechazan la contrariedad?
2. ¿Tengo un espíritu de mortificación estable o solo actos esporádicos?
3. ¿Acepto las mortificaciones pasivas con paz interior o me quejo?
4. ¿Practico la mortificación interior apartando pensamientos inútiles?`,

  3: `1. ¿Procuro vivir cada momento con la conciencia de que Dios está presente, tomando decisiones que reflejen mi dignidad de hijo suyo?
2. ¿Agradezco a Dios a lo largo del día y busco mantenerme unido a Él mediante jaculatorias, comuniones espirituales y actos de amor?
3. ¿Utilizo los signos de la fe, como el Sagrario o la Cruz, para renovar mi unión con Dios en medio de mis actividades diarias?
4. ¿Valoro el tiempo como un don de Dios, esforzándome en ser generoso y leal, y evitando desperdiciar los días que se me conceden?
5. ¿Empleo mis talentos y mi tiempo para servir a Dios y a los demás, luchando contra la pereza y el egoísmo?
6. ¿Vivo atento a los pequeños detalles, convencido de que mi vida y mi tiempo pertenecen a Dios y deben ser instrumentos para su voluntad?`,

  4: `1. ¿Cómo se refleja mi fe en las situaciones cotidianas, especialmente cuando enfrento dificultades, enfermedades o contratiempos?
2. ¿Procuro aceptar los momentos menos agradables como parte del plan de Dios, evitando la queja y el desánimo, y los ofrezco como oportunidad de crecimiento?
3. ¿Conozco y cumplo los compromisos y valores morales que implica mi vocación, siendo leal a la Iglesia y fiel a mis promesas y responsabilidades?
4. ¿Doy testimonio alegre de pureza, mostrando con mi vida la belleza, generosidad y alegría que nacen de esta virtud?`,

  5: `1. ¿Procuro ofrecer mi trabajo diario a Dios, buscando su presencia en las tareas grandes y pequeñas?
2. ¿Colaboro con mis compañeros de trabajo, mostrando espíritu de servicio y ayudando cuando lo necesitan?
3. ¿Trabajo con rectitud de intención, evitando la búsqueda de reconocimiento personal y poniendo a Dios en primer lugar?
4. ¿Me esfuerzo por ser responsable y justo en mis obligaciones laborales, cuidando la calidad y honestidad en lo que hago?
5. ¿Dedico tiempo a mi formación profesional y espiritual, procurando crecer como persona y cristiano en el ámbito laboral?`,

  6: `1. ¿Procuro que mi trato con los demás refleje mi vida interior, mostrando amabilidad y apertura a todos?
2. ¿Me intereso sinceramente por las personas que me rodean, rezando por ellas y ayudando en lo que puedo?
3. ¿Busco oportunidades para servir y ser generoso con mi tiempo y recursos, tanto en la familia como con amigos?
4. ¿Mantengo el deseo de ayudar a otros a acercarse a Dios, incluso en momentos de dificultad o cansancio?`,

  7: `1. ¿Contribuyo a la unidad y el buen ambiente en mi familia mediante pequeños detalles de servicio y comprensión?
2. ¿Procuro que Dios esté presente en mi hogar a través de la oración y costumbres cristianas sencillas?
3. ¿Ayudo a mis padres y familiares con cariño y responsabilidad, cumpliendo mis deberes familiares con alegría?
4. ¿Intento ser ejemplo de fe y alegría para mi familia, apoyando a cada uno en su camino hacia Dios?`,

  8: `1. ¿Vivo con sencillez y desprendimiento de los bienes materiales, valorando lo que tengo sin apegarme a ello?
2. ¿Utilizo mis talentos y recursos para el bien de los demás, evitando el derroche y la búsqueda de lujos innecesarios?
3. ¿Soy generoso con los que me rodean, compartiendo lo que tengo y ayudando a quienes lo necesitan?
4. ¿Acepto con serenidad las dificultades materiales, confiando en la providencia de Dios y aprendiendo de cada situación?`,

  9: `1. ¿Procuro mantener la alegría y el optimismo, superando la tristeza y las dificultades con esperanza cristiana?
2. ¿Reconozco la presencia de Dios en mi vida como fuente de alegría, compartiéndola con quienes me rodean?
3. ¿Busco motivos para agradecer y sonreír cada día, incluso cuando las cosas no salen como espero?
4. ¿Mantengo la paz interior en medio de los problemas, confiando en el amor de Dios y evitando buscar consuelos superficiales?`,

  10: `1. ¿Me esfuerzo por conocerme a mí mismo, reconociendo mis virtudes y defectos con sinceridad ante Dios?
2. ¿Tengo un propósito concreto de mejora personal y lucho por alcanzarlo con constancia?
3. ¿Reflexiono sobre las causas de mis errores y busco soluciones prácticas para superarlos?
4. ¿Comparto con humildad mis avances y dificultades en la dirección espiritual, buscando crecer en sinceridad y autoconocimiento?`,
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