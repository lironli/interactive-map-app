import * as L from 'leaflet';
import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

import { Feature } from '../../shared/feature.model';
import { FeatureListService } from '../../services/feature-list.service';
import { StateService } from '../../services/state.service';


@Injectable({
  providedIn: 'root',
})

export class MarkerService {

  private defaultIcon: L.Icon;
  private hoverIcon: L.Icon;

  constructor(
    private featureListService: FeatureListService,
    private stateService: StateService
  ) {
    // Initialize reusable icons
    this.defaultIcon = L.icon({
      iconUrl: 'assets/marker-green.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.hoverIcon = L.icon({
      iconUrl: 'assets/marker-red.png', // TODO try: https://leafletjs.com/examples/custom-icons/
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  addMarker(map: L.Map, latlng: L.LatLng): void {

    const marker = L.marker(latlng, {icon: this.defaultIcon}).addTo(map);
    marker.bindPopup(`Marker at<br>Lat: ${latlng.lat.toFixed(5)}, Lng: ${latlng.lng.toFixed(5)}`).openPopup();

    // Adding this marker to the feature list
    const id = uuidv4(); // Unique ID for this marker
    const feature: Feature = {
      id: id,
      name: `Marker ${latlng.lat.toFixed(3)}, ${latlng.lng.toFixed(3)}`,
      layer: marker,
      defaultIcon: this.defaultIcon,
      hoverIcon: this.hoverIcon
    };

    this.featureListService.addFeature(feature);

    // Save updated state
    this.stateService.saveFeatures(this.featureListService.snapshot());
  }

}
