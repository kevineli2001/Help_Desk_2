import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SectiondService } from '../services/section.service';
import { aditionalRoutes, routes } from '../components/dashboard/float-menu/float-menu.component';

export const itemGuard: CanActivateFn = (route, state) => {
  const router = inject(Router)
  const sectionSrv = inject(SectiondService)
  if(!route.params['inventoryId']) {
    sectionSrv.setName(routes.find((route: any)=>route.path === 'inventory').name)
    router.navigate(['main/inventory'])
    return false
  }
  if(isNaN(parseInt(route.params['inventoryId']))) {
    sectionSrv.setName(routes.find((route: any)=>route.path === 'inventory').name)
    router.navigate(['main/inventory'])
    return false
  }

  sectionSrv.setName(aditionalRoutes.find((route: any)=>route.path === 'item').name)
  return true;
};
