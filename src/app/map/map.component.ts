import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

import { DrawingMode } from '../shared/drawing-mode.type';
import { MarkerService } from '../features/marker/marker.service';
import { PolygonService } from '../features/polygon/polygon.service';
import { LineStringService } from '../features/line-string/line-string.service';
import { FeatureListService } from '../services/feature-list.service';
import { Feature } from '../shared/feature.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  map!: L.Map;
  drawingMode: DrawingMode = 'none';
  features: Feature[] = [];
  hoveredFeatureId: string | null = null;
  selectedFeatureId: string | null = null;

  // will be used to avoid clearing feature selection too early.
  private userInteracted = false;
  private suppressNextClear = false;

  constructor(
    private markerService: MarkerService,
    private polygonService: PolygonService,
    private lineService: LineStringService,
    private featureListService: FeatureListService
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

    // Initialize features property.
    this.featureListService.getFeatures().subscribe(features => {
      this.features = features;
    });

    // Listeners for map move/zoom in order to clear feature selection from the list.
    this.map.on('movestart', () => {
      if (!this.suppressNextClear) {
        this.userInteracted = true;
      }
    });

    this.map.on('moveend', () => {
      if (this.userInteracted) {
        this.clearFeatureSelection();
        this.userInteracted = false;
      }
    });

  }

  setDrawingMode(mode: DrawingMode) {
    if (this.drawingMode === mode) {
      // If already in this mode, toggle off and clean up
      if (mode === 'polygon') {
        this.polygonService.cancelDrawing(this.map);
      } else if (mode === 'line') {
        this.lineService.cancelDrawing(this.map);
      }

      this.drawingMode = 'none';
      return;
    }

    // Switch to new mode
    this.drawingMode = mode;
    if (mode === 'polygon') {
      this.polygonService.startPolygon(this.map);
    } else if (mode === 'line') {
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

  zoomToFeature(feature: Feature): void {
    const layer = feature.layer;
    if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
      const bounds = layer.getBounds();
      this.map.fitBounds(bounds);
    } else if (layer instanceof L.Marker) {
      const latlng = layer.getLatLng();
      this.map.setView(latlng, 14);
    }
  }

  // For highlight when clicked or hovered ---------------------
  selectFeature(feature: Feature) {
    this.selectedFeatureId = feature.id;

    this.suppressNextClear = true;

    const bounds = (feature.layer as any).getBounds?.();
    if (bounds) {
      this.map.fitBounds(bounds);
    } else if ((feature.layer as any).getLatLng) {
      this.map.setView((feature.layer as any).getLatLng(), 14);
    }

    this.suppressNextClear = false;

  }

  onHover(featureId: string) {

    const feature = this.features.find(f => f.id === featureId);
    if (!feature) return;

    this.hoveredFeatureId = featureId;

    if ('setStyle' in feature.layer) {
      (feature.layer as L.Path).setStyle({ color: 'red' });
    } else if ('setIcon' in feature.layer && feature.hoverIcon) {
      (feature.layer as L.Marker).setIcon(feature.hoverIcon);
    }

  }

  onLeave() {
    const feature = this.features.find(f => f.id === this.hoveredFeatureId);
    if (!feature) return;

    if ('setStyle' in feature.layer) {
      (feature.layer as L.Path).setStyle({ color: feature.originalColor});
    } else if ('setIcon' in feature.layer && feature.defaultIcon) {
      (feature.layer as L.Marker).setIcon(feature.defaultIcon);
    }

    this.hoveredFeatureId = null;
  }

  clearFeatureSelection() {
    this.selectedFeatureId = null;
  }


}
