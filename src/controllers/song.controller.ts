import { Request, Response, NextFunction } from 'express'
import { Repository } from 'typeorm'

import { Song, UserEntity } from '../database/entities'
import { ISongController } from '../types'
import { deleteHandler, handleExclusion, permissionToRepository, postRequestSelection } from '../utils'

export class SongController implements ISongController {
  constructor (
    userRepository: Repository<UserEntity>,
    songRepository: Repository<Song>
  ) {
    this.songRepository = songRepository
    this.userRepository = userRepository
  }

  private readonly songRepository: Repository<Song>
  private readonly userRepository: Repository<UserEntity>

  create = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session.user) {
      handleExclusion(res)({
        status: 501,
        message: 'Session issue'
      })
      return
    }

    if (req.session.user?.role === 'guest') {
      handleExclusion(res)({
        status: 403,
        message: 'Permission denied'
      })
      return
    }

    if (!req.session.user?.id) {
      handleExclusion(res)({
        status: 401,
        message: '401: Unauthorized'
      })
      return
    }

    this.userRepository.findOne({
      where: { id: req.session.user.id }
    })
      .then((user) => {
        if (!user) {
          handleExclusion(res)({
            status: 404,
            message: 'User not found. Sign-in please'
          })
          return
        }

        const { title, lyrics, chords, description, songAuthor } = req.body
        const song = new Song()

        song.updatedBy = user
        song.createdBy = user
        song.title = title
        song.songAuthor = songAuthor
        song.lyrics = lyrics
        song.chords = chords
        song.description = description

        this.songRepository.save(song)
          .then((song) =>
            res.status(201).json({
              message: 'Song being added',
              data: song
            })
          ).catch((error) =>
            handleExclusion(res)({
              status: 500,
              message: '500: Could not add this song',
              error
            })
          )
      }).catch((error) =>
        handleExclusion(res)({
          status: 404,
          message: '404: Could not find user',
          error
        })
      )
  }

  getAll = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session.user) {
      handleExclusion(res)({
        status: 501,
        message: 'Session issue'
      })
      return
    }

    const { role } = req.session.user

    const select = permissionToRepository(role)({
      guest: {
        id: true,
        songAuthor: true,
        title: true,
        lyrics: true,
        chords: true,
        description: true,
        createdAt: true
      },
      member: {
        updatedAt: true,
        comments: true,
        createdBy: {
          id: true,
          username: true
        },
        updatedBy: {
          id: true,
          username: true
        },
        usedInPlaylists: true
      }
    })

    const relations = permissionToRepository(role)({
      member: {
        comments: true,
        createdBy: true,
        updatedBy: true,
        usedInPlaylists: true
      }
    })

    this.songRepository.find({
      select,
      relations,
      order: {
        songAuthor: 'ASC',
        comments: {
          createdAt: 'ASC'
        }
      }
    })
      .then((songList) => {
        res.status(200).json(songList)
      }).catch((error) => {
        handleExclusion(res)({
          status: 502,
          message: '502: Something went wrong',
          error
        })
      })
  }

  get = (req: Request, res: Response, next: NextFunction): void => {
    if (!req?.query?.id) {
      handleExclusion(res)({
        status: 400,
        message: 'Provid correct id after ? sign'
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

    const relations = permissionToRepository(req.session.user?.role)({
      guest: {
        comments: {
          author: true
        },
        createdBy: true
      },
      member: {
        usedInPlaylists: true
      },
      owner: {
        updatedBy: true
      }
    })

    this.songRepository.findOne({
      select: {
        createdBy: {
          id: true,
          username: true
        },
        comments: {
          id: true,
          text: true,
          createdAt: true,
          author: {
            id: true,
            username: true
          },
          commentReplyId: true
        }
      },
      where: {
        id: Number(req?.query?.id)
      },
      relations,
      order: {
        comments: {
          createdAt: 'ASC'
        }
      }
    })
      .then((foundSong) => {
        if (!foundSong) {
          handleExclusion(res)({
            status: 400,
            message: 'Provid correct id after ? sign'
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
          +sessionId === +foundSong.createdBy!.id
            ? 'owner'
            : role as string

        const chooseDataRelatingToRole = permissionToRepository(roleOrOwner)({
          guest: {
            id: true,
            songAuthor: true,
            title: true,
            lyrics: true,
            chords: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            comments: true,
            createdBy: true
          },
          member: {
            usedInPlaylists: true
          },
          owner: {
            updatedBy: true
          }
        })

        const data = postRequestSelection(foundSong, chooseDataRelatingToRole)

        res.status(200).json(data)
      })
      .catch((error) => {
        handleExclusion(res)({
          status: 401,
          message: 'Database bad request. Try to check provided data',
          error
        })
      })
  }

  update = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session.user) {
      handleExclusion(res)({
        status: 501,
        message: 'Session issue'
      })
      return
    }

    const { id: sessionId, role } = req.session.user

    if (role === 'guest') {
      handleExclusion(res)({
        status: 403,
        message: 'Permission denied'
      })
      return
    }

    this.songRepository.findOne({
      select: {
        createdBy: {
          id: true
        }
      },
      where: {
        id: Number(req.body.id)
      },
      relations: {
        createdBy: true
      }
    })
      .then((song) => {
        if (!song) {
          handleExclusion(res)({
            status: 400,
            message: 'Invalid song ID'
          })
          return
        }

        const { songAuthor, title, lyrics, chords, description } = req.body

        if (song.createdBy?.id !== sessionId && role !== 'admin') {
          handleExclusion(res)({
            status: 403,
            message: 'Permission denied. You should be song owner'
          })
          return
        }

        song.songAuthor = songAuthor ?? song.songAuthor
        song.title = title ?? song.title
        song.lyrics = lyrics ?? song.lyrics
        song.chords = chords ?? song.chords
        song.description = description ?? song.description
        song.updatedBy = req.session.user

        this.songRepository.save(song)
          .then((song) => {
            res.status(200).json({
              message: 'Song Updated',
              data: song
            })
          })
          .catch((error) => {
            handleExclusion(res)({
              status: 400,
              message: 'Song update failure',
              error
            })
          })
      })
      .catch((error) => {
        handleExclusion(res)({
          status: 400,
          message: 'Could not find appropriate Song',
          error
        })
      })
  }

  // ownerDeletion (req: Request, res: Response, next: NextFunction): void => {}

  delete = (req: Request, res: Response, next: NextFunction): void => {
    if (req.session.user?.role !== 'admin') {
      handleExclusion(res)({
        status: 403,
        message: 'Permission denied'
      })

      return
    }

    deleteHandler(req, res, this.songRepository)
  }
}
