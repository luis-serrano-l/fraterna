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
    label: "Plan de vida y trato con el Señor:",
    placeholder: "",
  },
  {
    id: 2,
    key: 'mortificacion',
    label: "Mortificación y espíritu de sacrificio. Carácter:",
    placeholder: "",
  },
  {
    id: 3,
    key: 'presenciaDios',
    label: "Presencia de Dios y aprovechamiento del tiempo:",
    placeholder: "",
  },
  {
    id: 4,
    key: 'fePurezaVocacion',
    label: "Fe / Pureza / Vocación:",
    placeholder: "",
  },
  {
    id: 5,
    key: 'trabajoEstudio',
    label: "Trabajo / Estudio:",
    placeholder: "",
  },
  {
    id: 6,
    key: 'fraternidad',
    label: "Fraternidad, amigos y apostolado:",
    placeholder: "",
  },
  {
    id: 7,
    key: 'familia',
    label: "Familia:",
    placeholder: "",
  },
  {
    id: 8,
    key: 'pobrezaGenerosidad',
    label: "Pobreza y generosidad:",
    placeholder: "",
  },
  {
    id: 9,
    key: 'preocupaciones',
    label: "Preocupaciones, tristezas, alegrías y preguntas:",
    placeholder: "",
  },
  {
    id: 10,
    key: 'puntoLucha',
    label: "Punto de lucha:",
    placeholder: "",
  },
  {
    id: 11,
    key: 'libros',
    label: "Libros:",
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
  1: `1. ¿Procuro que mi vida de oración sea alimento diario para el alma, buscando momentos concretos para acudir al Señor y santificar el trabajo y la vida entera?
2. ¿Vivo las normas de piedad como un itinerario flexible y adaptado a mis circunstancias, evitando que se conviertan en compartimentos estancos o en una rutina vacía?
3. ¿Preveo con anticipación las dificultades que pueden impedir el cumplimiento de mi plan de vida, y pongo los medios para perseverar en la oración y el trato con Dios?
4. ¿Busco cada vez un trato más íntimo y amoroso con Jesús, centrando mi vida cristiana en amarle e imitarle, y no solo en evitar el mal?`,

  2: `1. ¿Me dejo llevar por tendencias hedonistas que rechazan la contrariedad?
2. ¿Tengo un espíritu de mortificación estable o solo actos esporádicos?
3. ¿Acepto las mortificaciones pasivas con paz interior o me quejo?
4. ¿Practico la mortificación interior apartando pensamientos inútiles?`,

  3: `1. ¿Vivo con la conciencia de estar siempre en presencia de Dios, procurando comportarme dignamente como hijo suyo y considerando mis decisiones delante de Él?
2. ¿Elevo mi corazón a Dios muchas veces al día, dándole gracias por todo, y procuro mantenerme unido a Él mediante jaculatorias, comuniones espirituales y actos de amor?
3. ¿Aprovecho los signos visibles de la fe (Sagrarios, imágenes, la Cruz) para renovar mi presencia de Dios y mi unión con Jesús y María en medio de las ocupaciones diarias?
4. ¿Aprovecho el paso del tiempo y la brevedad de la vida como una invitación a la generosidad, la lealtad y el amor, evitando malgastar el tesoro de cada día?
5. ¿Procuro que mi tiempo y mis talentos rindan para Dios y para el bien de los demás, evitando la tibieza, la pereza y el egoísmo?
6. ¿Vivo mi vida como un instrumento de Dios, cuidando los detalles pequeños de mi vida, convencido de que mi tiempo no me pertenece, sino que es del Padre?`,

  4: `1. ¿Cómo se manifiesta mi fe en los acontecimientos ordinarios de mi vida diaria, especialmente en las dificultades, enfermedades o contradicciones?
2. ¿Veo los sucesos menos agradables como parte del plan providencial de Dios, evitando la queja y el tono negativo, y los ofrezco como medio de santificación?
3. ¿Conozco y respeto los compromisos y criterios morales que implica la tarea a la que Dios me llama, siendo leal a la Iglesia y fiel a la palabra dada y a los compromisos libremente adquiridos?
4. ¿Doy ejemplo alegre de pureza, mostrando con mi vida la belleza, la generosidad y la alegría que se derivan de esta virtud?`,

  5: `1. ¿Procuro encontrar al Señor en medio de mi trabajo, ofreciéndole mi labor como una ofrenda diaria y sintiéndome partícipe de la Creación en lo que ejecuto, aunque parezca pequeño?
2. ¿Cultivo las virtudes de la convivencia en mi trabajo, prestando esos pequeños servicios que tanto se agradecen, rezando por mis colegas y ayudándoles a resolver sus problemas?
3. ¿Busco la gloria de Dios en mi trabajo o me dejo llevar por motivos egoístas como la ambición, vanidad o ansias de ser considerado, olvidando que el éxito consiste en cumplir la voluntad divina?
4. ¿Cuido mi prestigio profesional siendo ejemplar y competente en mis quehaceres, viviendo la justicia y las demás virtudes morales, sin que esto enmascare fines egoístas?
5. ¿Cumplo acabadamente las obligaciones diarias para con Dios y dedico a mi formación espiritual y humana el tiempo debido, manteniendo la unidad de vida?`,

  6: `1. ¿Se manifiesta mi vida interior en el trato con los demás, facilitando a quienes están cerca el camino hacia el Señor mediante la amistad, la cordialidad y el sentido positivo de la vida?
2. ¿Me preocupo activamente por la santidad de los que me rodean, ayudándoles con la corrección fraterna, la oración, el cuidado por los enfermos y el esfuerzo por hacerles la vida más amable?
3. ¿Procuro que mi caridad se traduzca en obras concretas, como el espíritu de servicio en la familia, la generosidad con el tiempo y los bienes, y la comprensión con todos?
4. ¿Mantengo el celo apostólico incluso en la enfermedad, el aislamiento o la dificultad, ofreciendo mis oraciones y sacrificios por la salvación de las almas, convencido de que nada se pierde cuando se trabaja por Dios?`,

  7: `1. ¿Procuro ser instrumento de unión entre los diversos miembros de mi familia a través del servicio gustoso y de los pequeños sacrificios diarios en favor de los demás, esforzándome para que cada uno mejore en sus relaciones con Dios?
2. ¿Hago presente a Dios en el hogar con costumbres cristianas como la bendición de la mesa, rezar con los hijos, leer algún versículo del Evangelio, asistir juntos a la Santa Misa, y cuando sea posible, el Santo Rosario?
3. ¿Ayudo a mis padres con abnegación y cariño, cumpliendo el Cuarto Mandamiento como un "dulcísimo precepto" que tiene sus raíces en la paternidad de Dios?
4. ¿Mi alegría y ejemplaridad preceden al apostolado con mi cónyuge, hijos y otras familias, naciendo de una vida fundamentada en la oración y de la correspondencia imaginativa a la vocación matrimonial que he recibido de Dios?`,

  8: `1. ¿Estoy desprendido de los bienes materiales, disfrutándolos como bondad creada de Dios, pero sin considerar necesarias cosas de las que puedo prescindir con un poco de buena voluntad?
2. ¿Procuro hacer rendir mis talentos en beneficio de toda la sociedad, cuidando la ropa e instrumentos de trabajo, evitando gastos desproporcionados y escogiendo para mí lo peor en la intimidad familiar?
3. ¿Evito gastos personales motivados por el capricho, la vanidad, el deseo de lujo o la poltronería, siendo austero conmigo mismo y generoso siempre con los demás?
4. ¿Acepto con paz y alegría la escasez o la falta de lo necesario, ofreciendo estas dificultades para crecer en el sentido de la filiación divina y disponiendo mi alma para los bienes sobrenaturales?`,

  9: `1. ¿Lucho para estar siempre alegre, procurando olvidarme de mí mismo y aceptando las contradicciones, o me dejo llevar por la tristeza que es origen de muchos males y debilita mi alma para el bien?
2. ¿Tengo como sumo gozo haber encontrado al Señor en mi vida y como fundamento de mi existencia el ser y sentirme hijo de Dios, extendiendo esa alegría a la familia, amigos y compañeros de trabajo?
3. ¿Fomento la alegría de modo positivo, venciendo los estados de ánimo tristes y pesimistas, considerando el amor de Dios por mí y el valor del sufrimiento unido a la Cruz, o espero a que la alegría se presente sola?
4. ¿Mantengo la paz y la alegría incluso en medio del dolor, la pobreza o la enfermedad, con la mirada puesta en el Señor y siendo generoso en lo que pide, o busco compensaciones que llenen el vacío de la falta de alegría?`,

  10: `1. ¿Me conozco a mí mismo como me contempla Dios, viendo con claridad sin falsas excusas lo que es ocasión de pecado o de alejamiento del Señor, y pongo los remedios oportunos?
2. ¿Tengo un examen particular bien definido sobre un punto concreto de lucha, ya sea para arrancar un defecto que predomina o para adquirir una virtud determinada, luchando eficazmente en lo que más necesita mi alma?
3. ¿Mediante el examen general llego a conocer las raíces de mi actuar: el porqué de mi malhumor, la falta de rectitud de intención, el origen de las faltas de caridad continuadas con una misma persona?
4. ¿Me manifiesto con sencillez en la dirección espiritual, mostrando tanto los frutos como las flaquezas, ejercitando así la humildad y la sinceridad que son parte esencial del conocimiento propio?`,
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