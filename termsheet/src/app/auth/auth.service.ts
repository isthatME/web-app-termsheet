import { computed, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { MockAuthApiService } from '../mock-api/mock-auth-api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _isAuthenticated = signal(false);
  readonly isAuthenticated = computed(() => this._isAuthenticated());

  constructor(private readonly mockAuthApi: MockAuthApiService) {}

  login(username: string, password: string): Observable<boolean> {
    return this.mockAuthApi
      .authorize(username, password)
      .pipe(tap((success) => this._isAuthenticated.set(success)));
  }

  logout(): void {
    this._isAuthenticated.set(false);
  }
}
