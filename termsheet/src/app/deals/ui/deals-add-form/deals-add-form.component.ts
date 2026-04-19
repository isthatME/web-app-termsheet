import { PercentPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-deals-add-form',
  templateUrl: './deals-add-form.component.html',
  styleUrl: './deals-add-form.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule, PercentPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealsAddFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() capRatePreview = 0;
  @Input() isCapRateTypical = true;

  @Output() readonly submitDeal = new EventEmitter<void>();

  isControlInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && control.dirty;
  }

  onSubmit(): void {
    this.submitDeal.emit();
  }
}
