import { ElementRef } from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';
import { validExtensions } from './constants';
import { validateRUC } from './RUC_Validator';

const TYPES = {
  cedula: 'Ingrese una cédula valida.',
  ruc: 'Ingrese un R.U.C valido.',
  telephone: 'Ingrese un número de telefono válido.',
  required: 'Campo es requerido.',
  email: 'Ingrese un email valido.',
  username: 'Campo debe tener al menos 8 caracteres, al menos una minuscula, una mayuscula, un número y un caracter especial. No se admiten espacios en blanco.',
  password: 'Campo debe tener al menos 8 caracteres, al menos una minuscula, una mayuscula, un número y un caracter especial. No se admiten espacios en blanco.',
  number: 'Solo se permiten números positivos enteros o decimales.',
  comparePassword: 'Las contraseñas no coinciden.',
  text: 'No se permiten espacios al pricipio ni al final, tampoco espacios dobles.',
  spaces: 'No se permiten espacios.',
  positiveInt: 'Solo se permiten números enteros mayores o iguales a 0.'
}

export function dniValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    // No se aplica la validación si el valor es nulo
    if (!value) {
      return null;
    }

    // Verificar la longitud del valor
    if (value.length !== 10) {
      return { 'cedula': true }; // Longitud incorrecta
    }

    // Verificar si es un número válido
    if (!(/^\d+$/.test(value))) {
      return { 'cedula': true }; // No es un número válido
    }

    // Verificar el primer dígito
    const provinciaCode = parseInt(value.substr(0, 2), 10);
    if (provinciaCode < 1 || provinciaCode > 24) {
      return { 'cedula': true }; // Código de provincia inválido
    }

    // Algoritmo de validación para el último dígito
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const verificador = parseInt(value.charAt(9), 10);
    let suma = 0;

    for (let i = 0; i < coeficientes.length; i++) {
      let valor = parseInt(value.charAt(i), 10) * coeficientes[i];
      if (valor >= 10) {
        valor -= 9;
      }
      suma += valor;
    }

    if ((suma % 10 !== 0) && ((suma + verificador) % 10 !== 0)) {
      return { 'cedula': true }; // Dígito verificador inválido
    }

    return null; // El número de cédula es válido
  };
}

export function textValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const textRegex = /^[a-zA-Z0-9áéíóúñÁÉÍÓÚ\,\_\-\.]+( [a-zA-Z0-9áéíóúñÁÉÍÓÚ\,\_\-\.]+)*$/;
    // Si no cumple con los parametros
    if (!textRegex.test(control.value)) {
      return { 'text': true };
    }
    return null;
  };
}

export function spacesValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const textRegex = /^\S*$/
    // Si no cumple con los parametros
    if (!textRegex.test(control.value)) {
      return { 'spaces': true };
    }
    return null;
  };
}

export function numberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const numberRegex = /^(0|[1-9]\d*)(\.\d+)?$/;

    if (!numberRegex.test(control.value)) {
      return { 'number': true };
    }

    return null;
  };
}

export function positiveIntValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    try {
      let value = parseInt(control.value)
      if(value <= 0) {
        return { 'positive-int': true };
      }
      return null;
    } catch (error) {
      return { 'positive-int': true };
    }
  };
}

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}[\]:;\"'<>?,./])\S{8,}$/;

    if (!passwordRegex.test(control.value)) {
      return { 'password': true };
    }

    return null;
  };
}

export function usernameValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const usernameRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}[\]:;\"'<>?,./])\S{8,}$/;

    if (!usernameRegex.test(control.value)) {
      return { 'username': true };
    }

    return null;
  };
}

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(control.value)) {
      return { 'email': true };
    }
    return null;
  };
}

export function telephoneValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const telephoneRegex = /^0[1-9]\d{8}$/
    if (!telephoneRegex.test(control.value)) {
      return { 'telephone': true };
    }
    return null;
  };
}

export function rucValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!validateRUC(control.value).isValid) {
      return { 'ruc': true };
    }
    return null;
  };
}

