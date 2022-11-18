import { Request, Response, NextFunction } from 'express'
import { Repository } from 'typeorm'

import { Song, UserEntity } from '../database/entities'
import { ISongController } from '../types'
import { deleteHandler, getMinskTime, handleExclusion } from '../utils'

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
    const { title, lyrics, chords, description } = req.body

    const song = new Song()

    if (!req.session.user) {
      handleExclusion(res)({
        status: 401,
        message: '401: Unauthorized'
      })
      return
    }

    this.userRepository.find({
      where: { id: req.session.user.id }
    })
      .then(([user]) => {
        song.updatedBy = user
        song.createdBy = user

        song.title = title
        song.lyrics = lyrics
        song.chords = chords
        song.description = description
        song.createdAt = getMinskTime()
        song.updatedAt = getMinskTime()

        this.songRepository.save(song)
          .then(() =>
            res.status(201).json({
              message: 'Song being added'
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
    this.songRepository.find({
      select: {
        id: true,
        songAuthor: true,
        title: true,
        lyrics: true,
        chords: true,
        description: true,
        createdAt: true,
        createdBy: {
          id: true,
          username: true
        },
        comments: true
      },
      relations: ['createdBy', 'comments'],
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
    if (!req.query || !req.query.id) {
      handleExclusion(res)({
        status: 400,
        message: 'Provid correct id after ? sign'
      })
      return
    }

    const { id } = req.query

    this.songRepository.find({
      select: {
        id: true,
        songAuthor: true,
        title: true,
        lyrics: true,
        chords: true,
        description: true,
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
        id: Number(id)
      },
      relations: ['createdBy', 'comments'],
      order: {
        comments: {
          createdAt: 'ASC'
        }
      }
    })
      .then((foundSongs) => {
        if (foundSongs.length === 1) {
          res.status(200).json(foundSongs)
        } else {
          handleExclusion(res)({
            status: 400,
            message: 'Provid correct id after ? sign'
          })
        }
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
    const { id, songAuthor, title, lyrics, chords, description } = req.body // and updatedBy

    this.songRepository.findOne({
      where: {
        id: Number(id)
      }
    })
      .then((song) => {
        if (song != null) {
          song.songAuthor = songAuthor ?? song.songAuthor
          song.title = title ?? song.title
          song.lyrics = lyrics ?? song.lyrics
          song.chords = chords ?? song.chords
          song.description = description ?? song.description

          this.songRepository.save(song)
            .then(() => {
              res.status(200).json({
                message: 'Song Updated'
              })
            })
            .catch((error) => {
              handleExclusion(res)({
                status: 400,
                message: 'Song update failure',
                error
              })
            })
        } else {
          handleExclusion(res)({
            status: 400,
            message: 'Invalid song ID'
          })
        }
      })
      .catch((error) => {
        handleExclusion(res)({
          status: 400,
          message: 'Could not find appropriate Song',
          error
        })
      })
  }

  delete = (req: Request, res: Response, next: NextFunction): void => {
    deleteHandler(req, res, this.songRepository)
  }
}
