import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReloadService } from 'src/app/services/reload.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { FORM_ACTIONS, ROUTES_API } from 'src/app/utilities/constants';
import { Limit, clearErrors, detectChange, passwordValidator, textValidator, usernameValidator, validateFields } from 'src/app/utilities/functions';
import { CHANGES_TYPE } from 'src/app/utilities/paginator';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit{
  @ViewChild('checkbox') checkbox!: ElementRef<HTMLInputElement>
  isVisible: boolean = false
  roleId: number = 2
  statusId: number = 1
  selectedId!: number
  formAction :string = FORM_ACTIONS.ADD
  passwordRequired!: boolean
  statuses: any = []
  btns: any = {
    add: FORM_ACTIONS.ADD,
    update:FORM_ACTIONS.UPDATE
  }
  pathApi: string = ROUTES_API.users
  theads: string[]  = ['N°', 'Nombre', 'Apellido', "Usuario", 'Rol', 'Estado', 'Opciones']
  fields: string[] = ['index', 'name', 'lastname', 'username', 'Role.name', 'UserStatus.name']

  formGroup: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, textValidator()]),
    lastname: new FormControl('', [Validators.required, textValidator()]),
    username: new FormControl('', [Validators.required, usernameValidator()]),
    password: new FormControl('', [Validators.required, passwordValidator()]),
    statusId: new FormControl(this.statusId, [Validators.required]),
    roleId: new FormControl(this.roleId, [Validators.required])
  })

  errors: any = {
    name: '',
    lastname: '',
    username: '',
    password: '',
    status: '',
    request: ''
  }
  constructor(
    private restApi: RestApiService,
    private reloadSrv: ReloadService
  ) {}

  onInput: Function = ($event: any, name: string, limit: Limit={}) => {detectChange(this.formGroup, this.errors)($event, name, limit)}

  ngOnInit() {
    this.getStatuses()
  }

  showModal() {
    this.isVisible = true
    this.formAction = FORM_ACTIONS.ADD
  }

  showBtns(action: string) {
    return action === this.formAction
  }

  checkPassword($event:any) {
    this.passwordRequired = $event.target.checked
    if(!this.passwordRequired) {
      this.formGroup.get('password')?.reset()
      this.errors.password = ''
    }
  }

  showUpdate(user: any) {
    this.selectedId = user.id
    let data = {
      name: user.name,
      lastname: user.lastname,
      username: user.username,
      roleId: user.roleId,
      statusId: user.statusId,
      password: ''
    }

    // Cargamos el formulario con los datos que tenemos
    this.formGroup.setValue(data)
    // Seteamos la acción del formulario
    this.formAction = FORM_ACTIONS.UPDATE
    // Mostramos ls ventana modal
    this.isVisible = true
  }

  hideModal(value: boolean) {
    this.isVisible = value
    this.formGroup.reset()
    clearErrors(this.errors)
    if(this.checkbox) {
      this.checkbox.nativeElement.checked = false
      this.passwordRequired = false
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

  saveUser() {
    Swal.fire({
      title: '¡Atención!',
      text: '¿Deseas guardar este usuario?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((action: any) => {
      if(action.isConfirmed) {
        if(this.formGroup.valid) {
          this.restApi.post(this.pathApi, this.formGroup.value).subscribe((response: any) => {
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
              }).then((action: any) => {
                this.formGroup.reset()
                this.hideModal(false)
              })
              // Limpiamos los errores
              clearErrors(this.errors)
              // Indicamos a la tabla que debe recargarse porque hubo cambios
              this.reloadSrv.addChanges({changes: true, type: CHANGES_TYPE.ADD})
            }
          })
        } else {
          validateFields(this.formGroup, this.errors)
        }
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
              }).then((action: any) => {
                this.formGroup.reset()
                this.hideModal(false)
              })
              clearErrors(this.errors)
              // Indicamos a la tabla que debe recargarse porque hubo cambios
              this.reloadSrv.addChanges({changes: true, type: CHANGES_TYPE.ADD})
          }
        })
      }
    })
  }

  deleteUser(user: any) {
    Swal.fire({
      title: '¡Atención!',
      text: `¿Deseas eliminar el usuario: ${user.username}?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((action: any) => {
      if(action.isConfirmed) {
        this.restApi.delete(this.pathApi + user.id).subscribe((response: any) => {
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
            }).then((action: any) => {
              this.formGroup.reset()
              this.hideModal(false)
            })
            // Indicamos a la tabla que debe recargarse porque hubo cambios
            this.reloadSrv.addChanges({changes: true, type: CHANGES_TYPE.ADD})
          }
        })
      }
    })
  }
}
