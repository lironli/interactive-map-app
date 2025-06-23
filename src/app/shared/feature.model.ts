import * as L from 'leaflet';

export interface Feature {
  id: string;
  name: string;
  layer: L.Marker | L.Polygon | L.Polyline;
  originalColor?: string;
  defaultIcon?: L.Icon;
  hoverIcon?: L.Icon;
}
