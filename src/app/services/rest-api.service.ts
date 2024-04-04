import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { StorageData } from '../utilities/storage';
import { UserData } from '../interfaces/user.interface';
import { ROUTES_API } from '../utilities/constants';

@Injectable({
  providedIn: 'root'
})
export class RestApiService {
  constructor( private http: HttpClient ) {}

  // Método POST con token en cabecera
  public postAuth(body: {username: string, password: string}): Observable<any> {
    return this.http.post(ROUTES_API.auth, body);
  }

  public refreshToken(): Observable<string> {
    return this.http.post<any>(ROUTES_API.refreshToken(), {}, {headers: this.getHeadersRefresh()}).pipe(
      map(response => {
        StorageData.set(response.data)
        return StorageData.get().token
      })
    );
  }

  // Método GET con token en cabecera
  public get(url: string, params: any = {}): Observable<any> {
    return this.http.get(url, {params,  headers: this.getHeaders()});
  }

  // Método POST con token en cabecera
  public post(url: string, body: any): Observable<any> {
    return this.http.post(url, body, {headers: this.getHeaders()});
  }

  // Método PUT con token en cabecera
  public put(url: string, body: any): Observable<any> {
    return this.http.put(url, body, {headers: this.getHeaders()});
  }

  // Método DELETE con token en cabecera
  public delete(url: string): Observable<any> {
    return this.http.delete(url, {headers: this.getHeaders()});
  }

  getHeaders() {
    const user: UserData = StorageData.get()
    return new HttpHeaders().set('Authorization', `Bearer ${user.token}`)
  }

  getHeadersRefresh() {
    const user: UserData = StorageData.get()
    return new HttpHeaders().set('Authorization', `Bearer ${user.refreshToken}`)
  }
}
