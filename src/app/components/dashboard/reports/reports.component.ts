import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormControlName, FormGroup } from '@angular/forms';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ROUTES_API } from 'src/app/utilities/constants';
import { Limit, detectChange } from 'src/app/utilities/functions';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit{
  @ViewChild('table') table?: ElementRef<HTMLTableElement>
  pathProviders: string = ROUTES_API.providers + 'all'
  pathCategories: string = ROUTES_API.categories + 'all'
  pathInvoices: string = ROUTES_API.inventory + 'invoices/'
  pathReports: string = ROUTES_API.inventory + 'reports'
  providers: any = []
  invoices: any = []
  categories: any = []
  money: any = ['price', 'total']
  images: any = []
  times: any = []
  total: number = 0
  theads: any = ['N°', 'Factura', 'Proveedor', 'Categoría', 'Item', 'Cantidad', 'Precio', 'Total', 'Buenos', 'Dañados', 'Observaciones']
  fields: any = ['index', 'Invoice.code', 'Invoice.Provider.name', 'Category.name', 'name', 'quantity', 'price', 'total', 'goods', 'damaged', 'description']
  items: any = []
  errors: any = {
    providerId: '',
    invoiceId: '',
    categoryId: '',
    date: '',
  }
  formGroup: FormGroup = new FormGroup({
    providerId: new FormControl(''),
    invoiceId: new FormControl(''),
    categoryId: new FormControl(''),
    date: new FormControl(''),
  })
  constructor(
    private restApi: RestApiService
  ){}

  ngOnInit(): void {
    this.getProviders()
    this.getCategories()
  }

  onInput: Function = ($event: any, name: string, limit: Limit={}) => {detectChange(this.formGroup, this.errors)($event, name, limit)}

  getProviders() {
    this.restApi.get(this.pathProviders).subscribe((response: any) => {
      this.providers = response.data
    })
  }

  getInvoices() {
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
    } else {
      this.invoices = []
      this.formGroup.get('invoiceId')?.setValue('')
      this.formGroup.get('categoryId')?.setValue('')
      this.errors.invoiceId = ''
      this.errors.categoryId = ''
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

  getData() {
    if(this.validateOneFull()) {
      this.restApi.post(this.pathReports, this.formGroup.value).subscribe((response: any) => {
        // Resetamos el total
        this.total = 0
        this.items = response.data.rows.map((item:any, i:number) => {
          item.index = i+1
          item.total = item.quantity * item.price
          item.goods = item.quantity - item.damaged
          this.total += item.total
          return item
        })
      })
    } else {
      Swal.fire({
        title: '¡Atención!',
        text: 'Debes seleccionar un filtro',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      })
    }
  }

  validateOneFull() {
    for(let key of Object.keys(this.formGroup.value)){
      let value = this.formGroup.get(key)?.value
      if(value !== null && value !== '') {
        return true
      }
    }
    return false
  }

  processData() {
    return this.items.map((item:any, i: number) => {
      return [
        (i + 1).toString(),
        item['Invoice.code'],
        item['Invoice.Provider.name'],
        item['name'],
        item['quantity'].toString(),
        item['price'].toString(),
        item['total'].toString(),
        item['goods'].toString(),
        item['damaged'].toString(),
        item['description'],
      ]
    })
  }


  createPDF() {
    const doc = new jsPDF({
      orientation: 'landscape'
    });
    if(this.table) {
      let tablaHTML = this.table.nativeElement.outerHTML
      let data = this.processHTML(tablaHTML, '9px')
      let margin = 5
      let scale = (doc.internal.pageSize.width - margin * 2) /document.body.clientWidth
      let scaleMobile = (doc.internal.pageSize.width - margin * 2) / document.body.getBoundingClientRect().width
    let isMobile = /Android|webOs|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(navigator.userAgent)
    // Validamos que vista es, si mobile o PC
    if(isMobile) {
      doc.html(data, {
        x: margin,
        y: margin,
        html2canvas: {scale: scaleMobile},
        callback: (documento) => {
          // Guardar el PDF
          documento.save('Reporte.pdf');
        }})
      } else {
      doc.html(data, {
        x: margin,
        y: margin,
        html2canvas: {scale},
        callback: (documento) => {
          // Guardar el PDF
          documento.save('Reporte.pdf');
        }})
      }
    }
  }

  // Función para agregar relleno a las celdas de la tabla
  processHTML(tablaHTML: string, cellPadding: string): string {
    // Crear un elemento temporal para manipular el contenido HTML
    const tempEl = document.createElement('div');
    tempEl.innerHTML = tablaHTML;
    // Seleccionamos la tabla y le pasamos bordes
    const table = tempEl.querySelector('table')
    // Seleccionar todas las celdas de la tabla
    const cells = tempEl.querySelectorAll('td');
    const theads = tempEl.querySelectorAll('th');
    const borderStyle = '1px solid black';
    // Agregar el relleno y bordes a cada celda
    cells.forEach(cell => {
      cell.style.padding = cellPadding;
      cell.style.borderRight = borderStyle;
      cell.style.borderTop = borderStyle;
      cell.style.textAlign = 'center';
    });
    // Agregar el relleno y bordes a cada celda
    theads.forEach(cell => {
      cell.style.padding = cellPadding;
      cell.style.borderRight = borderStyle;
      cell.style.borderTop = borderStyle;
      cell.style.textAlign = 'center';
    });

    const thead = tempEl.querySelector('thead');
    if(!table || !thead) {
      // Devolver el contenido HTML modificado
      return tempEl.innerHTML;
    }
    table.style.border = borderStyle
    table.style.margin = 'auto'
    table.style.width = '100%'
    table.style.borderCollapse = 'collapse'
    thead.style.background = 'rgb(153, 223, 255)'
    return tempEl.innerHTML;
  }
}
