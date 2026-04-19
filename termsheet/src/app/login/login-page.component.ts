import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, from, of, Subject, switchMap, takeUntil } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent implements OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly destroy$ = new Subject<void>();

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  readonly loginForm = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  get isPasswordInvalid() {
    const control = this.loginForm.controls.password;
    return control.invalid && control.dirty;
  }
  get isUsernameInvalid() {
    const control = this.loginForm.controls.username;
    return control.invalid && control.dirty;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return void 0;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.loginForm.getRawValue();
    this.authService
      .login(username, password)
      .pipe(
        switchMap((success) =>
          success ? from(this.router.navigate(['/deals'])) : of(false),
        ),
        finalize(() => this.submitting.set(false)),
        takeUntil(this.destroy$),
      )
      .subscribe((success) => {
        if (!success) {
          this.errorMessage.set(
            'Invalid username or password. Try admin / 1234.',
          );
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
