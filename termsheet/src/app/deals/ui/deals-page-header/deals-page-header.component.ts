import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-deals-page-header',
  templateUrl: './deals-page-header.component.html',
  styleUrl: './deals-page-header.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealsPageHeaderComponent {
  @Input() title = 'Deals';
  @Output() readonly logoutClicked = new EventEmitter<void>();

  onLogout(): void {
    this.logoutClicked.emit();
  }
}
