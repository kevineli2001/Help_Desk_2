import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ACCESS_ROLES } from 'src/app/guards/users.guard';
import { ReloadService } from 'src/app/services/reload.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { SectiondService } from 'src/app/services/section.service';
import { ROUTES_API } from 'src/app/utilities/constants';
import { Limit, clearErrors, detectChange, passwordValidator, textValidator, usernameValidator, validateFields } from 'src/app/utilities/functions';
import { CHANGES_TYPE } from 'src/app/utilities/paginator';
import { StorageData } from 'src/app/utilities/storage';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit{
  passwordRequired!: boolean
  selectedId!: number
  statuses: any = []
  isAdmin: boolean = false
  pathApi: string = ROUTES_API.users
  formGroup: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, textValidator()]),
    lastname: new FormControl('', [Validators.required, textValidator()]),
    username: new FormControl('', [Validators.required, usernameValidator()]),
    password: new FormControl('', [Validators.required, passwordValidator()]),
    statusId: new FormControl('', [Validators.required]),
  })

  errors: any = {
    name: '',
    lastname: '',
    username: '',
    password: '',
    statusId: '',
    request: ''
  }
  constructor(
    private restApi: RestApiService,
    private reloadSrv: ReloadService,
    private sectionSrv: SectiondService
  ) {}

  onInput: Function = ($event: any, name: string, limit: Limit={}) => {detectChange(this.formGroup, this.errors)($event, name, limit)}

  ngOnInit() {
    this.getStatuses()
    this.getUserData()
  }

  checkPassword($event:any) {
    this.passwordRequired = $event.target.checked
    if(!this.passwordRequired) {
      this.formGroup.get('password')?.reset()
      this.errors.password = ''
    }
  }

  getStatuses() {
    this.restApi.get(ROUTES_API.statuses).subscribe((response: any) => {
      if(response.data) {
        if(Array.isArray(response.data)) {
          this.statuses = response.data
        }
      }
    })
  }

  getUserData() {
    this.restApi.get(this.pathApi+'find').subscribe((response: any) => {
      if(response.data) {
        // Validamos que tipo de usuario es
        this.isAdmin = ACCESS_ROLES[0].id === response.data.id
        // Quitamos el rol porque no se actualizará
        delete response.data.roleId
        // Guardamos el id del usuario
        this.selectedId = response.data.id
        // Quitamos el id
        delete response.data.id
        // Añadimos el campo contraseña
        response.data.password = ''
        // Cargamos el formulario con los datos obtenidos
        this.formGroup.setValue(response.data)
        // Cargamos los datos del usuario logueado en nuestro menu flotante
        this.reloadUserData({name: response.data.name, lastname: response.data.lastname})
      }
    })
  }

  updateUser() {
    Swal.fire({
      title: '¡Atención!',
      text: '¿Deseas guardar los cambios?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((action: any) => {
      // Validamos todo incluida la contraseña
      let validation = validateFields(this.formGroup, this.errors)
      let dataToSend = this.formGroup.value
      if(!this.passwordRequired) {
        // Si la contraseña no es requerida estonces la omitimos en la validación
        validation = validateFields(this.formGroup, this.errors, ['password'])
        // La eliminamos de la data que se enviará
        delete dataToSend.password
      }

      if(action.isConfirmed && validation.valid) {
          this.restApi.put(this.pathApi + this.selectedId, dataToSend).subscribe((response: any) => {
            if(response.error) {
              Swal.fire({
                title: 'Error',
                text: response.msg,
                icon: 'error',
                confirmButtonText: 'Aceptar',
              })
            }

            if(response.done) {
              Swal.fire({
                title: 'Ok',
                text: response.msg,
                icon: 'success',
                confirmButtonText: 'Aceptar',
              })
              clearErrors(this.errors)
              this.getUserData()
              this.passwordRequired = false
              // Indicamos a la tabla que debe recargarse porque hubo cambios
              this.reloadSrv.addChanges({changes: true, type: CHANGES_TYPE.ADD})
          }
        })
      }
    })
  }

  reloadUserData(data: {name: string, lastname: string}) {
    let userData = { ...StorageData.get(), ...data}
    this.sectionSrv.setUserData(userData)
  }
}

