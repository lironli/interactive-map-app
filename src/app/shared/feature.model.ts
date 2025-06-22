import * as L from 'leaflet';

export interface Feature {
  id: string;
  name: string;
  layer: L.Marker | L.Polygon | L.Polyline;
}
