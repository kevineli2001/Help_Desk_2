import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ACCESS_ROLES } from 'src/app/guards/users.guard';
import { UserData } from 'src/app/interfaces/user.interface';
import { SectiondService } from 'src/app/services/section.service';
import { SYSTEM_NAME } from 'src/app/utilities/constants';
import { StorageData } from 'src/app/utilities/storage';

export const routes: any = [
  {
    path: 'home',
    name: 'Inicio',
    icon: 'fa-home'
  },
  {
    path: 'inventory',
    name: 'Inventario',
    icon: 'fa-clipboard'
  },
  {
    path: 'providers',
    name: 'Proveedores',
    icon: 'fa-people-carry-box'
  },
  {
    path: 'invoices',
    name: 'Facturas',
    icon: 'fa-file-invoice'
  },
  {
    path: 'reports',
    name: 'Reportes',
    icon: 'fa-rectangle-list'
  },
  {
    path: 'categories',
    name: 'Categorías',
    icon: 'fa-list-ol'
  },
  {
    path: 'users',
    name: 'Usuarios',
    icon: 'fa-users'
  },
  {
    path: 'settings',
    name: 'Configuración',
    icon: 'fa-gears'
  },
  {
    path: 'exit',
    name: 'Salir',
    icon: 'fa-door-open'
  }
]

export const aditionalRoutes: any[] = [
  {
    path: 'item',
    name: 'Item',
    icon: ''
  }
]

export function loadSectionName(router: Router, sectionSrv: SectiondService) {
  const paths = router.url.split('/')
  if(!isNaN(parseInt(paths[paths.length - 1]))) {
    paths.pop()
    const found = aditionalRoutes.find((route: any) => route.path === paths[paths.length-1])
    if(found) {
      sectionSrv.setName(found.name)
      return
    }
  }

  const currentPath = paths[paths.length - 1]
  const obj = routes.find((route: any) => route.path === currentPath)
  let sectionName = obj.name
  sectionSrv.setName(sectionName)
}

@Component({
  selector: 'app-float-menu',
  templateUrl: './float-menu.component.html',
  styleUrls: ['./float-menu.component.scss']
})
export class FloatMenuComponent implements OnInit, OnDestroy {
  isVisible: boolean = false
  systemName: string = SYSTEM_NAME
  userData: UserData = StorageData.get()
  subscription!: Subscription
  constructor(
    private router: Router,
    private sectionService: SectiondService
  ) {}

  ngOnInit() {
    loadSectionName(this.router, this.sectionService)
    this.restrictSection()
    this.subscription = this.sectionService.userData$.subscribe((data: UserData) => {
      this.userData = data
    })
  }

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe()
    }
  }
  routes: any = routes

  toggle($event: any) {
    let target = $event.target
    let ids = ['btn-bars', 'menu-modal']
    let isBtnModal = target.getAttribute('btn-menu')
    if( ids.includes(target.id) || isBtnModal ) {
      if(this.isVisible) {
        this.isVisible = false
      } else {
        this.isVisible = true
      }
    }
  }

  redirectTo(path: string, sectionName: string) {
    if(path === 'exit') {
      StorageData.remove()
      this.router.navigate(['login'])
    } else {
      this.router.navigate(['main/'+path])
      this.sectionService.setName(sectionName)
    }
  }

  restrictSection() {
    let roleId = this.userData.role
    const found = ACCESS_ROLES.find((role: any) => role.id === roleId)
    if(!found) {
      this.routes = this.routes.filter((route: any) => route.path !== 'users')
    }
  }

}
