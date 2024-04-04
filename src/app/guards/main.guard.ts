import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageData } from '../utilities/storage';

export const mainGuard: CanActivateFn = (route: any, state: any) => {
  const router = inject(Router)
  if(!StorageData.find().exists) { router.navigate(['login'])}
  return StorageData.find().exists
}
