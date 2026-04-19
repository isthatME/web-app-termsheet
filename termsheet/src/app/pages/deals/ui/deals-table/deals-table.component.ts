import { CurrencyPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Deal } from '../../models/deal.model';

@Component({
  selector: 'app-deals-table',
  templateUrl: './deals-table.component.html',
  styleUrl: './deals-table.component.scss',
  standalone: true,
  imports: [CurrencyPipe, PercentPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealsTableComponent {
  @Input() deals: Deal[] | null = null;
}
