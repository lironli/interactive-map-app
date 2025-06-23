import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapComponent } from './map.component';
import * as L from 'leaflet';
import { Feature } from '../shared/feature.model';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapComponent]
    });
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedFeatureId and call map.setView on selectFeature', () => {
    const latlng = L.latLng(10, 20);
    const mockMarker = L.marker(latlng);
    spyOn(mockMarker, 'getLatLng').and.returnValue(latlng);
    const mockMap = jasmine.createSpyObj('L.Map', ['setView']);
    component['map'] = mockMap;

    const feature = {
      id: 'xyz',
      name: 'Marker',
      layer: mockMarker
    } as Feature;

    component.selectFeature(feature);

    expect(component.selectedFeatureId).toBe('xyz');
    expect(mockMap.setView).toHaveBeenCalledWith(latlng, 14);
  });

});
