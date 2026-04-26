import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  it('permite rutas privadas con sesión', (done) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            ensureAuthenticated: () => of(true)
          }
        }
      ]
    });

    TestBed.runInInjectionContext(() => {
      const result$ = authGuard({} as any, {} as any);
      (result$ as any).subscribe((result: boolean | UrlTree) => {
        expect(result).toBeTrue();
        done();
      });
    });
  });

  it('redirige a /login sin sesión', (done) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            ensureAuthenticated: () => of(false)
          }
        }
      ]
    });

    const router = TestBed.inject(Router);

    TestBed.runInInjectionContext(() => {
      const result$ = authGuard({} as any, {} as any);
      (result$ as any).subscribe((result: boolean | UrlTree) => {
        expect(result instanceof UrlTree).toBeTrue();
        expect(router.serializeUrl(result as UrlTree)).toBe('/login');
        done();
      });
    });
  });
});
