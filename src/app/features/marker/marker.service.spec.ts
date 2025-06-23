import { TestBed } from '@angular/core/testing';
import * as L from 'leaflet';
import { MarkerService } from './marker.service';
import { FeatureListService } from '../../services/feature-list.service';
import { Feature } from '../../shared/feature.model';

describe('MarkerService', () => {
  let service: MarkerService;
  let featureListService: FeatureListService;
  let map: L.Map;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MarkerService, FeatureListService]
    });

    service = TestBed.inject(MarkerService);
    featureListService = TestBed.inject(FeatureListService);

    // Create a mock map container
    const div = document.createElement('div');
    document.body.appendChild(div);
    map = L.map(div).setView([0, 0], 1);

    // Add a tile layer (required for full map init)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  });

  it('should add a marker to the map and feature list', (done) => {
    const latlng = L.latLng(10, 20);
    service.addMarker(map, latlng);

    featureListService.getFeatures().subscribe((features: Feature[]) => {
      expect(features.length).toBe(1);
      const marker = features[0];

      expect(marker.name).toContain('Marker');
      expect(marker.layer).toBeInstanceOf(L.Marker);

      const markerLatLng = (marker.layer as L.Marker).getLatLng();
      expect(markerLatLng.lat).toBeCloseTo(10);
      expect(markerLatLng.lng).toBeCloseTo(20);

      done();
    });
  });
});
