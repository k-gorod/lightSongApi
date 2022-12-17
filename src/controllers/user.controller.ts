import { IUserController } from '@types'
import bcryptjs from 'bcryptjs'
import { Request, Response } from 'express'
import { Repository } from 'typeorm'

import { UserEntity } from '../database/entities'
import { getMinskTime, signJWT, handleExclusion, deleteHandler, permissionToRepository, postRequestSelection, hashString } from '../utils'

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
    const { login, password } = req.body
    hashString(password)
      .then((hash) => {
        const user = new UserEntity()
        user.login = login
        user.username = login
        user.password = hash
        user.role = 'member'

        this.userRepository.save(user)
          .then((user) =>
            res.status(201).json({
              message: 'User successfully registered',
              data: {
                id: user.id,
                login: user.login
              }
            })
          )
          .catch((error) =>
            handleExclusion(res)({
              status: 401,
              message: 'Registration failed',
              error
            })
          )
      })
      .catch((error) => {
        handleExclusion(res)({
          status: 500,
          error
        })
      })
  }

  getAll = (req: Request, res: Response): void => {
    if (req.session.user?.role !== 'admin') {
      handleExclusion(res)({
        status: 403,
        message: 'Permission denied'
      })

      return
    }

    this.userRepository.find({
      relations: ['songsAdded', 'comments', 'createdPlaylists', 'likedPlaylists'],
      order: {
        id: 'ASC'
      }
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

  signOut = (req: Request, res: Response): void => {
    delete res.locals.jwt
    delete req.session.user

    // implement token reset

    res.status(200).json({
      message: 'Logout successful'
    })
  }

  signIn = (req: Request, res: Response): void => {
    if (!req?.body?.login || !req?.body?.password) {
      handleExclusion(res)({
        status: 400,
        message: 'Provide correct data'
      })

      return
    }

    const { login, password } = req.body

    this.userRepository.findOne({
      where: { login },
      select: {
        id: true,
        login: true,
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
      .then((user) => {
        if (!user) {
          handleExclusion(res)({
            status: 401,
            message: 'Wrong login'
          })
          return
        }

        bcryptjs.compare(password, user.password, (error, result) => { // TODO Promise
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

              if (!token) {
                handleExclusion(res)({
                  status: 401,
                  message: 'Token creation failure'
                })
                return
              }

              this.userRepository.save({
                id: user.id,
                lastSingIn: getMinskTime()
              })
                .then(() => {
                  req.session.user = user

                  const data = postRequestSelection(user, {
                    id: true,
                    login: true,
                    username: true,
                    role: true
                  })

                  return res.status(200).json({
                    message: 'Authorization successful',
                    auth: {
                      token,
                      expiresIn
                    },
                    user: data
                  })
                })
                .catch((error) =>
                  handleExclusion(res)({
                    status: 502,
                    message: '502: Database error',
                    error
                  })
                )
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

    if (!req.session.user) {
      handleExclusion(res)({
        status: 501,
        message: 'Session issue'
      })
      return
    }

    const { id: sessionId, role } = req.session.user

    const roleOrOwner =
    +sessionId === +req?.query?.id
      ? 'owner'
      : role as string

    const select = permissionToRepository(roleOrOwner)({
      guest: {
        id: true,
        username: true,
        createdAt: true,
        lastSingIn: true
      },
      member: {
        songsAdded: true,
        createdPlaylists: true,
        likedPlaylists: true
      },
      owner: {
        login: true,
        role: true,
        config: true,
        comments: true
      }
    })

    const relations = permissionToRepository(roleOrOwner)({
      member: {
        songsAdded: true,
        createdPlaylists: true,
        likedPlaylists: true
      },
      owner: {
        comments: true
      }
    })

    this.userRepository.findOne({
      select,
      relations,
      where: {
        id: Number(req.query.id)
      }
    })
      .then((user) => {
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

  // deleteMyownAccount = (req: Request, res: Response): void => {}

  update = (req: Request, res: Response): void => {
    if (!req?.query?.id) {
      handleExclusion(res)({
        status: 400,
        message: 'Provide id after ? sign'
      })
      return
    }

    if (!req.session.user) {
      handleExclusion(res)({
        status: 501,
        message: 'Session issue'
      })
      return
    }

    this.userRepository.findOne({
      where: {
        id: req.session.user.id
      }
    })
      .then((currentUser) => {
        if (!currentUser) {
          handleExclusion(res)({
            status: 401,
            message: 'Unauthorized'
          })
          return
        }

        if ((Number(currentUser.id) !== Number(req?.query?.id) && currentUser.role !== 'admin')) {
          handleExclusion(res)({
            status: 403,
            message: 'Permission denied'
          })
          return
        }

        this.userRepository.findOne({
          where: {
            id: Number(req.query.id)
          }
        })
          .then((targetUser) => {
            if (!targetUser) {
              handleExclusion(res)({
                status: 404,
                message: 'User not found'
              })
              return
            }

            if (targetUser.role === 'admin') {
              handleExclusion(res)({
                status: 403,
                message: 'Permission denied'
              })
              return
            }

            const { password, username, role, config } = req.body

            const updateUser = (hashedPassword?: any): void => {
              targetUser.password = hashedPassword ?? targetUser.password
              targetUser.username = username ?? targetUser.username
              targetUser.config = config ?? targetUser.config

              if (targetUser.role === 'admin') {
                targetUser.role = role ?? targetUser.role
              }

              this.userRepository.save(targetUser)
                .then(() => {
                  res.status(200).json({
                    message: 'Updated successfully',
                    data: targetUser
                  })
                })
                .catch((error) => {
                  handleExclusion(res)({
                    status: 403,
                    message: 'Unable to update',
                    error
                  })
                })
            }

            if (password) {
              hashString(password)
                .then((hash) => {
                  updateUser(hash)
                })
                .catch((error) => {
                  handleExclusion(res)({
                    status: 501,
                    message: 'Unable to hash password',
                    error
                  })
                })
            } else {
              updateUser()
            }
          })
          .catch((error) => {
            handleExclusion(res)({
              status: 501,
              message: 'Error: Unable to update',
              error
            })
          })
      })
      .catch((error) => {
        handleExclusion(res)({
          status: 501,
          message: 'Session issue',
          error
        })
      })
  }

  delete = (req: Request, res: Response): void => {
    if (req.session.user?.role !== 'admin') {
      handleExclusion(res)({
        status: 403,
        message: 'Permission denied'
      })

      return
    }

    deleteHandler(req, res, this.userRepository)
  }
}