export function comparePassword(password:string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    let areEquals = password === control.value
    if (!areEquals) {
      return { 'comparePassword': true };
    }
    return null;
  };
}

// limit: {exists: boolean, max: number, min: number}
export interface Limit {
  max?: number,
  min?: number,
  spaces?: boolean
}

// Detecta cuando se está escribiendo en los campo de texto y verifica los errores
export function detectChange(formGroup: FormGroup, errors: any, callback: Function = () => {}) {
  callback()
  return ($event: any, name: string, limit: Limit = {min: 1, max: 40}) => {
    let value = $event.target.value
    // Si no se permiten espacios en el texto
    if(typeof limit.spaces === 'boolean') {
      if(!limit.spaces) {
        value = value.replace(/\s/g, "")
        formGroup.get(name)?.setValue(value)
      }
    }
    // Evaluamso si se definió limite de maximo y minimo, recortamos en caso de superar el maximo
    if(limit.max) {
      if(typeof limit.max === 'number' && limit.max > 0) {
        formGroup.get(name)?.setValue(value.substring(0, limit.max))
      }
    }
    // Ejecutamos la callback
    callback()
    // Obtenemos los errores generados y los evaluamos
    const currentErrors = formGroup.get(name)?.errors
    if(currentErrors) {
      // Valida los campos de texto
      if(currentErrors['text']) {
          errors[name] = TYPES.text
          if(limit.max) {
            errors[name] = TYPES.text + ` Solo se permiten ${limit.max} caracteres`
          }
      }

      // Valida que se ingrese una cédula valida
      if(currentErrors['cedula']) {
        errors[name] = TYPES.cedula
      }

      // Valida que se ingrese un R.U.C valid
      if(currentErrors['ruc']) {
        errors[name] = TYPES.ruc
      }

      // Valida que se ingresen números enteros y decimales mayores a 0
      if(currentErrors['number']) {
        errors[name] = TYPES.number
      }

      // Valida que se ingresen números enteros mayores a 0
      if(currentErrors['positive-int']) {
        errors[name] = TYPES.positiveInt
      }

      // Valida que se ingresen números enteros y decimales mayores a 0
      if(currentErrors['telephone']) {
        errors[name] = TYPES.telephone
      }

      // Valida que se escriban nombres de usuarios válidas
      if(currentErrors['username']) {
          errors[name] = TYPES.username
      }
      // Valida que se escriban conatraseña fuertes y válidas
      if(currentErrors['password']) {
          errors[name] = TYPES.password
      }

      // Validamos si hay error de email
      if(currentErrors['email']) {
        errors[name] = TYPES.email
      }
      // Validamos si hay error de email
      if(currentErrors['spaces']) {
        errors[name] = TYPES.spaces
      }
      // Validamos si las contraseñas son iguales
      if(currentErrors['comparePassword']) {
        errors[name] = TYPES.comparePassword
      }

      // Si ha dejado el campo en blanco
      if(currentErrors['required']) {
        errors[name] = 'Campo es requerido'
      }

    } else {
      if(limit.min) {
        if(formGroup.get(name)?.value.length < limit.min){
          errors[name] = `Se require mínimo ${limit.min} caracteres.`
        } else {
          errors[name] = ''
        }
      } else {
        errors[name] = ''
      }
    }
  }
}

