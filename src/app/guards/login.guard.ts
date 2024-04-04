import { CanActivateFn, Router } from "@angular/router";
import { StorageData } from "../utilities/storage";
import { inject } from "@angular/core";

export const  loginGuard: CanActivateFn = (route: any, state: any) => {
  let router = inject(Router)
  if(StorageData.find().exists) { router.navigate(['main']) }
  return !StorageData.find().exists
}
