export const FORM_ACTIONS = {
  ADD: 'Nuevo',
  UPDATE: 'Editar'
}

// Estado de los paquetes, debe coincidir con la base de datos
export const PACKAGE_STATUS = {
  ENABLED: 1,
  DISABLED: 2
}
const URI_TEST = 'http://localhost:4000/api/'
const URI = 'https://render-test-3ut5.onrender.com/api'
export const SERVER = URI

export const ROUTES_API = {
  auth: SERVER + '/auth/',
  users: SERVER + '/users/',
  statuses: SERVER + '/statuses/',
  providers: SERVER + '/providers/',
  invoices: SERVER + '/invoices/',
  categories: SERVER + '/categories/',
  inventory: SERVER + '/inventory/',
  images: SERVER + '/uploads/',
  refreshToken: () => ROUTES_API.auth + 'refresh-token'
}

export const SYSTEM_NAME = 'HELP DESK'

export const validExtensions = ['jpg', 'jpeg', 'png']
