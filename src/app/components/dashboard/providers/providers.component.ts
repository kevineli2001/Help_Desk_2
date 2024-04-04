import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReloadService } from 'src/app/services/reload.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { FORM_ACTIONS, ROUTES_API } from 'src/app/utilities/constants';
import { Limit, clearErrors, detectChange, emailValidator, passwordValidator, rucValidator, telephoneValidator, textValidator, usernameValidator, validateFields } from 'src/app/utilities/functions';
import { CHANGES_TYPE } from 'src/app/utilities/paginator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.scss']
})

export class ProvidersComponent {
  pathApi: string = ROUTES_API.providers
  theads: string[] = ['N°', 'Nombre', 'R.U.C', 'Dirección', 'Telefono', 'Email', 'Opciones']
  fields: string[] = ['index', 'name', 'ruc', 'address', 'telephone', 'email']
  isVisible: boolean = false
  selectedId!: number
  formAction :string = FORM_ACTIONS.ADD
  btns: any = {
    add: FORM_ACTIONS.ADD,
    update:FORM_ACTIONS.UPDATE
  }

  formGroup: FormGroup = new FormGroup({
    ruc: new FormControl('', [Validators.required, rucValidator()]),
    name: new FormControl('', [Validators.required, textValidator()]),
    address: new FormControl('', [Validators.required, textValidator()]),
    telephone: new FormControl('', [Validators.required, telephoneValidator()]),
    email: new FormControl('', [Validators.required, emailValidator()])
  })

  errors: any = {
    ruc: '',
    name: '',
    address: '',
    telephone: '',
    emaiñ: '',
    request: ''
  }
  constructor(
    private restApi: RestApiService,
    private reloadSrv: ReloadService
  ) {}

  onInput: Function = ($event: any, name: string, limit: Limit={}) => {detectChange(this.formGroup, this.errors)($event, name, limit)}

  showModal() {
    this.isVisible = true
    this.formAction = FORM_ACTIONS.ADD
  }

  showBtns(action: string) {
    return action === this.formAction
  }

  showUpdate(provider: any) {
    this.selectedId = provider.id
    let data = {
      name: provider.name,
      ruc: provider.ruc,
      address: provider.address,
      telephone: provider.telephone,
      email: provider.email
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
  }

  saveUser() {
    Swal.fire({
      title: '¡Atención!',
      text: '¿Deseas guardar este proveedor?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((action: any) => {
      // Validamos todo incluida la contraseña
      let validation = validateFields(this.formGroup, this.errors)
      let dataToSend = this.formGroup.value
      if(action.isConfirmed && validation.valid) {
        this.restApi.post(this.pathApi, dataToSend).subscribe((response: any) => {
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

  deleteUser(provider: any) {
    Swal.fire({
      title: '¡Atención!',
      text: `¿Deseas eliminar el proveedor: ${provider.name}?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((action: any) => {
      if(action.isConfirmed) {
        this.restApi.delete(this.pathApi + provider.id).subscribe((response: any) => {
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

