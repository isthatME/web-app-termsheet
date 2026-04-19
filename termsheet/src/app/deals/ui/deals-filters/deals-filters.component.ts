import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { PriceFilterOperatorEnum } from '../../data-access/deals.service';

@Component({
  selector: 'app-deals-filters',
  templateUrl: './deals-filters.component.html',
  styleUrl: './deals-filters.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealsFiltersComponent {
  @Input() nameFilter = '';
  @Input() priceOperator: PriceFilterOperatorEnum =
    PriceFilterOperatorEnum.GreaterThan;
  @Input() priceFilter: number | null = null;

  @Output() readonly nameFilterChange = new EventEmitter<string>();
  @Output() readonly priceOperatorChange =
    new EventEmitter<PriceFilterOperatorEnum>();
  @Output() readonly priceFilterChange = new EventEmitter<number | null>();

  onNameInput(event: Event): void {
    this.nameFilterChange.emit((event.target as HTMLInputElement).value);
  }

  onOperatorChange(event: Event): void {
    this.priceOperatorChange.emit(
      (event.target as HTMLSelectElement).value as PriceFilterOperatorEnum,
    );
  }

  onPriceInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value.trim() === '') {
      this.priceFilterChange.emit(null);
      return void 0;
    }
    this.priceFilterChange.emit(Number(value));
  }
}
