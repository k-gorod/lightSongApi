import { Request, Response, NextFunction } from 'express'
import { Repository } from 'typeorm'

import { Song, UserEntity } from '../database/entities'
import { ISongController } from '../types'
import { getMinskTime } from '../utils'

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
    if (req.session.user != null) {
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
              res.status(500).json({
                message: '500: Could not add this song',
                error
              })
            )
        }).catch((error) =>
          res.status(404).json({
            message: '404: Could not find user',
            error
          })
        )
    } else {
      res.status(401).json({
        message: '401: Unauthorized'
      })
    }
  }

  getAllSongs = (req: Request, res: Response, next: NextFunction): void => {
    this.songRepository.find({
      select: {
        id: true,
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
      relations: ['createdBy', 'comments']
    })
      .then((songList) => {
        return res.status(200).json(songList)
      }).catch((error) => {
        return res.status(502).json({
          message: '502: Something went wrong',
          error
        })
      })
  }

  get = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.query || !req.query.id) {
      res.status(400).json({
        message: 'Provide id after ? sign'
      })
      return
    }

    const { id } = req.query

    this.songRepository.find({
      select: {
        id: true,
        title: true,
        lyrics: true,
        chords: true,
        description: true,
        createdBy: {
          id: true,
          username: true
        },
        comments: {
          text: true,
          author: {
            id: true,
            username: true
          },
          createdAt: true
        }
      },
      where: {
        id: Number(id)
      },
      relations: ['createdBy', 'comments']
    })
      .then((foundSongs) => {
        if (foundSongs.length === 1) {
          res.status(200).json(foundSongs)
        } else {
          res.status(400).json({
            message: 'Provid correct id after ? sign'
          })
        }
      })
      .catch((error) => {
        res.status(401).json({
          message: 'Database bad request. Try to check provided data',
          error
        })
      })
  }
}
