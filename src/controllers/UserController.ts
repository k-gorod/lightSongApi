import { IUserController } from '@types'
import bcryptjs from 'bcryptjs'
import { Request, Response, NextFunction } from 'express'
import { Repository } from 'typeorm'

import { UserEntity } from '../database/entities'
import { excludeFields, signJWT } from '../utils'

export class UserController implements IUserController {
  constructor (userRepository: Repository<UserEntity>) {
    this.userRepository = userRepository
  }

  private readonly userRepository: Repository<UserEntity>

  validateToken = (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      message: 'Authorized'
    })
  }

  register = (req: Request, res: Response, next: NextFunction): void => {
    const { username, password } = req.body
    bcryptjs.hash(password, 12, (hashError, hash) => {
      // Wrong error type implementation. hashError can be undefined:
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (hashError) {
        return res.status(500).json(hashError)
      }

      const user = new UserEntity()
      user.username = username
      user.password = hash
      user.role = 'user'
      user.lastSingIn = new Date()

      this.userRepository.save(user)
        .then(() =>
          res.status(201).json({
            message: 'User successfully registered'
          })
        ).catch((err) =>
          res.status(401).json({
            message: 'Registration failed',
            error: err
          })
        )
    })
  }

  getAllUsers = (req: Request, res: Response, next: NextFunction): void => {
    this.userRepository.find({
      select: {
        id: true,
        username: true,
        songsAdded: {
          id: true,
          title: true
        }
      },
      relations: { songsAdded: true }
    })
      .then((users) => {
        const returnData = users.reduce<Array<{}>>((acc, user) => {
          const userData = excludeFields(user, ['password'])
          return [...acc, userData]
        }, [])

        return res.status(200)
          .json({
            data: returnData
          })
      }).catch(() => {
        res.status(401).json({
          message: 'Unable to get users'
        })
      })
  }

  login = (req: Request, res: Response, next: NextFunction): void => {
    const { username, password } = req.body

    const handleUnauthorazedError = (message?: string): Response => {
      return res.status(401).json({
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        message: message ?? 'Unauthorazed'
      })
    }

    this.userRepository.find({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        createdAt: true,
        lastSingIn: true,
        songsAdded: true,
        role: true
      }
    })
      .then((users) => {
        if (users.length !== 1) {
          handleUnauthorazedError()
        }

        bcryptjs.compare(password, users[0].password, (error, result) => {
          if (error) {
            handleUnauthorazedError()
          }

          if (result) {
            signJWT(users[0], (error, token, expiresIn) => {
              if (error != null) {
                handleUnauthorazedError(error.message)
              }

              if (token) {
                // user.lastSingIn = new Date()  UPDATE LAST SIGN IN
                req.session.user = users[0]
                return res.status(200).json({
                  message: 'Authorization successful',
                  auth: {
                    token,
                    expiresIn
                  },
                  user: excludeFields(users[0], ['password', 'createdAt', 'updatedAt', 'id'])
                })
              }
            })
          }
        })
      }).catch((err) => {
        handleUnauthorazedError(err.message)
      })
  }
}
