import { throwError } from "rxjs";

export function  errorHandlers(error: any, errorsObj: any) {
  if(error.error.errors && error.error.errorKeys) {
    let { errors, errorKeys} = error.error
    errorKeys.forEach((key: string) => {
      errorsObj[key] = errors[key][0].msg
    });
  }
  return throwError(() => new Error('test'))
}
