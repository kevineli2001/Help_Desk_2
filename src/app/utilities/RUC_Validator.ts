const provinces = [
  {"code":1,	"province":"Azuay"},
  {"code":2,	"province":"Bolivar"},
  {"code":3, "province":"Cañar"},
  {"code":4, "province":"Carchi"},
  {"code":5, "province":"Cotopaxi"},
  {"code":6, "province":"Chimborazo"},
  {"code":7, "province":"El Oro"},
  {"code":8, "province":"Esmeraldas"},
  {"code":9, "province":"Guayas"},
  {"code":10, "province":"Imbabura"},
  {"code":11, "province":"Loja"},
  {"code":12, "province":"Los Rios"},
  {"code":13, "province":"Manabi"},
  {"code":14, "province":"Morona Santiago"},
  {"code":15, "province":"Napo"},
  {"code":16, "province":"Pastaza"},
  {"code":17, "province":"Pichincha"},
  {"code":18, "province":"Tungurahua"},
  {"code":19, "province":"Zamora Chinchipe"},
  {"code":20, "province":"Galapagos"},
  {"code":21, "province":"Sucumbios"},
  {"code":22, "province":"Orellana"},
  {"code":23, "province":"Santo Domingo de los Tsachilas"},
  {"code":24, "province":"Santa Elena"},
  {"code":30, "province":"Extranjero"}
]

interface Data { isValid: boolean, data?: {type: string, province?: {code: number, province: string}}}

const RUC_TYPES: any = {
  private: {
    type: 'SOCIEDAD PRIVADA O EXTRANJERO NO RESIDENTE (SIN CÉDULA DE IDENTIDIAD)',
    digits: [9]
  },
  public: {
    type: 'SOCIEDAD PÚBLICA',
    digits: [6]
  },
  natural: {
    type: 'PERSONA NATURAL',
    digits: [0, 1, 2, 3, 4, 5, 6]
  },
}

export function validateRUC(ruc: string) {
  if(validatePrivateRUC(ruc).isValid){
    return validatePrivateRUC(ruc)
  }
  if(validatePublicRUC(ruc).isValid) {
    return validatePublicRUC(ruc)
  }
  if(validateNaturalRUC(ruc).isValid) {
    return validateNaturalRUC(ruc)
  }

  return { isValid: false }
}

export function validateRUCType(thirdDigit: number) {
  let keys = Object.keys(RUC_TYPES)
  for(let key of keys) {
    let found = RUC_TYPES[key].digits.includes(thirdDigit)
    if(found) {return RUC_TYPES[key].type}
  }
}

function validateProvinceCode(code: string) {
  try {
    return provinces.find((province) => province.code = parseInt(code))
  } catch(err) {
    return
  }
}

function validateNaturalRUC(ruc: string) {
    // Preparamos la data que devolveremos
    const result: Data = { isValid: false }
    try {
      // Parseamos para detectar letras
      parseInt(ruc)
      // Validamos que el ruc exista y no sea vacio
      if(!ruc || ruc === '') { return result }
      // Verificamos que tenga los 13 digitos
      if(ruc.length !== 13) { return result }
      // Validamos que los 3 ultimos digitos sean 001
      if(ruc.substring(10, 13) !== '001') { return result }
      // Buscamos el codigo de la provincia
      let privinceCode = validateProvinceCode(ruc.substring(0, 2))
      // Si no existe ese codigo entonces retornamos
      if(!privinceCode) { return result }
      // Validamos que sea una cédula valida
      if(validateCEDULA(ruc.substring(0, 10))) {
        // Extraemos el tercer digito
        let thirdDigit = parseInt(ruc.substring(2,3))
        result.isValid = true,
        result.data = {
          type: validateRUCType(thirdDigit),
          province: privinceCode
        }
      }
      return result
    } catch(err) {
      return result
    }
}

