import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('restaura sesión con me', () => {
    service.checkSession().subscribe();

    const req = httpMock.expectOne('/api/v1/auth/me');
    req.flush({ id: 1, nombre: 'Ana', email: 'ana@test.dev', rol: 'usuario' });

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.user()?.email).toBe('ana@test.dev');
  });

  it('limpia sesión ante cookie expirada / 401', () => {
    service.checkSession().subscribe();

    const req = httpMock.expectOne('/api/v1/auth/me');
    req.flush({ detail: 'Invalid session' }, { status: 401, statusText: 'Unauthorized' });

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.user()).toBeNull();
  });
});
