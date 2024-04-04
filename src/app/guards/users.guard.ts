import { CanActivateFn, Router } from "@angular/router";
import { StorageData } from "../utilities/storage";
import { inject } from "@angular/core";

// Debe coincidir con la base de datos
export const ACCESS_ROLES = [
  {
    id: 1,
    roleName: 'ADMIN'
  }
]

export const  usersGuard: CanActivateFn = (route: any, state: any) => {
  let router = inject(Router)
  const roleId =  StorageData.get().role
  const found = ACCESS_ROLES.find((role: any) => role.id === roleId)
  if(!found) {
    router.navigate(['main'])
    return false
  } else {
    return true
  }
}
