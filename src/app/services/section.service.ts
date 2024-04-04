import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CHANGES_TYPE, REGISTER_FORM_TYPES } from '../utilities/paginator';
import { UserData } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class SectiondService {
  // Observable para los cambios entre las secciones
  private sectionName: Subject<String> = new Subject<String>();
  public sectionName$: Observable<any> = this.sectionName.asObservable();
  setName(newValue: any): void {
    this.sectionName.next(newValue);
  }

  // Servicio para cuando el usuario
  private userData: Subject<UserData> = new Subject<UserData>
  public userData$: Observable<any> = this.userData.asObservable();

  setUserData(newData: UserData) {
    this.userData.next(newData);
  }

}
