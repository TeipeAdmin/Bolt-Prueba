export const colombianCities = [
  'Bogotá D.C.',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Cartagena',
  'Cúcuta',
  'Bucaramanga',
  'Pereira',
  'Santa Marta',
  'Ibagué',
  'Pasto',
  'Manizales',
  'Neiva',
  'Villavicencio',
  'Armenia',
  'Valledupar',
  'Montería',
  'Sincelejo',
  'Popayán',
  'Buenaventura',
  'Tunja',
  'Florencia',
  'Riohacha',
  'Yopal',
  'Quibdó',
  'Leticia',
  'Mocoa',
  'San Andrés',
  'Arauca',
  'Mitú',
  'Inírida',
  'Puerto Carreño',
];

export const validateNIT = (nit: string): boolean => {
  const nitRegex = /^\d{9,10}-\d{1}$/;
  return nitRegex.test(nit);
};

export const formatNIT = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');

  if (cleaned.length === 0) return '';
  if (cleaned.length <= 9) return cleaned;
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 9)}-${cleaned.slice(9)}`;
  }

  return `${cleaned.slice(0, 9)}-${cleaned.slice(9, 10)}`;
};
