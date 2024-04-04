import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatatableComponent } from './components/shared/datatable/datatable.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http'
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { FloatMenuComponent } from './components/dashboard/float-menu/float-menu.component';
import { MainComponent } from './components/dashboard/main/main.component';
import { UsersComponent } from './components/dashboard/users/users.component';
import { HomeComponent } from './components/dashboard/home/home.component';
import { InventoryComponent } from './components/dashboard/inventory/inventory.component';
import { ReportsComponent } from './components/dashboard/reports/reports.component';
import { SettingsComponent } from './components/dashboard/settings/settings.component';
import { ModalComponent } from './components/shared/modal/modal.component';
import { ProvidersComponent } from './components/dashboard/providers/providers.component';
import { InvoicesComponent } from './components/dashboard/invoices/invoices.component';
import { BadRequestInterceptor } from './interceptor/bad-request.interceptor';
import { CategoriesComponent } from './components/dashboard/categories/categories.component';
import { ItemComponent } from './components/dashboard/item/item.component';

@NgModule({
  declarations: [
    AppComponent,
    DatatableComponent,
    LoginComponent,
    FloatMenuComponent,
    MainComponent,
    UsersComponent,
    HomeComponent,
    InventoryComponent,
    ReportsComponent,
    SettingsComponent,
    ModalComponent,
    ProvidersComponent,
    InvoicesComponent,
    CategoriesComponent,
    ItemComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: BadRequestInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
