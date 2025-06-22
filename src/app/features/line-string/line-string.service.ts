import * as L from 'leaflet';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class LineStringService {
  private linePoints: L.LatLng[] = [];
  private lineLayer: L.Polyline | null = null;

  constructor() {}

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
    this.lineLayer = L.polyline(this.linePoints, { color: 'red' }).addTo(map);
  }

  finishLine(map: L.Map): void {
    if (this.linePoints.length >= 2) {
      this.lineLayer = L.polyline(this.linePoints, { color: 'red' }).addTo(map);
    }

    this.linePoints = [];
    this.lineLayer = null;
    map.doubleClickZoom.enable();
  }
}
