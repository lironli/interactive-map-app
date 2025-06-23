import { TestBed } from '@angular/core/testing';
import { FeatureListService } from './feature-list.service';
import { Feature } from '../shared/feature.model';
import * as L from 'leaflet';

describe('FeatureListService', () => {
  let service: FeatureListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatureListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a feature to the list', () => {
    const dummyFeature = { id: '1', name: 'Test', layer: {} as any };
    service.addFeature(dummyFeature);
    service.getFeatures().subscribe(features => {
      expect(features.length).toBe(1);
      expect(features[0]).toEqual(dummyFeature);
    });
  });

  it('should return the correct feature by ID', () => {
    const dummyFeature = { id: 'abc', name: 'Polygon', layer: {} as any };
    service.addFeature(dummyFeature);
    const result = service.getFeatureById('abc');
    expect(result).toEqual(dummyFeature);
  });

});
