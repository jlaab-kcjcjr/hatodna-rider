export const BRAND = {
  name: 'HatodNa!',
  tagline: 'Rider partner app. Deliver around Albay and earn on your own time.',
};

// Inspired by Bicol: sili, abaca fiber, pili leaves, Mayon's volcanic soil.
export const COLORS = {
  sili: '#B8202B',
  siliDeep: '#8E1620',
  siliSoft: '#F7DEDB',
  abaca: '#D8A23A',
  abacaSoft: '#F6EAD0',
  pili: '#2E5E3E',
  piliSoft: '#DDEBDF',
  ink: '#2A1A16',      // volcanic-soil brown, used instead of black
  inkSoft: '#7B6B63',
  line: '#ECE3D8',
  surface: '#FFFFFF',
  page: '#FDFBF8',
};

export const FONTS = {
  display: 'YoungSerif_400Regular',
  body: 'Figtree_400Regular',
  semi: 'Figtree_600SemiBold',
  heavy: 'Figtree_800ExtraBold',
};

export const RADIUS = { sm: 10, md: 16, lg: 28 };

// Each store category gets its own colors and icon for the store art tiles.
export const CATEGORY_ART = {
  Food: { bg: COLORS.sili, fg: COLORS.abacaSoft, icon: 'restaurant-outline' },
  Grocery: { bg: COLORS.pili, fg: COLORS.abacaSoft, icon: 'basket-outline' },
  Pharmacy: { bg: COLORS.ink, fg: COLORS.abaca, icon: 'medkit-outline' },
  Pabili: { bg: COLORS.abaca, fg: COLORS.ink, icon: 'bicycle-outline' },
};