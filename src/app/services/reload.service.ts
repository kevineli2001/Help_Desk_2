import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CHANGES_TYPE, REGISTER_FORM_TYPES } from '../utilities/paginator';

@Injectable({
  providedIn: 'root'
})
export class ReloadService {

  // Propiedad para manejar cambios en la tabla común
  private hadChanged: Subject<any> = new Subject<any>();
  public hadChanged$: Observable<any> = this.hadChanged.asObservable();

  // Propiedad para manejar si se guardan o no los datos del nuevo registro
  private dataSaved: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  public dataSaved$: Observable<any> = this.dataSaved.asObservable();

  // Propiedad para detectar que tipos de action hará el formulario
  private formActions: Subject<any> = new Subject<any>();
  public formActions$: Observable<any> = this.formActions.asObservable();
  constructor() { }

  addChanges(newValue: any): void {
    this.hadChanged.next(newValue);
  }

  wasSaved(newValue: any): void {
    this.dataSaved.next(newValue);
  }

  setFormAction(newValue: any): void {
    this.formActions.next(newValue);
  }
}
