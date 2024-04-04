import { Component, ErrorHandler, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ROUTES_API, SYSTEM_NAME } from '../../utilities/constants';
import { RestApiService } from 'src/app/services/rest-api.service';
import { Limit, detectChange, passwordValidator, textValidator, usernameValidator } from 'src/app/utilities/functions';
import { StorageData } from 'src/app/utilities/storage';
import { UserData } from 'src/app/interfaces/user.interface';
import { catchError, throwError } from 'rxjs';
import { errorHandlers } from 'src/app/utilities/errorHandlers';
/* import { StorageService } from 'src/app/services/storage.service'; */

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
  sysName: string = SYSTEM_NAME
  errors: any = {
    username:'',
    password:'',
    request: ''
  }

  formGroup: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  })

  constructor(
    private restApi: RestApiService,
    private router: Router
  ) {

  }
  // Function para detectar errores en tiempo real
  onChange: Function = ($event: any, name: any, limit: Limit = {}) => {detectChange(this.formGroup, this.errors)($event, name, limit)}

  ngOnInit(): void {
    this.resetData()
  }

  resetData() {
    this.formGroup.reset()
    this.errors.username = ''
    this.errors.password = ''
  }

  sendData() {
    if(this.formGroup.valid) {
      this.restApi.postAuth(this.formGroup.value)
      .pipe(catchError((error) => errorHandlers(error, this.errors)))
        .subscribe((result) => {
          console.log(result)
        if(result.data) {
          StorageData.set(result.data)
          this.router.navigate(['main'])
        }
        if(result.error) {
          this.errors.request = result.msg
        }
      })
    }
  }

}
