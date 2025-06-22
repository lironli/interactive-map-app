import * as L from 'leaflet';
import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

import { Feature } from '../../shared/feature.model';
import { FeatureListService } from '../../services/feature-list.service';


@Injectable({
  providedIn: 'root',
})

export class MarkerService {

  constructor(private featureListService: FeatureListService) {}

  addMarker(map: L.Map, latlng: L.LatLng): void {
    const marker = L.marker(latlng).addTo(map);
    marker.bindPopup(`Marker at<br>Lat: ${latlng.lat.toFixed(5)}, Lng: ${latlng.lng.toFixed(5)}`).openPopup();

    // Adding this marker to the feature list
    const id = uuidv4(); // Unique ID for this marker
    const feature: Feature = {
      id,
      name: `Marker ${latlng.lat.toFixed(3)}, ${latlng.lng.toFixed(3)}`,
      layer: marker
    };
    this.featureListService.addFeature(feature);

  }

}
