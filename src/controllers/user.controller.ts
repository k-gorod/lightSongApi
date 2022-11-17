import { IUserController } from '@types'
import bcryptjs from 'bcryptjs'
import { Request, Response } from 'express'
import { Repository } from 'typeorm'

import { UserEntity } from '../database/entities'
import { excludeFields, getMinskTime, signJWT } from '../utils'

export class UserController implements IUserController {
  constructor (userRepository: Repository<UserEntity>) {
    this.userRepository = userRepository
  }

  private readonly userRepository: Repository<UserEntity>

  validateToken = (req: Request, res: Response): void => {
    res.status(200).json({
      message: 'Authorized'
    })
  }

  register = (req: Request, res: Response): void => {
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

      this.userRepository.save(user)
        .then(() =>
          res.status(201).json({
            message: 'UserEntity successfully registered'
          })
        ).catch((err) =>
          res.status(401).json({
            message: 'Registration failed',
            error: err
          })
        )
    })
  }

  getAllUsers = (req: Request, res: Response): void => {
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
        return res.status(200)
          .json({
            data: users
          })
      }).catch(() => {
        res.status(401).json({
          message: 'Unable to get users'
        })
      })
  }

  login = (req: Request, res: Response): void => {
    const { username, password } = req.body

    const handleUnauthorazedError = (message?: string): Response => {
      return res.status(401).json({
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
          return handleUnauthorazedError('Wrong username')
        }

        const [user] = users

        bcryptjs.compare(password, user.password, (error, result) => {
          if (error) {
            return handleUnauthorazedError('Wrong password')
          }

          if (result) {
            signJWT(user, (error, token, expiresIn) => {
              if (error != null) {
                return handleUnauthorazedError(error.message)
              }

              if (token) {
                this.userRepository.save({
                  id: user.id,
                  lastSingIn: getMinskTime()
                })
                  .then(() => {
                    req.session.user = user
                    return res.status(200).json({
                      message: 'Authorization successful',
                      auth: {
                        token,
                        expiresIn
                      },
                      user: excludeFields(user, ['password', 'createdAt', 'updatedAt', 'id'])
                    })
                  })
                  .catch((error) =>
                    res.status(502)
                      .json({ message: '502: Database error', error })
                  )
              }
            })
          }
        })
      }).catch((err) => {
        handleUnauthorazedError(err.message)
      })
  }

  get = (req: Request, res: Response): void => {
    if (!req.query || !req.query.id) {
      res.status(400).json({
        message: 'Provide id after ? sign'
      })
      return
    }

    const { id } = req.query

    this.userRepository.find({
      select: {
        id: true,
        username: true,
        createdAt: true,
        lastSingIn: true
      },
      relations: ['songsAdded', 'comments'],
      where: {
        id: Number(id)
      }
    })
      .then(([user]) =>
        res.status(404).json(user)
      ).catch((error) =>
        res.status(502).json({ message: 'Could not find user', error })
      )
  }
}
