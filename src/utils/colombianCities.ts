export const colombianDepartments = [
  'Amazonas',
  'Antioquia',
  'Arauca',
  'Atlántico',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Caquetá',
  'Casanare',
  'Cauca',
  'Cesar',
  'Chocó',
  'Córdoba',
  'Cundinamarca',
  'Guainía',
  'Guaviare',
  'Huila',
  'La Guajira',
  'Magdalena',
  'Meta',
  'Nariño',
  'Norte de Santander',
  'Putumayo',
  'Quindío',
  'Risaralda',
  'San Andrés y Providencia',
  'Santander',
  'Sucre',
  'Tolima',
  'Valle del Cauca',
  'Vaupés',
  'Vichada',
];

export const colombianCitiesByDepartment: { [key: string]: string[] } = {
  'Amazonas': ['Leticia', 'Puerto Nariño'],
  'Antioquia': ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Apartadó', 'Turbo', 'Rionegro', 'Caucasia', 'Sabaneta', 'La Estrella', 'Caldas', 'Copacabana', 'Girardota', 'Barbosa', 'Puerto Berrío'],
  'Arauca': ['Arauca', 'Tame', 'Saravena', 'Arauquita', 'Fortul'],
  'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Puerto Colombia', 'Baranoa', 'Galapa', 'Palmar de Varela'],
  'Bolívar': ['Cartagena', 'Magangué', 'Turbaco', 'Arjona', 'El Carmen de Bolívar', 'Mompós', 'Turbana', 'San Juan Nepomuceno'],
  'Boyacá': ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa', 'Villa de Leyva', 'Puerto Boyacá', 'Moniquirá', 'Nobsa', 'Tibasosa'],
  'Caldas': ['Manizales', 'Villamaría', 'La Dorada', 'Chinchiná', 'Riosucio', 'Anserma', 'Palestina', 'Neira'],
  'Caquetá': ['Florencia', 'San Vicente del Caguán', 'Puerto Rico', 'El Doncello', 'El Paujil'],
  'Casanare': ['Yopal', 'Aguazul', 'Villanueva', 'Monterrey', 'Tauramena', 'Paz de Ariporo'],
  'Cauca': ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Patía', 'Corinto', 'Guachené', 'Miranda', 'Piendamó'],
  'Cesar': ['Valledupar', 'Aguachica', 'Bosconia', 'Agustín Codazzi', 'La Paz', 'Curumaní', 'Chimichagua', 'Pailitas'],
  'Chocó': ['Quibdó', 'Istmina', 'Condoto', 'Tadó', 'Acandí', 'El Carmen de Atrato'],
  'Córdoba': ['Montería', 'Cereté', 'Lorica', 'Sahagún', 'Montelíbano', 'Planeta Rica', 'Tierralta', 'Ayapel'],
  'Cundinamarca': ['Bogotá D.C.', 'Soacha', 'Facatativá', 'Zipaquirá', 'Chía', 'Mosquera', 'Funza', 'Madrid', 'Cajicá', 'Sibaté', 'Fusagasugá', 'Girardot', 'Villeta', 'La Mesa', 'Anapoima'],
  'Guainía': ['Inírida', 'Barranco Minas'],
  'Guaviare': ['San José del Guaviare', 'Calamar', 'El Retorno', 'Miraflores'],
  'Huila': ['Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre', 'San Agustín', 'Timaná', 'Gigante'],
  'La Guajira': ['Riohacha', 'Maicao', 'Uribia', 'Manaure', 'San Juan del Cesar', 'Fonseca', 'Villanueva'],
  'Magdalena': ['Santa Marta', 'Ciénaga', 'Fundación', 'Zona Bananera', 'Plato', 'El Banco', 'Aracataca'],
  'Meta': ['Villavicencio', 'Acacías', 'Granada', 'Puerto López', 'San Martín', 'Puerto Gaitán', 'Restrepo', 'Cumaral'],
  'Nariño': ['Pasto', 'Tumaco', 'Ipiales', 'Túquerres', 'Samaniego', 'La Unión', 'Barbacoas', 'San Andrés de Tumaco'],
  'Norte de Santander': ['Cúcuta', 'Ocaña', 'Pamplona', 'Villa del Rosario', 'Los Patios', 'Chinácota', 'Tibú', 'El Zulia'],
  'Putumayo': ['Mocoa', 'Puerto Asís', 'Orito', 'Valle del Guamuez', 'Puerto Guzmán', 'Villagarzón'],
  'Quindío': ['Armenia', 'Calarcá', 'La Tebaida', 'Montenegro', 'Quimbaya', 'Circasia', 'Filandia', 'Salento'],
  'Risaralda': ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia', 'Marsella', 'Quinchía', 'Belén de Umbría'],
  'San Andrés y Providencia': ['San Andrés', 'Providencia'],
  'Santander': ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'San Gil', 'Socorro', 'Málaga', 'Barbosa', 'Vélez'],
  'Sucre': ['Sincelejo', 'Corozal', 'Sampués', 'Tolú', 'San Marcos', 'Majagual', 'San Onofre'],
  'Tolima': ['Ibagué', 'Espinal', 'Melgar', 'Honda', 'Chaparral', 'Líbano', 'Mariquita', 'Flandes'],
  'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Buga', 'Jamundí', 'Yumbo', 'Candelaria', 'Florida', 'Pradera', 'Sevilla'],
  'Vaupés': ['Mitú', 'Carurú'],
  'Vichada': ['Puerto Carreño', 'La Primavera', 'Cumaribo'],
};

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
