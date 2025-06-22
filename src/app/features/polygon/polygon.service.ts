import * as L from 'leaflet';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class PolygonService {
  private points: L.LatLng[] = [];
  private polygonLayer: L.Polygon | null = null;

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
    }
    this.points = [];
    this.polygonLayer = null;
    map.doubleClickZoom.enable();
  }
}
