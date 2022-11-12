import { Request, Response, NextFunction } from 'express'
import { Repository } from 'typeorm'

import { SongEntity, UserEntity } from '../database/entities'
import { ISongController } from '../types'

export class SongController implements ISongController {
  constructor (
    songRepository: Repository<SongEntity>,
    userRepository: Repository<UserEntity>
  ) {
    this.songRepository = songRepository
    this.userRepository = userRepository
  }

  private readonly songRepository: Repository<SongEntity>
  private readonly userRepository: Repository<UserEntity>

  addSong = (req: Request, res: Response, next: NextFunction): void => {
    const { title, lyrics, chords, description } = req.body

    const song = new SongEntity()
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
      relationLoadStrategy: 'join',
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
        }
      },
      relations: ['createdBy']
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
}
