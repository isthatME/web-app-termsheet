import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  map,
  merge,
  Observable,
  scan,
  startWith,
} from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { Deal } from './models/deal.model';
import {
  PriceFilterOperatorEnum,
  DealsService,
} from './data-access/deals.service';
import { DealsAddFormComponent } from './ui/deals-add-form/deals-add-form.component';
import { DealsFiltersComponent } from './ui/deals-filters/deals-filters.component';
import { DealsPageHeaderComponent } from './ui/deals-page-header/deals-page-header.component';
import { DealsTableComponent } from './ui/deals-table/deals-table.component';

@Component({
  selector: 'app-deals-page',
  templateUrl: './deals-page.component.html',
  styleUrl: './deals-page.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    DealsPageHeaderComponent,
    DealsAddFormComponent,
    DealsFiltersComponent,
    DealsTableComponent,
  ],
  providers: [DealsService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealsPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dealsService = inject(DealsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly addDealForm = this.formBuilder.nonNullable.group({
    dealName: ['', Validators.required],
    purchasePrice: [0, [Validators.required, Validators.min(1)]],
    address: ['', Validators.required],
    noi: [0, [Validators.required, Validators.min(1)]],
  });

  protected readonly nameFilterValue$ = new BehaviorSubject<string>('');
  protected readonly priceOperatorValue$ =
    new BehaviorSubject<PriceFilterOperatorEnum>(
      PriceFilterOperatorEnum.GreaterThan,
    );
  protected readonly priceFilterValue$ = new BehaviorSubject<number | null>(
    null,
  );
  private readonly addDealInput$ = new BehaviorSubject<Omit<
    Deal,
    'id' | 'capRate'
  > | null>(null);
  protected priceOperatorValue: PriceFilterOperatorEnum =
    PriceFilterOperatorEnum.GreaterThan;

  private readonly calculatedDeals$ = this.dealsService.getDeals().pipe(
    map(
      (initialDeals) => () =>
        initialDeals.map((deal) => ({
          ...deal,
          capRate: this.dealsService.calculateCapRate(
            deal.noi,
            deal.purchasePrice,
          ),
        })),
    ),
  );
  private readonly addedDealsInput$ = this.addDealInput$.pipe(
    map((dealInput) => (items: Deal[]) => {
      if (dealInput === null) {
        return items;
      }
      return [
        ...items,
        {
          id: items.length + 1,
          ...dealInput,
          capRate: this.dealsService.calculateCapRate(
            dealInput.noi,
            dealInput.purchasePrice,
          ),
        },
      ];
    }),
  );

  protected readonly deals$: Observable<Deal[]> = merge(
    this.calculatedDeals$,
    this.addedDealsInput$,
  ).pipe(scan((items, reducer) => reducer(items), [] as Deal[]));

  protected readonly filteredDeals$: Observable<Deal[]> = combineLatest([
    this.deals$,
    this.nameFilterValue$,
    this.priceOperatorValue$,
    this.priceFilterValue$,
  ]).pipe(
    map(([items, nameFilter, operator, priceFilterValue]) => {
      const normalizedNameFilter = nameFilter.trim().toLowerCase();

      return items
        .filter((deal) => {
          const nameMatches =
            normalizedNameFilter.length === 0 ||
            deal.dealName.toLowerCase().includes(normalizedNameFilter);

          const priceMatches =
            priceFilterValue === null ||
            (operator === 'gt'
              ? deal.purchasePrice > priceFilterValue
              : deal.purchasePrice < priceFilterValue);

          return nameMatches && priceMatches;
        })
        .map((deal) => ({
          ...deal,
          dealName: this.highlightMatch(deal.dealName, normalizedNameFilter),
        }));
    }),
  );
  highlightMatch(text: string, query: string): string {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length === 0) {
      return text;
    }

    const escapedQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matcher = new RegExp(`(${escapedQuery})`, 'ig');

    return text.replace(matcher, '<mark>$1</mark>');
  }

  protected readonly capRatePreview$ = this.addDealForm.valueChanges.pipe(
    startWith(this.addDealForm.value),
    debounceTime(250),
    map((formValue) =>
      this.dealsService.calculateCapRate(
        Number(formValue.noi ?? 0),
        Number(formValue.purchasePrice ?? 0),
      ),
    ),
  );

  protected readonly isCapRateTypical$ = this.capRatePreview$.pipe(
    map((capRate) => capRate >= 0.05 && capRate <= 0.12),
  );

  onPriceFilterChange(rawValue: string): void {
    const parsed = Number(rawValue);

    if (rawValue.trim() === '' || Number.isNaN(parsed)) {
      this.priceFilterValue$.next(null);
      return void 0;
    }

    this.priceFilterValue$.next(parsed);
  }

  addDeal(): void {
    if (this.addDealForm.valid) {
      const { dealName, purchasePrice, address, noi } =
        this.addDealForm.getRawValue();

      this.addDealInput$.next({
        dealName,
        purchasePrice,
        address,
        noi,
      });

      this.addDealForm.reset();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
