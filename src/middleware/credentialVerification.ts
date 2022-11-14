import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export const credentialVerification = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1]
  const secret = process.env.TOKEN_SECRET

  if (secret) {
    if (token) {
      jwt.verify(token, secret, (error, decoded) => {
        if (error != null) {
          res.status(404).json(error)
        } else {
          res.locals.jwt = decoded
          console.log(decoded)
          next()
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
