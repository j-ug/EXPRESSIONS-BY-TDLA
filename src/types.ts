export type FrameShape = 'rectangle' | 'square' | 'leaf' | 'circular' | 'arched';

export interface BotanicalArtwork {
  id: string;
  title: string;
  tamilTitle?: string;
  botanicalSpecies: string[];
  medium: string;
  dimensions: string;
  year: string;
  price?: string; // e.g. ₹18,500 or $250
  frameShape: FrameShape;
  biasLightColor: string; // Hex color for halo & rim light
  biasLightIntensity: number;
  description: string;
  inspiration: string;
  panelPosition: 'below' | 'left' | 'above' | 'right'; // Placement in 3D / overlay space
  textureTheme: string; // 'peepal_sacred', 'lotus_kaveri', 'palmyra_sun', 'vilvam_monsoon', 'jasmine_malli', 'custom', or extended botanical themes
  customImageData?: string; // Optional uploaded or custom data URL
  createdBy?: string;
  wallSide?: 'left' | 'right' | 'auto'; // Hallway wall side ('left' or 'right' or 'auto')
  viewOrder?: number; // Order index when scrolling through gallery (1, 2, 3...)
  hallwayStation?: number; // Position station index along the corridor (1, 2, 3...)
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isAdmin?: boolean;
  createdAt: string;
}

export interface ArtworkReview {
  id: string;
  artworkId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1 to 5 stars
  comment: string;
  createdAt: string;
  editedAt?: string;
}

export interface GalleryState {
  scrollProgress: number; // 0.0 (entry) to 1.0 (artist section)
  activeArtworkIndex: number;
  isInGallery: boolean;
  isExited: boolean;
  viewMode: '3d' | '2d';
  audioEnabled: boolean;
  selectedArtwork: BotanicalArtwork | null;
}
