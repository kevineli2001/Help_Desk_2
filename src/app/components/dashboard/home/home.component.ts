import { Component, OnInit } from '@angular/core';
import { SectiondService } from 'src/app/services/section.service';
import { routes } from '../float-menu/float-menu.component';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ROUTES_API } from 'src/app/utilities/constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  data: {section: string, rows: number, icon?: string}[] = []
  constructor(private restApi: RestApiService) {}
  ngOnInit(): void {
    this.getProviders()
    this.getInvoices()
    this.getCategories()
    this.getInventories()
  }

  getInvoices() {
    this.restApi.post(ROUTES_API.invoices+'count', {}).subscribe((response:any) => {
      if(response.data) {
        response.data.icon = 'fa-file-invoice'
        this.data.push(response.data)
      }
    })
  }

  getProviders() {
    this.restApi.post(ROUTES_API.providers+'count', {}).subscribe((response:any) => {
      if(response.data) {
        response.data.icon = 'fa-people-carry-box'
        this.data.push(response.data)
      }
    })
  }

  getInventories() {
    this.restApi.post(ROUTES_API.inventory+'count', {}).subscribe((response:any) => {
      if(response.data) {
        response.data.icon = 'fa-clipboard'
        this.data.push(response.data)
      }
    })
  }

  getCategories() {
    this.restApi.post(ROUTES_API.categories+'count', {}).subscribe((response:any) => {
      if(response.data) {
        response.data.icon = 'fa-list-ol'
        this.data.push(response.data)
      }
    })
  }
}
