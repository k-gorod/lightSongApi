import { ISongCommentController } from '@types'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { Repository } from 'typeorm'

import { SongComment, Song, UserEntity } from '../database/entities'
import { deleteHandler, getMinskTime, handleExclusion } from '../utils'

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

  add = (req: Request, res: Response, next: NextFunction): void => {
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

    this.songRepository.findOne({
      where: {
        id: Number(songId)
      }
    }).then((targetSong) => {
      if (!targetSong) {
        res.status(502).json({ message: 'Could not find song' })
        return
      }

      if (req.session.user) {
        this.userRepository.findOne({
          where: {
            id: req.session.user.id
          }
        })
          .then((currentUser) => {
            if (!currentUser) {
              res.status(502).json({ message: 'Could not find song' })
              return
            }

            const comment = new SongComment()

            comment.author = currentUser
            comment.song = targetSong
            comment.text = text
            comment.createdAt = getMinskTime()

            this.songCommentRepository.save(comment)
              .then(() => {
                res.status(201).json({
                  message: 'SongComment posted'
                })
              })
              .catch(() => {
                res.status(502).json({ message: 'SongComment not being posted' })
              })
          })
          .catch(() => {})
      } else {
        // login please
      }
    }).catch(() => {})
  }

  get = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.query || !req.query.id) {
      handleExclusion(res)({
        status: 401,
        message: 'Provide array of IDs'
      })
      return
    }

    const { id } = req.query

    this.songCommentRepository.findOne({
      where: {
        id: Number(id)
      }
    })
      .then((fetchResponse) => {
        if (!fetchResponse) {
          handleExclusion(res)({
            status: 404,
            message: 'Could not find comment'
          })
        }

        res.status(200).json(fetchResponse)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  getAll = (req: Request, res: Response, next: NextFunction): void => {
    this.songCommentRepository.find({
      relations: ['author', 'song']
    })
      .then((data) => {
        res.status(200).json(data)
      }).catch((error) => {
        res.status(401).json(error)
      })
  }

  update = (req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction): void => {
    if (!req.body || !req.body.id) {
      res.status(400).json({
        message: 'Provide array of IDs'
      })
      return
    }

    const { id, text, commentReplyId } = req.body

    this.songCommentRepository.findOne({
      where: {
        id: Number(id)
      }
    })
      .then((comment) => {
        if (!comment) {
          handleExclusion(res)({
            status: 404,
            message: 'Wrong id provided'
          })
          return
        }

        comment.text = text ?? comment.text
        comment.commentReplyId = commentReplyId ?? comment.commentReplyId

        this.songCommentRepository.save(comment)
          .then((fetchResponse) => {
            res.status(200).json({
              message: 'Comment updated',
              data: fetchResponse
            })
          })
          .catch((error) => {
            handleExclusion(res)({
              status: 401,
              message: 'Could not update comment',
              error
            })
          })
      })
      .catch((error) => {
        handleExclusion(res)({
          status: 404,
          message: 'Could not find song',
          error
        })
      })
  }

  delete = (req: Request, res: Response, next: NextFunction): void => {
    deleteHandler(req, res, this.songCommentRepository)
  }
}