// Detecta cuando se está escribiendo en los campo de texto y verifica los errores
function showErrors(type: string) {
    // Valida los campos de texto
    let error = ''
    if(type === 'text') {
        error = TYPES.text
    }

    // Valida que se ingrese una cédula valida
    if(type === 'cedula') {
      error = TYPES.cedula
    }

    // Valida que se ingrese un R.U.C valid
    if(type === 'ruc') {
      error = TYPES.ruc
    }

    // Valida que se ingresen números enteros y decimales mayores a 0
    if(type === 'number') {
      error = TYPES.number
    }

    // Valida que se ingresen números enteros mayores a 0
    if(type === 'positive-int') {
      error = TYPES.positiveInt
    }

    // Valida que se ingresen números enteros y decimales mayores a 0
    if(type === 'telephone') {
      error = TYPES.telephone
    }

    // Valida que se escriban nombres de usuarios válidas
    if(type === 'username') {
      error = TYPES.username
    }
    // Valida que se escriban conatraseña fuertes y válidas
    if(type === 'password') {
        error = TYPES.password
    }
    // Validamos si hay error de email
    if(type === 'email') {
      error = TYPES.email
    }
    // Validamos si hay error de email
    if(type === 'spaces') {
      error = TYPES.spaces
    }
    // Validamos si hay error de email
    if(type === 'comparePassword') {
      error = TYPES.email
    }
    // Si ha dejado el campo en blanco
    if(type === 'required') {
      error = TYPES.required
    }
    return error
}

// Evalua la validez de los campos excluyendo algunos
export function evaluateFieldsExcept(formGroup: FormGroup, excludeFields: string[] = []) {
  const errors: object[] = []
  Object.keys(formGroup.controls).forEach( name => {
    if(!excludeFields.includes(name)) {
      const control = formGroup.get(name);
      if (control?.errors != null) {
        let keys = Object.keys(control.errors)
        if(keys.length > 0) {
          const data = {
            errorType: keys,
            field: name,
            message: showErrors(keys[0])
          }
          errors.push(data)
        }
      }
    }
  });
  return errors
}

// Rellenamos el objeto de errores con sus repectivos mensajes
export function fillErrors(errorsObject: any, errorsArray:any[]) {
  errorsArray.forEach(error => {
    errorsObject[error.field] = error.message
  })
}

// Compara si el value de dos FormGroup son iguales
export function areSameObject(firstObject:any, secondObject:any) {
  // Obtener las claves de los objetos
  const keys1 = Object.keys(firstObject);
  const keys2 = Object.keys(secondObject);
  // Verificar si el número de claves es el mismo
  if (keys1.length !== keys2.length) {
      return false;
  }
  // Verificar si todas las claves de obj1 están en obj2 y tienen los mismos valores
  for (let key of keys1) {
      if (!keys2.includes(key) || firstObject[key] !== secondObject[key]) {
          return false;
      }
  }
  return true;
}

export function areSamePassword(value1:string, value2: string) {
  if(value1 === value2) {
    return {equals: true, message: ''}
  } else {
    return {equals: false, message: 'Contraseñas no coinciden'}
  }
}

// Validamos los campos y mostramos sus mensajes de error, podemos excluir campos
export function validateFields(formGroup: FormGroup, errors: any, optionals:any = []) {
  clearErrors(errors)
  let validationErrors = evaluateFieldsExcept(formGroup, optionals)
  // Rellenamos los campos de errores
  fillErrors(errors, validationErrors)
  return {
    valid: validationErrors.length === 0,
    errors: validationErrors
  }
}

// Limpiar errores de objeto con mensajes de errores
export function clearErrors(errorsObj:any) {
  const props = Object.keys(errorsObj)
  for (let i = 0; i < props.length; i++) {
      errorsObj[props[i]] = ''
  }
}

// Generar un FormData para enviar archivos
export function getFormData(formRef: ElementRef) {
  const form = formRef.nativeElement as HTMLFormElement;
  return new FormData(form)
}

export function validateFile(event: any, formGroup: FormGroup, errors: any, attrName: string) {
  if(event.target.files.length > 0) {
    const file = event.target.files[0]
    const splited = file.name.split('.');
    const ext = splited[splited.length - 1]
    if(!validExtensions.includes(ext)) {
      formGroup.get(attrName)?.reset()
      errors[attrName] = 'Formato de imagen no es valido'
    } else {
      errors[attrName] = ''
      return file
    }
  }
}

export function getDateFormat(date: string) {
  return date.split('T')[0]
}

export function ellipsis(value: string, limit: number): string {
  if (value.length <= limit) {
    return value;
  }
  return value.substring(0, limit) + '...';
}
