import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

import { UserEntity } from '../database/entities'
import { UserRepository } from '../database/repositories'

export const credentialVerification = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1]
  const secret = process.env.TOKEN_SECRET

  if (secret) {
    if (token) {
      jwt.verify(token, secret, (error, decoded) => {
        if (error != null) {
          return res.status(404).json(error)
        } else if (!decoded) {
          return res.status(404).json({
            message: 'Decoding failure'
          })
        } else if (!(decoded as JwtPayload).expiresIn || (typeof decoded !== 'string' && Date.now() > decoded.expiresIn!)) {
          return res.status(404).json({
            message: 'No token or expired. Login please'
          })
        } else {
          res.locals.jwt = decoded

          UserRepository.findOne({
            where: {
              id: (decoded as JwtPayload).id
            }
          })
            .then((user) => {
              if (!req.session.user) {
                req.session.user = user as UserEntity
              }

              next()
            })
            .catch((error) => {
              console.log('dbError: ', error)
            })
        }
      })
    } else {
      res.status(401).json({
        message: 'Unauthorized'
      })
    }
  } else {
    res.status(404).json({
      message: 'Env variable  not found'
    })
  }
}
