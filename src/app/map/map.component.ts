import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';


import { DrawingMode } from '../shared/drawing-mode.type';
import { MarkerService } from '../features/marker/marker.service';
import { PolygonService } from '../features/polygon/polygon.service';
import { LineStringService } from '../features/line-string/line-string.service';
import { FeatureListService } from '../services/feature-list.service';
import { StateService } from '../services/state.service';
import { Feature } from '../shared/feature.model';
import { getHoverColor } from '../shared/feature-colors';
import { getColorForType } from '../shared/feature-colors';

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
    private featureListService: FeatureListService,
    private stateService: StateService
  ) {}

  ngOnInit(): void {
    // initialize the map on the "map" div with a given center and zoom ([center], zoom)
    this.map = L.map('map').setView([31.264, 34.812], 9);

    // Used to load and display tile layers on the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Load previously saved features from localStorage
    const loadedFeatures = this.stateService.loadFeatures(this.map);
    for (const f of loadedFeatures) {
      f.layer.addTo(this.map);
      this.featureListService.addFeature(f);
    }

    // Subscribe and auto-save on every feature list update
    this.featureListService.getFeatures().subscribe(features => {
      this.features = features;
      this.stateService.saveFeatures(features); // Save to localStorage
    });

    this.setupMapListeners();
  }

  setupMapListeners(): void {
    let clickTimeout: any;

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
      }, 250); // Using click timeout to solve double click not responding issue in polygon/line mode.
    });

    // Define click behavior for polygon/line mode
    this.map.on('dblclick', () => {
      if (this.drawingMode === 'polygon') {
        this.finishPolygon();
      } else if (this.drawingMode === 'line') {
        this.finishLine();
      }
    });

    // Handle clearing selection on user move
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
    // If already in this mode, toggle off and clean up
    if (this.drawingMode === mode) {
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

  // For highlight when clicked or hovered
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
      (feature.layer as L.Path).setStyle({ color: getHoverColor() });
    } else if ('setIcon' in feature.layer && feature.hoverIcon) {
      (feature.layer as L.Marker).setIcon(feature.hoverIcon);
    }
  }

  onLeave() {
    const feature = this.features.find(f => f.id === this.hoveredFeatureId);
    if (!feature) return;

    if ('setStyle' in feature.layer) {
      (feature.layer as L.Path).setStyle({ color: feature.originalColor });
    } else if ('setIcon' in feature.layer && feature.defaultIcon) {
      (feature.layer as L.Marker).setIcon(feature.defaultIcon);
    }

    this.hoveredFeatureId = null;
  }

  clearFeatureSelection() {
    this.selectedFeatureId = null;
  }

  // Clear all the layers from the map
  clearAllFeatures(): void {
    const confirmed = window.confirm('Are you sure you want to delete all features?');
    if (!confirmed) return;

    this.features.forEach(f => {
      this.map.removeLayer(f.layer);
    });
    this.featureListService.clearAll();
    this.selectedFeatureId = null;
    this.hoveredFeatureId = null;
  }
}
