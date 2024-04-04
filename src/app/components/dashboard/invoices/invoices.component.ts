import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReloadService } from 'src/app/services/reload.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { FORM_ACTIONS, ROUTES_API } from 'src/app/utilities/constants';
import { Limit, clearErrors, detectChange, emailValidator, getDateFormat, passwordValidator, rucValidator, telephoneValidator, textValidator, usernameValidator, validateFields } from 'src/app/utilities/functions';
import { CHANGES_TYPE } from 'src/app/utilities/paginator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit{
  pathApi: string = ROUTES_API.invoices
  pathProviders: string = ROUTES_API.providers + 'all'
  theads: string[] = ['N°', 'Código', '', 'Proveedor', 'Fecha', 'Observaciones', 'Opciones']
  fields: string[] = ['index', 'code', 'ruc', 'Provider.name', 'date', 'observation']
  times: string[] = ['date']
  providers: any = []
  isVisible: boolean = false
  selectedId!: number
  formAction :string = FORM_ACTIONS.ADD
  btns: any = {
    add: FORM_ACTIONS.ADD,
    update:FORM_ACTIONS.UPDATE
  }

  formGroup: FormGroup = new FormGroup({
    code: new FormControl('', [Validators.required, textValidator()]),
    providerId: new FormControl('', [Validators.required]),
    date: new FormControl('', [Validators.required]),
    observation: new FormControl('', [Validators.required, textValidator()]),
  })

  errors: any = {
    code: '',
    providerId: '',
    date: '',
    observation: '',
    request: ''
  }
  constructor(
    private restApi: RestApiService,
    private reloadSrv: ReloadService
  ) {}

  onInput: Function = ($event: any, name: string, limit: Limit={}) => {detectChange(this.formGroup, this.errors)($event, name, limit)}

  ngOnInit(): void {
    this.getProviders()
  }

  showModal() {
    this.isVisible = true
    this.formAction = FORM_ACTIONS.ADD
  }

  showBtns(action: string) {
    return action === this.formAction
  }

  showUpdate(invoice: any) {
    this.selectedId = invoice.id
    let data = {
      code: invoice.code,
      providerId: invoice['Provider.id'],
      observation: invoice.observation,
      date: getDateFormat(invoice.date)
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

  saveInvoice() {
    Swal.fire({
      title: '¡Atención!',
      text: '¿Deseas guardar esta factura?',
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

  updateInvoice() {
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

  deleteInvoice(invoice: any) {
    Swal.fire({
      title: '¡Atención!',
      text: `¿Deseas eliminar la factura: ${invoice.code} del proveedor ${invoice['Provider.name']}?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((action: any) => {
      if(action.isConfirmed) {
        this.restApi.delete(this.pathApi + invoice.id).subscribe((response: any) => {
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

  getProviders() {
    this.restApi.get(this.pathProviders).subscribe((response: any) => {
      this.providers = response.data
    })
  }
}

