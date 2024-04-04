import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReloadService } from 'src/app/services/reload.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { FORM_ACTIONS, ROUTES_API } from 'src/app/utilities/constants';
import { Limit, clearErrors, detectChange, passwordValidator, textValidator, usernameValidator, validateFields } from 'src/app/utilities/functions';
import { CHANGES_TYPE } from 'src/app/utilities/paginator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
  isVisible: boolean = false
  selectedId!: number
  formAction :string = FORM_ACTIONS.ADD
  btns: any = {
    add: FORM_ACTIONS.ADD,
    update:FORM_ACTIONS.UPDATE
  }
  pathApi: string = ROUTES_API.categories
  theads: string[]  = ['N°', 'Nombre', 'Opciones']
  fields: string[] = ['index', 'name']

  formGroup: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, textValidator()])
  })

  errors: any = {
    name: '',
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

  showUpdate({id, name}: any) {
    this.selectedId = id
    let data = { name }
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

  saveCategory() {
    Swal.fire({
      title: '¡Atención!',
      text: '¿Deseas guardar esta categoría?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((action: any) => {
      if(action.isConfirmed && this.formGroup.valid) {
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
    })
  }

  updateCategory() {
    Swal.fire({
      title: '¡Atención!',
      text: '¿Deseas guardar los cambios?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((action: any) => {
      if(action.isConfirmed && this.formGroup.valid) {
          this.restApi.put(this.pathApi + this.selectedId, this.formGroup.value).subscribe((response: any) => {
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

  deleteCategory(category: any) {
    Swal.fire({
      title: '¡Atención!',
      text: `¿Deseas eliminar la categoría: ${category.name}?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((action: any) => {
      if(action.isConfirmed) {
        this.restApi.delete(this.pathApi + category.id).subscribe((response: any) => {
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

