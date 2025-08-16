export type PresetPlayer = {
  id: string;       // slug único (sin espacios)
  name: string;     // nombre visible
  image?: string;   // ruta a imagen opcional
};

// ⚠️ Colocá imágenes (opcional) en /public/players/<id>.jpg
// Si no hay imagen, se muestran iniciales automáticamente.
export const PRESETS: PresetPlayer[] = [
  { id: 'fausto',  name: 'Fausto',  image: '/players/fausto.jpg' },
  { id: 'ulises',  name: 'Ulises',  image: '/players/ulises.jpg' },
  { id: 'ivan',    name: 'Ivan',    image: '/players/ivan.jpg' },
  { id: 'lio',     name: 'Lio',     image: '/players/lio.jpg' },
  { id: 'cami',    name: 'Cami',    image: '/players/cami.jpg' },
  { id: 'aldana',  name: 'Aldana',  image: '/players/aldana.jpg' },
  { id: 'vanina',  name: 'Vanina',  image: '/players/vanina.jpg' },
  { id: 'emi',     name: 'Emi',     image: '/players/emi.jpg' },
  { id: 'naza',    name: 'Naza',    image: '/players/naza.jpg' },
  { id: 'german',  name: 'German',  image: '/players/german.jpg' },
  { id: 'pupy',    name: 'Pupy',    image: '/players/pupy.jpg' },
  { id: 'belu',    name: 'belu',    image: '/players/belu.jpg' },
];
