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
  2: `1. ¿Me dejo llevar por tendencias hedonistas que rechazan la contrariedad?

2. ¿Tengo un espíritu de mortificación estable o solo actos esporádicos?

3. ¿Acepto las mortificaciones pasivas con paz interior o me quejo?

4. ¿Practico la mortificación interior apartando pensamientos inútiles?

5. ¿Comprendo que la mortificación es necesaria para el progreso espiritual?`,
  // Add more field IDs and their questions here as needed
  // 3: "Questions for field 3...",
  // 5: "Questions for field 5...",
};

// Create mappings for easy access
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