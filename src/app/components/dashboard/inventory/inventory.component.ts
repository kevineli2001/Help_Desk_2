import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReloadService } from 'src/app/services/reload.service';
import { RestApiService } from 'src/app/services/rest-api.service';
import { FORM_ACTIONS, ROUTES_API } from 'src/app/utilities/constants';
import { Limit, clearErrors, detectChange, ellipsis, numberValidator, positiveIntValidator, textValidator, validateFields } from 'src/app/utilities/functions';
import { CHANGES_TYPE } from 'src/app/utilities/paginator';
import Swal from 'sweetalert2';
import { Operation } from '../../shared/datatable/datatable.component';
import { Router } from '@angular/router';
// Tipado solo para este componente
type TextArray = string[]
interface FormInputTypes {
  text: TextArray,
  number: TextArray
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit{
  @ViewChild('inputDamaged') inputDamaged?: ElementRef
  @ViewChild('inputImages') inputImages?: ElementRef
  @ViewChild('checkbox') checkbox!: ElementRef<HTMLInputElement>
  theads: string[]  = [
    'N°',
    'Factura',
    'Nombre',
    'Precio',
    'Cantidad',
    'Importe',
    'Buenos',
    'Dañados',
    'Categoría',
    'Proveedor',
    'Reporte',
    'Opciones'
  ]
  fields: string[] = [
    'index',
    'Invoice.code',
    'name',
    'price',
    'quantity',
    'total',
    'good',
    'damaged',
    'Category.name',
    'Invoice.Provider.name',
    'description'
  ]

  money: string[] = ['price', 'total']
  pathImages: string = ROUTES_API.images
  operations: Operation[] = [
    {
      newField:'good',
      fields: ['quantity', 'damaged'],
      symbol: '-'
    },
    {
      newField:'total',
      fields: ['quantity', 'price'],
      symbol: '*'
    }
  ]
  formActions: any = {
    REGISTER: 'Registrar Item',
    UPDATE: 'Actualizar Item',
  }
  btns: any = {
    add: FORM_ACTIONS.ADD,
    update:FORM_ACTIONS.UPDATE
  }
  imagesType: any =  {
    images: 'Foto del producto',
    damaged: 'Fotos de los dañados'
  }
  ellipsis: any = ellipsis
  maxImages = 2 // Limita la cantidad de imagenes que se podrán guardar
  isVisible: boolean = false
  roleId: number = 2
  statusId: number = 1
  selectedId!: number
  formAction :string = this.formActions.REGISTER
  damagedRequired!: boolean
  statuses: any = []
  providers: any = []
  invoices: any = []
  categories: any = []
  images: any = []
  fileListImages: any[] = [] // Imagenes del producto que se enviaran
  fileListDamagedImages: any[] = [] // Imagenes que se enviaran sobre los daños
  damagedImages: any = []
  validExt: any = ['jpg', 'jpeg', 'png']
  pathApi: string = ROUTES_API.inventory
  pathProviders: string = ROUTES_API.providers + 'all'
  pathCategories: string = ROUTES_API.categories + 'all'
  pathInvoices: string = ROUTES_API.inventory + 'invoices/'
  // Campos de formulario
  formGroup: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, textValidator()]),
    providerId: new FormControl('', Validators.required),
    invoiceId: new FormControl('', Validators.required),
    categoryId: new FormControl('', Validators.required),
    price: new FormControl('', [Validators.required, numberValidator()]),
    description: new FormControl('', [Validators.required, textValidator()]),
    quantity: new FormControl(1,[Validators.required, positiveIntValidator()]),
    damaged: new FormControl(1,[Validators.required, positiveIntValidator()]),
  })
  // Errores de los campos del formulario
  errors: any = {
    name: '',
    providerId: '',
    invoiceId: '',
    categoryId: '',
    price: '',
    quantity: '',
    damaged: '',
    description: '',
    images: '',
    damagedImages: '',
    request: ''
  }
  constructor(
    private restApi: RestApiService,
    private reloadSrv: ReloadService,
    private router: Router,
  ) {}

  onInput: Function = ($event: any, name: string, limit: Limit={}) => {detectChange(this.formGroup, this.errors)($event, name, limit)}

  ngOnInit() {
    this.getProviders()
    this.getCategories()
  }

  showModal() {
    // Verificamos que haya proveedores agregados
    if(this.providers.length > 0 && this.categories.length > 0) {
      this.isVisible = true
      this.formAction = this.formActions.REGISTER
      this.resetForm()
    } else {
      let msg = ''
      if(this.providers.length === 0) {
        msg = 'Debe tener registrado al menos un proveedor'
      }
      if(this.categories.length === 0) {
        msg = 'Debe tener registrado al menos una categoría'
      }
      if(this.categories.length === 0 && this.providers.length === 0) {
        msg = 'Debe tener registrado al menos un proveedor y una categoría'
      }

      Swal.fire({
        title: '¡Atención!',
        text: msg,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      })
    }
  }

  showBtns(action: string) {
    return action === this.formAction
  }

  checkDamaged($event:any) {
    this.damagedRequired = $event.target.checked
    if(!this.damagedRequired && this.formAction !== this.formActions.UPDATE) {
      this.resetDamagedBlock()
    }
  }

  resetDamagedBlock() {
      this.damagedImages = []
      this.fileListDamagedImages = []
      this.formGroup.get('damaged')?.setValue(0)
      this.formGroup.get('description')?.setValue('')
      this.errors.damaged = ''
      this.errors.description = ''
      this.errors.damagedImages = ''
  }

  showUpdate(inventory: any) {
    this.selectedId = inventory.id
    console.log(inventory, inventory['Category.id'])
    console.log(this.categories)

    let data = {
      providerId: inventory['Invoice.Provider.id'],
      categoryId: inventory['Category.id'],
      invoiceId: '',
      name: inventory.name,
      price: inventory.price,
      quantity: inventory.quantity,
      damaged: inventory.damaged,
      description: inventory.description,
    }
    // Limpiamos los arreglos de imagenes
    this.images = []
    this.damagedImages = []
    this.fileListDamagedImages = []
    this.fileListImages = []
    // Mostramos ls ventana modal
    this.isVisible = true
    // Cargamos el formulario con los datos que tenemos
    this.formGroup.setValue(data)
    // Cargamos las facturas
    this.getInvoices()
    // Seteamos la factura seleccionada
    this.formGroup.get('invoiceId')?.setValue(inventory['Invoice.id'])
    // Seteamos la acción del formulario
    this.formAction = this.formActions.UPDATE
    // Mostrar optionales si están llenos
    this.checkbox.nativeElement.checked = inventory.damaged > 0
    this.damagedRequired = inventory.damaged > 0
  }

  hideModal(value: boolean) {
    this.isVisible = value
    this.formGroup.reset()
    clearErrors(this.errors)
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

  saveInventory() {
    Swal.fire({
      title: '¡Atención!',
      text: '¿Deseas guardar este usuario?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((action: any) => {
      let validation = this.validateRequired()
      if(action.isConfirmed && this.validateRequired().isValid) {
        this.restApi.post(this.pathApi, validation.data).subscribe((response: any) => {
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
      }
    })
  }

  validateImgs(imgArr: keyof InventoryComponent, errors: any, key:string) {
    // Verificamos que haya imagenes del producto ya cargadas
    if(this[imgArr].length === 0) {
      errors[key] = 'Debe agregar al menos una imagen'
    }
  }

  isValidPositiveNumber(key: string) {
    // Verificamos que haya imagenes del producto ya cargadas
    if(this.formGroup.get(key)?.value === 0) {
      this.errors[key] = 'Valor ingresado debe ser mayor a 0'
    }
  }

  validateRequired() {
    if(!this.damagedRequired) {
      let optionals = ['damaged', 'description']
      let validation = validateFields(this.formGroup, this.errors, optionals)
      // Verificamos que la cantidad sea superior a cero
      this.isValidPositiveNumber('quantity')
      // Validamos que haya cargado imagenes de los daños
      this.validateImgs('fileListImages', this.errors, 'images')
      return {
        isValid: (validation.valid && this.fileListImages.length > 0),
        data: this.getFormData()
      }
    } else {
      let validation = validateFields(this.formGroup, this.errors)
      // Verificamos que la cantidad sea superior a cero
      this.isValidPositiveNumber('quantity')
      // Validamos que haya cargado imagenes de los daños
      this.validateImgs('fileListImages', this.errors, 'images')
      // Verificamos que la cantidad sea superior a cero
      this.isValidPositiveNumber('damaged')
      // Validamos que haya cargado imagenes de los daños
      this.validateImgs('fileListDamagedImages', this.errors, 'damagedImages')
      return {
        isValid: (validation.valid && this.fileListImages.length > 0 && this.validationQuantities()),
        data: this.getFormData()
      }
    }
  }

  validateUpdateRequired() {
    if(!this.damagedRequired) {
      // Reseteamos los campso opcionales
      this.resetDamagedBlock()
      // Definir los opcionales
      let optionals = ['damaged', 'description']
      // Validar los campos
      let validation = validateFields(this.formGroup, this.errors, optionals)
      // Verificamos que la cantidad sea superior a cero
      this.isValidPositiveNumber('quantity')
      return {
        isValid: (validation.valid),
        data: this.getFormData()
      }
    } else {
      let validation = validateFields(this.formGroup, this.errors)
      // Verificamos que la cantidad sea superior a cero
      this.isValidPositiveNumber('quantity')
      // Verificamos que la cantidad sea superior a cero
      this.isValidPositiveNumber('damaged')
      return {
        isValid: (validation.valid && this.validationQuantities()),
        data: this.getFormData()
      }
    }
  }

  updateInventory() {
    Swal.fire({
      title: '¡Atención!',
      text: '¿Deseas guardar los cambios?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((action: any) => {
      let validation = this.validateUpdateRequired()
      if(action.isConfirmed && validation.isValid) {
        this.restApi.put(this.pathApi+this.selectedId, validation.data).subscribe((response: any) => {
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
            // Reseteamos el formulario
            this.resetForm()
            // Indicamos a la tabla que debe recargarse porque hubo cambios
            this.reloadSrv.addChanges({changes: true, type: CHANGES_TYPE.ADD})
          }
        })
      }
    })
  }

  deleteInventory(item: any) {
    Swal.fire({
      title: '¡Atención!',
      text: `¿Deseas eliminar el item: ${item.name}?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((action: any) => {
      if(action.isConfirmed) {
        this.restApi.delete(this.pathApi + item.id).subscribe((response: any) => {
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

  resetInvoices() {
    this.invoices = []
    this.formGroup.get('invoiceId')?.setValue('')
    this.errors.invoiceId = ''
  }

  getInvoices() {
    this.resetInvoices()
    let providerId = this.formGroup.get('providerId')?.value
    if(providerId && providerId !== '') {
      this.restApi.get(this.pathInvoices + providerId).subscribe((response: any) => {
        this.invoices = response.data
        if(response.data.length === 0) {
          Swal.fire({
            title: '¡Atención!',
            text: 'Proveedor seleccionado no tiene faturas registradas. Agregue una factura primero',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar'
          })
        }
      })
    }
  }

  getCategories() {
    this.restApi.get(this.pathCategories).subscribe((response: any) => {
      this.categories = response.data
      if(response.data.length === 0) {
        Swal.fire({
          title: '¡Atención!',
          text: 'No hay categorías registradas aún.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar'
        })
      }
    })
  }

  showImages($event: any, type: string) {
    let files: FileList = $event.target.files
    // Limpiamos cada arreglo dependiendo de que tipo de imagen sea
    let imageLimitReached = false
    if(type === this.imagesType.images) {
      if(this.fileListImages.length === this.maxImages) {
        imageLimitReached = true
      } else {
        this.fileListImages.push(files[0])
      }
    }
    if(type === this.imagesType.damaged) {
      if(this.fileListDamagedImages.length === this.maxImages) {
        imageLimitReached = true
      } else {
        this.fileListDamagedImages.push(files[0])
      }
    }
    // Restrigimos la cantidad de imagenes permitidas
    if(imageLimitReached) {
      // Mostramos un mensaje de error
       Swal.fire({
        title: 'Error',
        text: 'Solo se permiten '+this.maxImages + ' imagenes',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      })
      return
    }

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileSplit = file.name.split('.')
        const ext = fileSplit[fileSplit.length - 1]
        // Varificamos si hay archivos con formato invalido
        if(!this.validExt.includes(ext)) {
          // Mostramos un mensaje de error
           Swal.fire({
            title: 'Error',
            text: 'Solo se permiten los formatos: '+this.validExt.join(','),
            icon: 'error',
            confirmButtonText: 'Aceptar',
          })

          // Validamos que se limpie y elimine el archivo con formato no compatible
          $event.target.value = ''
          if(type === this.imagesType.images) {
            this.fileListImages.pop()
          }
          if(type === this.imagesType.damaged) {
            this.fileListDamagedImages.pop()
          }
          return
        }
        // Si todos las imagenes son validas entonces las procesamos
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if(type === this.imagesType.images) {
            this.images.push({name: file.name, src: e.target.result});
            this.errors.images = ''
          }
          if(type === this.imagesType.damaged) {
            this.damagedImages.push({name: file.name, src: e.target.result});
            this.errors.damagedImages = ''
          }
        };
        reader.readAsDataURL(file);
      }
    }
    $event.target.value = ''
  }

  removeImage(index: number, type: string) {
    if(type === this.imagesType.images) {
      this.images.splice(index, 1);
      this.fileListImages.splice(index, 1);
    }
    if(type === this.imagesType.damaged) {
      this.damagedImages.splice(index, 1);
      this.fileListDamagedImages.splice(index, 1);
    }
  }

  resetForm() {
    // Limpiamos los arreglos
      this.images = []
      this.fileListImages = []
      this.damagedImages = []
      this.fileListDamagedImages = []
    // Reseteamos todos los campos
    let textFields = ['name', 'providerId', 'invoiceId', 'categoryId']
    let numericFields = ['price', 'quantity', 'damaged']
    let formFieldTypes: FormInputTypes = {text: textFields, number: numericFields}
    this.resetValues(this.formGroup, formFieldTypes)
    if (this.inputDamaged && this.inputImages && this.checkbox) {
      this.inputDamaged.nativeElement.value = ''
      this.inputImages.nativeElement.value = ''
      this.checkbox.nativeElement.checked = false
      this.damagedRequired = false
    }
  }

  resetValues(FormGroup: FormGroup, types: FormInputTypes) {
    types.text.forEach((type: string) => {
      FormGroup.get(type)?.setValue('')
    })
    types.number.forEach((type: string) => {
      FormGroup.get(type)?.setValue(0)
    })
  }

  getFormData() {
    let formData = new FormData()
    this.fileListImages.forEach((file: File) => {
      formData.append('images', file)
    })
    this.fileListDamagedImages.forEach((file: File) => {
      formData.append('imgDamaged', file)
    })
    let keys = Object.keys(this.formGroup.value)
    keys.forEach((key: any) => {
      let value = this.formGroup.get(key)?.value
      formData.append(key, value)
    })
    return formData
  }

  isMinor(item: string) {
    if(this.imagesType.damaged === item) {
      if(this.formGroup.get('damaged')?.value === '') {return}
      if(parseInt(this.formGroup.get('damaged')?.value) > parseInt(this.formGroup.get('quantity')?.value)){
        Swal.fire({
          title: 'Error',
          text: 'Cantidad de items dañados no debe superar al total ingresado',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        })
      }
    }

    if(this.imagesType.images === item && this.damagedRequired) {
      if(this.formGroup.get('quantity')?.value === '') {return}
      this.validationQuantities()
    }
  }

  validationQuantities() {
    try {
      if(parseInt(this.formGroup.get('damaged')?.value) > parseInt(this.formGroup.get('quantity')?.value)){
        Swal.fire({
          title: 'Error',
          text: 'Cantidad de items ingresados debe superar o ser igual al total de items dañados',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        })
        return false
      }
      return true
    } catch (error) {
      return false
    }
  }

  openBlank(item: any) {
    this.router.navigate([`main/item/${item.id}`])
  }
}