function validatePublicRUC(ruc: string) {
    // Preparamos la data que devolveremos
    const result:Data = { isValid: false }
    try {
      // Parseamos para detectar letras
      parseInt(ruc)
      // Validamos que el ruc exista y no sea vacio
      if(!ruc || ruc === '') { return result }
      // Verificamos que tenga los 13 digitos
      if(ruc.length !== 13) { return result }
      // Validamos que los 3 ultimos digitos sean 001
      if(ruc.substring(10, 13) !== '001') { return result }
      // Buscamos el codigo de la provincia
      let privinceCode = validateProvinceCode(ruc.substring(0, 2))
      // Si no existe ese codigo entonces retornamos
      if(!privinceCode) { return result }
      // Extramos el digito verificador
      let verifierDigit = parseInt(ruc.substring(8, 9))
       // Creamos arreglo multiplicador para los digitos
      let multipliers = [3, 2, 7, 6, 5, 4, 3, 2]
      // Creamos un acumulador
      let summation = 0
      // Recorremos los digitos y los vamos multiplicando
      for (let i = 0; i < multipliers.length; i++) {
        //console.log(parseInt(ruc[i]), multipliers[i])
        let product = parseInt(ruc[i]) * multipliers[i]
        // Vamos sumando los productos obtenidos
        summation += product
      }
      // Definimos el modulo
      const module = 11
      // Dividimos para verificar si es multiplo de 10
      let remainder = summation % module
      if(remainder !== 0) { remainder = module - remainder }
      if(remainder === verifierDigit) {
        // Extraemos el tercer digito
        let thirdDigit = parseInt(ruc.substring(2,3))
        result.isValid = true,
        result.data = {
          type: validateRUCType(thirdDigit),
          province: privinceCode
        }
      }
      return result
    } catch(err) {
      return result
    }
}

function validatePrivateRUC(ruc: string) {
    // Preparamos la data que devolveremos
    const result:Data = { isValid: false }
    try {
      // Parseamos para detectar letras
      parseInt(ruc)
      // Validamos que el ruc exista y no sea vacio
      if(!ruc || ruc === '') { return result }
      // Verificamos que tenga los 13 digitos
      if(ruc.length !== 13) { return result }
      // Validamos que los 3 ultimos digitos sean 001
      if(ruc.substring(10, 13) !== '001') { return result }
      // Buscamos el codigo de la provincia
      let privinceCode = validateProvinceCode(ruc.substring(0, 2))
      // Si no existe ese codigo entonces retornamos
      if(!privinceCode) { return result }
      // Extramos el digito verificador
      let verifierDigit = parseInt(ruc.substring(9, 10))
       // Creamos arreglo multiplicador para los digitos
      let multipliers = [4, 3, 2, 7, 6, 5, 4, 3, 2]
      // Creamos un acumulador
      let summation = 0
      // Recorremos los digitos y los vamos multiplicando
      for (let i = 0; i < multipliers.length; i++) {
        //console.log(parseInt(ruc[i]), multipliers[i])
        let product = parseInt(ruc[i]) * multipliers[i]
        // Vamos sumando los productos obtenidos
        summation += product
      }
      // Definimos el modulo
      const module = 11
      // Dividimos para verificar si es multiplo de 10
      let remainder = summation % module
      if(remainder !== 0) { remainder = module - remainder }
      if(remainder === verifierDigit) {
        // Extraemos el tercer digito
        let thirdDigit = parseInt(ruc.substring(2,3))
        result.isValid = true,
        result.data = {
          type: validateRUCType(thirdDigit),
          province: privinceCode
        }
      }
      return result
    } catch(err) {
      return result
    }
}

export function validateCEDULA(cedula: string) {
  try {
    // Parseamos para verificar que se trate de un número sin letras
    parseInt(cedula)
    // Verificamos que tenga 10 digitos
    if(cedula.length !== 10) {return false}
    // Validamos que tenga el codigo de la provincia
    let provinceCode = validateProvinceCode(cedula.substring(0, 2))
    // Si el codigo no pertenece a ninguna provincia retornamos falso
    if(!provinceCode) { return false}
    // Extramos el digito verificador
    let verifierDigit = parseInt(cedula.substring(9, 10))
    // Creamos arreglo multiplicador para los digitos
    let multipliers = [2, 1, 2, 1, 2, 1, 2, 1, 2]
    // Creamos un acumulador
    let summation = 0
    // Recorremos los digitos y los vamos multiplicando
    for (let i = 0; i < multipliers.length; i++) {
      let product = parseInt(cedula[i]) * multipliers[i]
      if(product > 9) { product -= 9 }
      // Vamos sumando los productos obtenidos
      summation += product
    }
    // Definimos el modulo
    const module = 10
    // Dividimos para verificar si es multiplo de 10
    let residuo = summation % module
    // Definimos el digito encontrado como 0
    let foundDigit = 0
    // Actualizamos el digito encontrado si es el residuo diferente de 0
    if(residuo !== 0) { foundDigit = 10 - residuo }
    return foundDigit === verifierDigit

  } catch(err) {
    return false
  }
}


/* let rucNatural = '1207253087001'
let rucPrivada = '1790085783001'
let rucPublico = '1760001040001'
validateRUC(rucPrivada)
validateRUC(rucPublico)
validateRUC(rucNatural)
 */



