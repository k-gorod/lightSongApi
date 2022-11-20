import { ISongCommentController } from '@types'
import { NextFunction, Request, Response } from 'express'
import { Repository } from 'typeorm'

import { SongComment, Song, UserEntity } from '../database/entities'
import { getMinskTime } from '../utils'

export class SongCommentController implements ISongCommentController {
  constructor (
    userRepository: Repository<UserEntity>,
    songRepository: Repository<Song>,
    songCommentRepository: Repository<SongComment>
  ) {
    this.songRepository = songRepository
    this.userRepository = userRepository
    this.songCommentRepository = songCommentRepository
  }

  private readonly userRepository: Repository<UserEntity>
  private readonly songRepository: Repository<Song>
  private readonly songCommentRepository: Repository<SongComment>

  /**
   * Here is async - await implementation example
   */
  addSongComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { songId, text } = req.body
    if (!req.session.user) {
      res.status(401).json({
        message: '401: Unauthorized'
      })
      return
    }

    if (!songId || !text) {
      res.status(400).json({
        message: '400: Invalid data provided'
      })
      return
    }

    const [targetSong] = await this.songRepository.find({
      where: {
        id: Number(songId)
      }
    })

    if (!targetSong) {
      res.status(502).json({ message: 'Could not find song' })
      return
    }

    const [currentUser] = await this.userRepository.find({
      where: {
        id: req.session.user.id
      }
    })

    if (!currentUser) {
      res.status(502).json({ message: 'Could not find song' })
      return
    }

    const comment = new SongComment()

    comment.author = currentUser
    comment.song = targetSong
    comment.text = text
    comment.createdAt = getMinskTime()

    const addCommentResponse = await this.songCommentRepository.save(comment)

    if (addCommentResponse) {
      res.status(201).json({
        message: 'SongComment posted'
      })
    } else {
      res.status(502).json({ message: 'SongComment not being posted' })
    }
  }

  getAllComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    this.songCommentRepository.find({
      relations: ['author', 'song']
    })
      .then((data) => {
        res.status(200).json(data)
      }).catch((error) => {
        res.status(401).json(error)
      })
  }
}
