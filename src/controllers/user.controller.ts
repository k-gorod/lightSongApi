import { IUserController } from '@types'
import bcryptjs from 'bcryptjs'
import { Request, Response } from 'express'
import { Repository } from 'typeorm'

import { UserEntity } from '../database/entities'
import { excludeFields, getMinskTime, signJWT, handleExclusion, deleteHandler } from '../utils'

export class UserController implements IUserController {
  constructor (userRepository: Repository<UserEntity>) {
    this.userRepository = userRepository
  }

  private readonly userRepository: Repository<UserEntity>

  validateToken = (req: Request, res: Response): void => {
    // todo
    res.status(200).json({
      message: 'Authorized'
    })
  }

  register = (req: Request, res: Response): void => {
    const { username, password } = req.body
    bcryptjs.hash(password, 12, (error, hash) => {
      if (error) {
        handleExclusion(res)({
          status: 500,
          error
        })
        return
      }

      const user = new UserEntity()
      user.username = username
      user.password = hash
      user.role = 'user'

      this.userRepository.save(user)
        .then((user) =>
          res.status(201).json({
            message: 'UserEntity successfully registered',
            data: user
          })
        ).catch((error) =>
          handleExclusion(res)({
            status: 401,
            message: 'Registration failed',
            error
          })
        )
    })
  }

  getAll = (req: Request, res: Response): void => {
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
        if (users.length < 1) {
          handleExclusion(res)({
            status: 404,
            message: 'There is no users'
          })
          return
        }

        res.status(200).json(users)
      }
      ).catch((error) => {
        handleExclusion(res)({
          status: 401,
          message: 'Unable to get users',
          error
        })
      })
  }

  logout = (req: Request, res: Response): void => {
    delete res.locals.jwt
    delete req.session.user

    // implement token reset

    res.status(200).json({
      message: 'Logout successful'
    })
  }

  login = (req: Request, res: Response): void => {
    const { username, password } = req.body

    this.userRepository.find({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        createdAt: true,
        lastSingIn: true,
        songsAdded: true,
        role: true,
        config: {
          darkMode: true
        }
      }
    })
      .then((users) => {
        if (users.length !== 1) {
          handleExclusion(res)({
            status: 401,
            message: 'Wrong username'
          })
          return
        }

        const [user] = users

        /**
         * add db token storing
         * Mb it is doesn't needed
         */
        // if (req.session.user && user.id === req.session.user.id) {
        //   return res.status(200).json({
        //     message: 'Username already logged in',
        //     auth: {
        //       dbtoken,
        //       req.session.user.expiresIn
        //     },
        //     user: excludeFields(user, ['password', 'createdAt', 'updatedAt', 'id'])
        //   })
        // }

        bcryptjs.compare(password, user.password, (error, result) => {
          if (error) {
            handleExclusion(res)({
              status: 401,
              message: error.message,
              error
            })
            return
          }

          if (result) {
            signJWT(user, (error, token, expiresIn) => {
              if (error != null) {
                handleExclusion(res)({
                  status: 401,
                  message: error.message,
                  error
                })
                return
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
                      user: excludeFields(user, ['password', 'createdAt', 'updatedAt'])
                    })
                  })
                  .catch((error) =>
                    handleExclusion(res)({
                      status: 502,
                      message: '502: Database error',
                      error
                    })
                  )
              }
            })
          } else {
            handleExclusion(res)({
              status: 400,
              message: 'Wrong password'
            })
          }
        })
      }).catch((error) => {
        handleExclusion(res)({
          status: 502,
          message: error.message,
          error
        })
      })
  }

  get = (req: Request, res: Response): void => {
    if (!req?.query?.id) {
      handleExclusion(res)({
        status: 400,
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
        lastSingIn: true,
        config: {
          darkMode: true
        }
      },
      relations: ['songsAdded', 'comments'],
      where: {
        id: Number(id)
      }
    })
      .then(([user]) => {
        if (!user) {
          handleExclusion(res)({
            status: 400,
            message: 'Could not find user'
          })
        }

        res.status(200).json(user)
      }
      ).catch((error) =>
        handleExclusion(res)({
          status: 401,
          message: 'Could not find user',
          error
        })
      )
  }

  delete = (req: Request, res: Response): void => {
    deleteHandler(req, res, this.userRepository)
  }
}
