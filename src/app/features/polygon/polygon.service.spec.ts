import { TestBed } from '@angular/core/testing';
import * as L from 'leaflet';
import { PolygonService } from './polygon.service';
import { FeatureListService } from '../../services/feature-list.service';
import { Feature } from '../../shared/feature.model';

describe('PolygonService', () => {
  let service: PolygonService;
  let featureListService: FeatureListService;
  let map: L.Map;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PolygonService, FeatureListService]
    });

    service = TestBed.inject(PolygonService);
    featureListService = TestBed.inject(FeatureListService);

    const div = document.createElement('div');
    document.body.appendChild(div);
    map = L.map(div).setView([0, 0], 1);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  });

  it('should start a new polygon drawing session', () => {
    service.startPolygon(map);
    // Confirms no crash and double-click is disabled.
    expect(map.doubleClickZoom.enabled()).toBeFalse();
  });

  it('should add points to the polygon layer', () => {
    service.startPolygon(map);
    const point1 = L.latLng(0, 0);
    const point2 = L.latLng(0, 1);
    const point3 = L.latLng(1, 1);

    service.addPoint(map, point1);
    service.addPoint(map, point2);
    service.addPoint(map, point3);

    // Confirm point using layer
    const layers = Object.values((map as any)._layers);
    const hasPolygon = layers.some((l: any) => l instanceof L.Polygon);
    expect(hasPolygon).toBeTrue();
  });

  it('should finish polygon and register it to feature list', (done) => {
    service.startPolygon(map);
    const points = [
      L.latLng(0, 0),
      L.latLng(0, 1),
      L.latLng(1, 1)
    ];

    points.forEach(p => service.addPoint(map, p));
    service.finishPolygon(map);

    featureListService.getFeatures().subscribe((features: Feature[]) => {
      const polygon = features.find(f => f.name.startsWith('Polygon'));
      expect(polygon).toBeTruthy();
      expect(polygon?.layer).toBeInstanceOf(L.Polygon);
      done();
    });
  });
});
