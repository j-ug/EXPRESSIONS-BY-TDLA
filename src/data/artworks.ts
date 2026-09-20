import { BotanicalArtwork } from '../types';

export const BOTANICAL_ARTWORKS: BotanicalArtwork[] = [
  {
    id: 'artwork-1',
    title: 'The Sacred Bodhi Vein',
    tamilTitle: 'அரச இலை தியானம் (Arasa Ilai)',
    botanicalSpecies: ['Ficus religiosa (Peepal / Sacred Fig)', 'Butea monosperma (Flame of the Forest)'],
    medium: 'Hand-skeletonized Peepal leaf lattice, crushed vermillion madder, on organic handmade cotton rag paper',
    dimensions: '60 × 80 cm',
    year: '2024',
    frameShape: 'rectangle',
    biasLightColor: '#608050', // Soft moss sage rim light
    biasLightIntensity: 1.8,
    description: 'A study of time etched into cellular leaf skeletons. The delicate network of xylem and phloem vessels is meticulously exposed through natural rain-soaking, suspended with crushed botanical mineral pigment.',
    inspiration: 'Collected along the banks of River Kaveri near Tiruchirappalli. Reflects the quiet persistence of venation patterns that outlast the seasonal green.',
    panelPosition: 'below',
    textureTheme: 'peepal_sacred',
  },
  {
    id: 'artwork-2',
    title: 'Kaveri Basin Lotus Bloom',
    tamilTitle: 'தாமரை மலர் இதழ்கள் (Thamarai)',
    botanicalSpecies: ['Nelumbo nucifera (Sacred Lotus)', 'Nymphaea pubescens (Water Lily)'],
    medium: 'Layered pressed sun-dried lotus petals, natural gum arabic glaze, raw ochre pigment',
    dimensions: '75 × 75 cm',
    year: '2024',
    frameShape: 'square',
    biasLightColor: '#b86b77', // Soft warm rose bloom glow
    biasLightIntensity: 2.2,
    description: 'Constructed from mature lotus petals harvested at dawn from temple ponds of Tiruchy. Translucent petal skins are pressed between unbleached blotting sheets over forty days to crystallize their cellular pigment.',
    inspiration: 'Inspired by the concentric geometry of Dravidian pond sanctuaries where petals float like radiant sunbursts at sunrise.',
    panelPosition: 'left',
    textureTheme: 'lotus_kaveri',
  },
  {
    id: 'artwork-3',
    title: 'Palmyra Frond Geometry',
    tamilTitle: 'பனை ஓலை கட்டமைப்பு (Panai Olai)',
    botanicalSpecies: ['Borassus flabellifer (Palmyra Palm)', 'Indigofera tinctoria (True Indigo)'],
    medium: 'Interwoven young palmyra palm fibers, natural indigo wash, deckled sun-bleached bark sheet',
    dimensions: '90 × 55 cm',
    year: '2023',
    frameShape: 'leaf',
    biasLightColor: '#c29b38', // Golden palmyra amber
    biasLightIntensity: 2.0,
    description: 'An organic silhouette framing the architectural strength of Tamil Nadu’s state tree. Slender leaflets are scored, bent, and pressed into radial harmony that catches ambient light at varying rake angles.',
    inspiration: 'The sun-drenched drylands and red laterite soil plains surrounding Tiruchy, where palmyra groves stand as ancient sentinels against the wind.',
    panelPosition: 'above',
    textureTheme: 'palmyra_sun',
  },
  {
    id: 'artwork-4',
    title: 'Vilvam & Temple Canopy',
    tamilTitle: 'வில்வ இலை மாலை (Vilvam)',
    botanicalSpecies: ['Aegle marmelos (Bael / Vilvam)', 'Jasminum sambac (Madurai Jasmine)'],
    medium: 'Trifoliate pressed Vilvam leaves, dried night-blooming jasmine florets, brass dust lacquer',
    dimensions: '70 × 70 cm',
    year: '2024',
    frameShape: 'circular',
    biasLightColor: '#3d7a6b', // Deep sacred temple teal-green
    biasLightIntensity: 2.1,
    description: 'A circular meditation on the sacred triad leaf. Each leaf retains its waxy aromatic sheen, framed by pressed white jasmine sepals that diffuse a subtle visual rhythm.',
    inspiration: 'The cool stone corridors of Rockfort temple gardens, where fallen leaves are reverently gathered at twilight before the temple bells chime.',
    panelPosition: 'right',
    textureTheme: 'vilvam_monsoon',
  },
  {
    id: 'artwork-5',
    title: 'Gulmohar Canopy & Monsoon Petals',
    tamilTitle: 'செம்மயிர்க்கொன்றை (Gulmohar)',
    botanicalSpecies: ['Delonix regia (Gulmohar / Royal Poinciana)', 'Tamarindus indica (Tamarind)'],
    medium: 'Pressed scarlet gulmohar petals, micro-tamarind leaf fronds, natural shellac on linen',
    dimensions: '65 × 95 cm',
    year: '2024',
    frameShape: 'arched',
    biasLightColor: '#cf5a3c', // Warm terracotta vermillion
    biasLightIntensity: 2.3,
    description: 'An arched composition evoking garden arcades after a summer thunderstorm. Vibrant scarlet petals are balanced by delicate micro-compound tamarind foliage arranged in sweeping botanical currents.',
    inspiration: 'The avenue trees along the old Cantonment roads of Tiruchy during pre-monsoon flowering season when carpets of red cover the asphalt.',
    panelPosition: 'below',
    textureTheme: 'jasmine_malli',
  }
];

export const ARTIST_INFO = {
  name: 'Dr. G. Ophylia Vinodhini',
  title: 'Botanical Artist & Researcher',
  discipline: 'Botanical Art with Pressed Leaves, Plant Fibers & Floral Pigments',
  location: 'Tiruchy (Tiruchirappalli), Tamil Nadu, India',
  phone: '+91 9003011813',
  email: 'ophyliagodwin@gmail.com',
  statement: 'My art is an intimate dialogue with the ephemeral architectures of nature. By gathering leaves, flowers, and plant fibers from the riverbanks and temple landscapes of Tamil Nadu, I preserve the microscopic majesty of cellular patterns, vascular networks, and sun-cured pigments into permanent meditative landscapes.',
  background: 'Blending rigorous botanical observation with contemporary artistic expression, Dr. Ophylia’s technique honors ancient Indian preservation methods while pioneering new tactile mediums using indigenous flora.',
  social: {
    whatsapp: 'https://wa.me/919003011813?text=Hello%20Dr.%20Ophylia,%20I%20am%20interested%20in%20your%20botanical%20artworks',
    emailLink: 'mailto:ophyliagodwin@gmail.com?subject=Botanical%20Art%20Inquiry%20-%20Dr.%20Ophylia%20Vinodhini',
  }
};
