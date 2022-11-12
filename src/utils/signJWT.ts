/* eslint-disable @typescript-eslint/no-non-null-assertion */
import jwt from 'jsonwebtoken'

import { UserEntity } from '../database/entities'
type signJWTFunction = (user: UserEntity, callback: (error: Error | null, token: string | null, expiresIn?: number) => void) => void

export const signJWT: signJWTFunction = (user, callback) => {
  const { TOKEN_EXPIRETIME, TOKEN_SECRET, TOKEN_ISSUER } = process.env

  if (TOKEN_EXPIRETIME && TOKEN_SECRET && TOKEN_ISSUER) {
    callback(new Error('Environment variable undefined'), null)
    return
  }

  const timeSinceEpoch = new Date().getTime()
  const expiresIn = timeSinceEpoch + Number(TOKEN_EXPIRETIME!) * 100
  const secret = TOKEN_SECRET!
  const issuer = TOKEN_ISSUER!
  const algorithm = 'HS256'

  try {
    jwt.sign(
      {
        username: user.username
      },
      secret,
      {
        issuer,
        algorithm,
        expiresIn
      },
      (error, token) => {
        if (error != null)callback(error, null)

        if (token)callback(null, token, expiresIn)
      }
    )
  } catch (error: any) {
    callback(error, null)
  }
}
