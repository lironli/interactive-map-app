import * as L from 'leaflet';
import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

import { Feature } from '../../shared/feature.model';
import { FeatureListService } from '../../services/feature-list.service';


@Injectable({
  providedIn: 'root',
})

export class PolygonService {
  private points: L.LatLng[] = [];
  private polygonLayer: L.Polygon | null = null;

  constructor(private featureListService: FeatureListService) {}

  startPolygon(map: L.Map): void{
    this.points = [];
    if (this.polygonLayer) {
      map.removeLayer(this.polygonLayer);
      this.polygonLayer = null;
    }
    map.doubleClickZoom.disable();
  }

  addPoint(map: L.Map, latlng: L.LatLng): void{
    this.points.push(latlng);
    if (this.polygonLayer) {
      map.removeLayer(this.polygonLayer);
    }
    this.polygonLayer = L.polygon(this.points, { color: 'blue' }).addTo(map);
  }

  finishPolygon(map: L.Map): void{
    if (this.points.length >= 3) {
      this.polygonLayer = L.polygon(this.points, { color: 'blue' }).addTo(map);

      // Adding this polygon to the feature list
      const id = uuidv4(); // Unique ID for this marker
      const feature: Feature = {
        id: `polygon-${Date.now()}`,
        name: `Polygon ${this.featureListService.getFeatureCount() + 1}`,
        layer: this.polygonLayer
      };

      this.featureListService.addFeature(feature);

    }
    this.points = [];
    this.polygonLayer = null;
    map.doubleClickZoom.enable();
  }
}
