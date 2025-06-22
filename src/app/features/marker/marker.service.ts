import * as L from 'leaflet';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class MarkerService {
  addMarker(map: L.Map, latlng: L.LatLng): void {
    const marker = L.marker(latlng).addTo(map);
    marker.bindPopup(`Marker at<br>Lat: ${latlng.lat.toFixed(5)}, Lng: ${latlng.lng.toFixed(5)}`).openPopup();
  }
}
