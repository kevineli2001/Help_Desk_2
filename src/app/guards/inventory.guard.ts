import { CanActivateFn } from '@angular/router';
import { routes } from '../components/dashboard/float-menu/float-menu.component';
import { SectiondService } from '../services/section.service';
import { inject } from '@angular/core';

export const inventoryGuard: CanActivateFn = (route, state) => {
  const sectionSrv: SectiondService = inject(SectiondService)
  sectionSrv.setName(routes.find((route:any) => route.path === 'inventory').name)
  return true;
};
