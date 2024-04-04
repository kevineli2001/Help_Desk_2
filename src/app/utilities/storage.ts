import { UserData } from "../interfaces/user.interface";

export const StorageData = {
  key: 'help-desk',
  initial: (): UserData => ({name: '', lastname: '', token:'', role: '', refreshToken: '', roleName: ''}),
  find: () => {
    const storage = localStorage.getItem(StorageData.key)
    // Verificamos si existe esa clave en el storage
    if(!storage) { return { exists: false, data: null} }
    // Parseamos la data obtenida
    let data = JSON.parse(storage)
    // Si es indefinido retornamos false
    if(!data){ return { exists: false, data: null} }
    // Validamos que tenga las propiedades esperadas
    let keys = Object.keys(StorageData.initial())
    for(let key of keys) {
      if(!(key in data)) {return { exists: false, data: null} }
    }
    // Retornamos la data
    return { exists: true, data }
  },
  set: (data: UserData) => {
    localStorage.setItem(StorageData.key, JSON.stringify(data))
  },
  remove: () => localStorage.removeItem(StorageData.key),
  get: () => {
    let find = StorageData.find()
    if(find.exists) {
      return find.data
    }
    return null
  }
}
