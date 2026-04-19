import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MockAuthApiService {
  authorize(username: string, password: string): Observable<boolean> {
    return of(username.trim() === 'admin' && password === '1234').pipe(
      delay(700),
    );
  }
}
