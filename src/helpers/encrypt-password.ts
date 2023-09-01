import { createHash } from 'crypto'
import { env } from '../resources/env'

export function encryptPassword(password: string) {
  return createHash('sha256')
    .update(`${password}-${env.USER_PASSWORD_SECRET}`)
    .digest('hex')
}
