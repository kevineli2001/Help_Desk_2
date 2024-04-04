export interface UserData {
  name: string
  lastname: string,
  role: string,
  token: string|number,
  refreshToken: string,
  roleName: string
}

export type UserKey = keyof UserData
