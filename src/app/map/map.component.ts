import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

import { DrawingMode } from '../shared/drawing-mode.type';
import { MarkerService } from '../features/marker/marker.service';
import { PolygonService } from '../features/polygon/polygon.service';
import { LineStringService } from '../features/line-string/line-string.service';

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
  drawingMode: DrawingMode = 'none';

  constructor(
    private markerService: MarkerService,
    private polygonService: PolygonService,
    private lineService: LineStringService
  ) {}

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
    // Using click timeout to solve double click not responding issue in polygon mode.
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        if (this.drawingMode === 'marker') {
          this.markerService.addMarker(this.map, e.latlng);
        } else if (this.drawingMode === 'polygon') {
          this.polygonService.addPoint(this.map, e.latlng);
        } else if (this.drawingMode === 'line') {
          this.lineService.addPoint(this.map, e.latlng);
        }
      }, 250); // wait to ensure no dblclick is coming
    });

    // Listen to double click and select its behavior based on drawing mode
    this.map.on('dblclick', (e: L.LeafletMouseEvent) => {
      if (this.drawingMode === 'polygon') {
        this.finishPolygon();
      } else if (this.drawingMode === 'line') {
        this.finishLine();
      }
    });
  }

  setDrawingMode(mode: DrawingMode) {
    this.drawingMode = mode;
    if (mode === 'polygon') {
      this.polygonService.startPolygon(this.map);
    } else if (mode === 'line'){
      this.lineService.startLine(this.map);
    }
  }

  finishPolygon() {
    this.polygonService.finishPolygon(this.map);
    this.drawingMode = 'none';
  }

  finishLine() {
    this.lineService.finishLine(this.map);
    this.drawingMode = 'none';
  }
}
