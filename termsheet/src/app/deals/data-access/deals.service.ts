import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Deal } from '../models/deal.model';
import { MockDealsApiService } from '../../mock-api/mock-deals-api.service';

export enum PriceFilterOperatorEnum {
  GreaterThan = 'gt',
  LessThan = 'lt',
}

@Injectable()
export class DealsService {
  private readonly mockDealsApi = inject(MockDealsApiService);

  getDeals(): Observable<Deal[]> {
    return this.mockDealsApi.getDeals();
  }
  calculateCapRate(noi: number, purchasePrice: number): number {
    if (purchasePrice <= 0) {
      return 0;
    }
    return noi / purchasePrice;
  }
}
