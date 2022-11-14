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
      user.createdAt = getMinskTime()

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
          handleUnauthorazedError('Wrong username')
        }

        bcryptjs.compare(password, users[0].password, (error, result) => {
          if (error) {
            handleUnauthorazedError('Wrong password')
          }

          if (result) {
            signJWT(users[0], (error, token, expiresIn) => {
              if (error != null) {
                handleUnauthorazedError(error.message)
              }

              if (token) {
                this.userRepository.save({
                  id: users[0].id,
                  lastSingIn: getMinskTime()
                })
                  .then(() => {
                    req.session.user = users[0]
                    return res.status(200).json({
                      message: 'Authorization successful',
                      auth: {
                        token,
                        expiresIn
                      },
                      user: excludeFields(users[0], ['password', 'createdAt', 'updatedAt', 'id'])
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

  getUserById = (req: Request, res: Response): void => {
    if (!req.params.id) res.status(400).json({ message: 'Provide user id as url parameter' })
    this.userRepository.find({
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
        createdAt: true,
        lastSingIn: true
      },
      relations: ['songsAdded'],
      where: {
        id: Number(req.params.id)
      }
    })
      .then(([user]) =>
        res.status(404).json(user)
      ).catch((error) =>
        res.status(502).json({ message: 'Could not find user', error })
      )
  }
}
