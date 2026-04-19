import { AsyncPipe, CurrencyPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  map,
  merge,
  Observable,
  scan,
  startWith,
} from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Deal } from './models/deal.model';
import {
  PriceFilterOperatorEnum,
  DealsService,
} from './data-access/deals.service';

@Component({
  selector: 'app-deals-page',
  templateUrl: './deals-page.component.html',
  styleUrl: './deals-page.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, AsyncPipe, PercentPipe],
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
    noi: [0, [Validators.required, Validators.min(0)]],
  });

  protected readonly nameFilterValue$ = new BehaviorSubject<string>('');
  protected readonly priceOperatorValue$ =
    new BehaviorSubject<PriceFilterOperatorEnum>(
      PriceFilterOperatorEnum.GreaterThan,
    );
  private readonly priceFilterValue$ = new BehaviorSubject<number | null>(null);
  private readonly addDealInput$ = new BehaviorSubject<Omit<
    Deal,
    'id' | 'capRate'
  > | null>(null);

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

  readonly deals$: Observable<Deal[]> = merge(
    this.calculatedDeals$,
    this.addedDealsInput$,
  ).pipe(scan((items, reducer) => reducer(items), [] as Deal[]));

  readonly filteredDeals$: Observable<Deal[]> = combineLatest([
    this.deals$,
    this.nameFilterValue$,
    this.priceOperatorValue$,
    this.priceFilterValue$,
  ]).pipe(
    map(([items, nameFilter, operator, priceFilterValue]) => {
      const normalizedNameFilter = nameFilter.trim().toLowerCase();

      return items.filter((deal) => {
        const nameMatches =
          normalizedNameFilter.length === 0 ||
          deal.dealName.toLowerCase().includes(normalizedNameFilter);

        const priceMatches =
          priceFilterValue === null ||
          (operator === 'gt'
            ? deal.purchasePrice > priceFilterValue
            : deal.purchasePrice < priceFilterValue);

        return nameMatches && priceMatches;
      });
    }),
  );

  readonly capRatePreview$ = this.addDealForm.valueChanges.pipe(
    startWith(this.addDealForm.value),
    map((formValue) =>
      this.dealsService.calculateCapRate(
        Number(formValue.noi ?? 0),
        Number(formValue.purchasePrice ?? 0),
      ),
    ),
  );

  readonly isCapRateTypical$ = this.capRatePreview$.pipe(
    map((capRate) => capRate >= 0.05 && capRate <= 0.12),
  );

  onPriceValueChange(rawValue: string): void {
    const parsed = Number(rawValue);

    if (rawValue.trim() === '' || Number.isNaN(parsed)) {
      this.priceFilterValue$.next(null);
      return void 0;
    }

    this.priceFilterValue$.next(parsed);
  }
  isControlInvalid(
    controlName: keyof typeof this.addDealForm.controls,
  ): boolean {
    const control = this.addDealForm.controls[controlName];
    return control.invalid && control.dirty;
  }
  addDeal(): void {
    if (this.addDealForm.invalid) {
      return void 0;
    }
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
