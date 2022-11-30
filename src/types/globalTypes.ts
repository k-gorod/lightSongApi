import { UserEntity } from '../database/entities'

declare module 'express-session' {
  interface SessionData {
    user: UserEntity
  }
}
