import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { Feature } from '../shared/feature.model';
import { getColorForType } from '../shared/feature-colors';

@Injectable({
  providedIn: 'root'
})

export class StateService {
  private storageKey = 'map-features';

  saveFeatures(features: Feature[]) {
    const serialized = features.map(f => ({
      id: f.id,
      name: f.name,
      type: this.detectType(f.layer),
      latlngs: this.extractLatLngs(f.layer),
      originalColor: f.originalColor ?? getColorForType(this.detectType(f.layer))
    }));

    localStorage.setItem(this.storageKey, JSON.stringify(serialized));
  }

  loadFeatures(map: L.Map): Feature[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw) as {
        id: string;
        name: string;
        type: 'marker' | 'polygon' | 'line';
        latlngs: L.LatLngExpression[];
        originalColor?: string;
      }[];

      return parsed.map(f => {
        let layer: L.Marker | L.Polygon | L.Polyline<any>;

        if (f.type === 'marker') {
          const defaultIcon = L.icon({
            iconUrl: 'assets/marker-green.png',
            shadowUrl: 'assets/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });

          const hoverIcon = L.icon({
            iconUrl: 'assets/marker-red.png',
            shadowUrl: 'assets/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });

          const latlng = f.latlngs[0];
          const marker = L.marker(latlng, { icon: defaultIcon });
          marker.bindPopup(`Marker at<br>Lat: ${marker.getLatLng().lat.toFixed(5)}, ${marker.getLatLng().lng.toFixed(5)}`);
          layer = marker;

          layer.addTo(map);

          return {
            id: f.id,
            name: f.name,
            layer,
            defaultIcon,
            hoverIcon
          } as Feature;

        } else if (f.type === 'polygon') {
          layer = L.polygon(f.latlngs, { color: f.originalColor ?? 'blue' });
        } else {
          layer = L.polyline(f.latlngs, { color: f.originalColor ?? 'blue' });
        }

        layer.addTo(map);

        return {
          id: f.id,
          name: f.name,
          layer,
          originalColor: f.originalColor ?? getColorForType(f.type)
        } as Feature;
      });
    } catch (e) {
      console.error('Failed to parse saved features:', e);
      return [];
    }
  }

  private detectType(layer: L.Layer): 'marker' | 'polygon' | 'line' {
    if (layer instanceof L.Marker) return 'marker';
    if (layer instanceof L.Polygon) return 'polygon';
    return 'line';
  }

  private extractLatLngs(layer: L.Layer): L.LatLngExpression[] {
    if (layer instanceof L.Marker) {
      return [layer.getLatLng()];
    }
    if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
      return layer.getLatLngs() as L.LatLngExpression[];
    }
    return [];
  }
}
