import { ISongCommentController } from '@types'
import { NextFunction, Request, Response } from 'express'
import { Repository } from 'typeorm'

import { SongCommentEntity, SongEntity, UserEntity } from '../database/entities'
import { getMinskTime } from '../utils'

export class SongCommentController implements ISongCommentController {
  constructor (
    userRepository: Repository<UserEntity>,
    songRepository: Repository<SongEntity>,
    songCommentRepository: Repository<SongCommentEntity>
  ) {
    this.songRepository = songRepository
    this.userRepository = userRepository
    this.songCommentRepository = songCommentRepository
  }

  private readonly userRepository: Repository<UserEntity>
  private readonly songRepository: Repository<SongEntity>
  private readonly songCommentRepository: Repository<SongCommentEntity>

  /**
   * Here is async - await implementation example
   */
  addSongComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.session.user) {
      res.status(401).json({
        message: '401: Unauthorized'
      })
      return
    }

    if (!req.query.song) {
      res.status(400).json({
        message: '400: Provide song id'
      })
      return
    }

    const [targetSong] = await this.songRepository.find({
      where: {
        id: Number(req.query.song)
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

    const comment = new SongCommentEntity()

    comment.author = currentUser
    comment.song = targetSong
    comment.text = req.body.text
    comment.createdAt = getMinskTime()

    const addCommentResponse = await this.songCommentRepository.save(comment)

    if (addCommentResponse) {
      res.status(201).json({
        message: 'Comment posted'
      })
    } else {
      res.status(502).json({ message: 'Comment not being posted' })
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
