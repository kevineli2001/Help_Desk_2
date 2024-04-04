import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { ROUTES_API } from '../utilities/constants';
import { RestApiService } from '../services/rest-api.service';
import { Router } from '@angular/router';
import { StorageData } from '../utilities/storage';

@Injectable()
export class BadRequestInterceptor implements HttpInterceptor {

  constructor(
    private restApi: RestApiService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !request.url.includes(ROUTES_API.refreshToken())) {
          return this.handle401Error(request, next);
        }

        if(error.status === 400) {
          return throwError(() => error);
        }

        return throwError(() => {
          StorageData.remove()
          this.router.navigate(['login'])
          return new Error('Su sesión ha expirado o no es valida')
        });
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.restApi.refreshToken().pipe(
      switchMap((token: string) => {
        // Reintentamos hacer la petición
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next.handle(request).pipe(
          catchError((error: HttpErrorResponse) => {
            return throwError(() => error)
          })
        )
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}
