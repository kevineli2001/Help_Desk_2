import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainComponent } from './components/dashboard/main/main.component';
import { loginGuard } from './guards/login.guard';
import { mainGuard } from './guards/main.guard';
import { UsersComponent } from './components/dashboard/users/users.component';
import { HomeComponent } from './components/dashboard/home/home.component';
import { InventoryComponent } from './components/dashboard/inventory/inventory.component';
import { ReportsComponent } from './components/dashboard/reports/reports.component';
import { SettingsComponent } from './components/dashboard/settings/settings.component';
import { usersGuard } from './guards/users.guard';
import { ProvidersComponent } from './components/dashboard/providers/providers.component';
import { InvoicesComponent } from './components/dashboard/invoices/invoices.component';
import { CategoriesComponent } from './components/dashboard/categories/categories.component';
import { ItemComponent } from './components/dashboard/item/item.component';
import { itemGuard } from './guards/item.guard';
import { inventoryGuard } from './guards/inventory.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard]
  },
  {
    path: 'main',
    component: MainComponent,
    canActivate: [mainGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'inventory',
        component: InventoryComponent,
        canActivate: [inventoryGuard]
      },
      {
        path: 'reports',
        component: ReportsComponent
      },
      {
        path: 'providers',
        component: ProvidersComponent
      },
      {
        path: 'invoices',
        component: InvoicesComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'categories',
        component: CategoriesComponent
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [usersGuard]
      },
      {
        path: 'item/:inventoryId',
        component: ItemComponent,
        canActivate: [itemGuard]
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'main',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
