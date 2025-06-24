type FeatureType = 'marker' | 'polygon' | 'line';

// Color map for feature types
export const FeatureColors: Record<FeatureType, string> = {
  marker: '',        // Markers use icons instead of colors
  polygon: 'blue',
  line: 'purple'
};

// Helper function for color lookup
export function getColorForType(type: 'marker' | 'polygon' | 'line'): string {
  return FeatureColors[type as FeatureType] ?? getDefaultColor;
}

// Helper function for hoverColor for better maintenance
export function getHoverColor(){
  return 'red';
}

// Fallback color for unknown (future) types
export function getDefaultColor(){
  return 'yellow';
}
