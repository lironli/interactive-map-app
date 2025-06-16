import { Component, OnInit } from '@angular/core';

import * as L from 'leaflet';

// Fixing a potential bug with the leaflet's marker icons loader in some env.
// importing the markers images into the assets folder
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png'
});

@Component({
  selector: 'app-map',
  template: '<div id="map" style="height: 100vh;"></div>',
})

export class MapComponent implements OnInit {
  map!: L.Map;

  ngOnInit(): void {
    // initialize the map on the "map" div with a given center and zoom ([center], zoom)
    this.map = L.map('map').setView([31.264, 34.812], 9);

    // Used to load and display tile layers on the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Listen for clicks
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const marker = L.marker(e.latlng).addTo(this.map);
      marker.bindPopup(`Marker at ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`).openPopup();
    });
  }
}
