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
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})

export class MapComponent implements OnInit {
  map!: L.Map;

  drawingMode: 'none' | 'marker' | 'polygon' = 'none';

  // polygon drawing state params
  polygonPoints: L.LatLng[] = [];
  polygonLayer: L.Polygon | null = null;
  drawingPolygon = false;
  private polygonDblClickHandler: any;


  ngOnInit(): void {
    // initialize the map on the "map" div with a given center and zoom ([center], zoom)
    this.map = L.map('map').setView([31.264, 34.812], 9);

    // Used to load and display tile layers on the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    let clickTimeout: any;
    // Listen for clicks and reacting to the current drawing mode
    // e.latlng refers to the latitude and longitude coordinates obtained from a map click event
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        if (this.drawingMode === 'marker') {
          this.addMarker(e.latlng);
        } else if (this.drawingMode === 'polygon') {
          this.addPolygonPoint(e.latlng);
        }
      }, 250); // wait to ensure no dblclick is coming
    });

    // Listen to double click and sekect its behavior based on drawing mode
    this.map.on('dblclick', (e: L.LeafletMouseEvent) => {
      if (this.drawingMode === 'polygon') {
        this.finishPolygon();
      }
    });
  }

  // Set drawing mode
  setDrawingMode(mode: 'marker' | 'polygon' | 'none') {
    this.drawingMode = mode;
    this.polygonPoints = [];

    if (this.polygonLayer) {
      this.map.removeLayer(this.polygonLayer);
      this.polygonLayer = null;
    }
  }

  addMarker(latlng: L.LatLng) {
    const marker = L.marker(latlng).addTo(this.map);
      marker.bindPopup(`Marker at<br>Lat: ${latlng.lat.toFixed(5)}, Lng: ${latlng.lng.toFixed(5)}`).openPopup();
  }

  startPolygon() {
    this.setDrawingMode('polygon');
    this.polygonPoints = [];

    // This line temporarily disable the default behavior of zooming in on double click.
    // When drawing polygons, double click will close the polygon instead of zooming in map.
    this.map.doubleClickZoom.disable();
  }

  addPolygonPoint(latlng: L.LatLng) {
    this.polygonPoints.push(latlng);

    if (this.polygonLayer) {
      this.map.removeLayer(this.polygonLayer);
    }

    this.polygonLayer = L.polygon(this.polygonPoints, { color: 'blue' }).addTo(this.map);
  }

  finishPolygon() {
    if (this.polygonPoints.length >= 3) {
      this.polygonLayer = L.polygon(this.polygonPoints, { color: 'blue' }).addTo(this.map);
    }

    this.setDrawingMode('none');
    this.polygonPoints = [];
    this.map.doubleClickZoom.enable();
  }

}

