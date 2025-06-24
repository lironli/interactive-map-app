import * as L from 'leaflet';
import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

import { Feature } from '../../shared/feature.model';
import { FeatureListService } from '../../services/feature-list.service';
import { StateService } from '../../services/state.service';
import { getColorForType } from '../../shared/feature-colors';

@Injectable({
  providedIn: 'root'
})

export class LineStringService {
  private linePoints: L.LatLng[] = [];
  private lineLayer: L.Polyline | null = null;

  constructor(
    private featureListService: FeatureListService,
    private stateService: StateService
  ) {}

  startLine(map: L.Map): void {
    this.linePoints = [];
    if (this.lineLayer) {
      map.removeLayer(this.lineLayer);
      this.lineLayer = null;
    }
    map.doubleClickZoom.disable();
  }

  addPoint(map: L.Map, latlng: L.LatLng): void {
    this.linePoints.push(latlng);
    if (this.lineLayer) {
      map.removeLayer(this.lineLayer);
    }
    this.lineLayer = L.polyline(this.linePoints, {color: getColorForType('line')}).addTo(map);
  }

  finishLine(map: L.Map): void {
    if (this.linePoints.length >= 2) {
      this.lineLayer = L.polyline(this.linePoints, {color: getColorForType('line')}).addTo(map);

      // Adding this polygon to the feature list
      const id = uuidv4(); // Unique ID for this marker
      const feature: Feature = {
        id: id,
        name: `Line ${this.featureListService.getFeatureCount() + 1}`,
        layer: this.lineLayer
      };

      this.featureListService.addFeature(feature);

      // Save immediately after adding
      this.stateService.saveFeatures(this.featureListService.snapshot());
    }

    this.linePoints = [];
    this.lineLayer = null;
    map.doubleClickZoom.enable();
  }

  cancelDrawing(map: L.Map): void {
    if (this.lineLayer) {
      map.removeLayer(this.lineLayer);
      this.lineLayer = null;
    }
    this.linePoints = [];
    map.doubleClickZoom.enable();
  }

}
