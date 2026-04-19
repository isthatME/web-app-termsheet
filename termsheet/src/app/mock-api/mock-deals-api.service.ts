import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { Deal } from '../deals/models/deal.model';

@Injectable({ providedIn: 'root' })
export class MockDealsApiService {
  getDeals(): Observable<Deal[]> {
    return of([
      {
        id: 1,
        dealName: 'Acme Logistics Buyout',
        purchasePrice: 1200000,
        address: '1200 Harbor Way, Oakland, CA',
        noi: 96000,
        capRate: 0.08,
      },
      {
        id: 2,
        dealName: 'Blue River Assets',
        purchasePrice: 670000,
        address: '45 Riverfront Dr, Sacramento, CA',
        noi: 43550,
        capRate: 0.065,
      },
      {
        id: 3,
        dealName: 'Orchid Retail Portfolio',
        purchasePrice: 2150000,
        address: '890 Market St, San Francisco, CA',
        noi: 150500,
        capRate: 0.07,
      },
      {
        id: 4,
        dealName: 'Vertex Manufacturing',
        purchasePrice: 890000,
        address: '200 Industrial Rd, San Jose, CA',
        noi: 66750,
        capRate: 0.075,
      },
    ]).pipe(delay(350));
  }
}
