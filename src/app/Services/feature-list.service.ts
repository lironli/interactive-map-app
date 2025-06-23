import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import * as L from 'leaflet';
import { Feature } from '../shared/feature.model';


@Injectable({
  providedIn: 'root'
})

export class FeatureListService {
  private featuresSubject = new BehaviorSubject<Feature[]>([]);
  private features: Feature[] = [];

  addFeature(feature: Feature): void {
    this.features.push(feature);
    this.featuresSubject.next([...this.features]);
  }

  getFeatures(): Observable<Feature[]> {
    return this.featuresSubject.asObservable();
  }

  getFeatureCount(): number {
    return this.features.length;
  }

  getFeatureById(id: string): Feature | undefined {
    return this.features.find(f => f.id === id);
  }
}
