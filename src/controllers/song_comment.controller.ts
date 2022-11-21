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
      handleExclusion(res)({
        status: 401,
        message: '401: Unauthorized'
      })
      return
    }

    if (!songId || !text) {
      handleExclusion(res)({
        status: 400,
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
        handleExclusion(res)({
          status: 404,
          message: 'Could not find song'
        })
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
              handleExclusion(res)({
                status: 404,
                message: 'Could not find user'
              })
              return
            }

            const comment = new SongComment()

            comment.author = currentUser
            comment.song = targetSong
            comment.text = text
            comment.createdAt = getMinskTime()

            this.songCommentRepository.save(comment)
              .then((comment) => {
                res.status(201).json({
                  message: 'SongComment posted',
                  data: comment
                })
              })
              .catch((error) => {
                handleExclusion(res)({
                  status: 500,
                  message: 'SongComment not being posted',
                  error
                })
              })
          })
          .catch((error) => {
            handleExclusion(res)({
              status: 500,
              message: 'Could not find target user',
              error
            })
          })
      } else {
        // login please
      }
    }).catch(() => {})
  }

  get = (req: Request, res: Response, next: NextFunction): void => {
    if (!req?.query?.id) {
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

          return
        }

        res.status(200).json(fetchResponse)
      })
      .catch((error) => {
        handleExclusion(res)({
          status: 500,
          message: 'Could not find comment',
          error
        })
      })
  }

  getAll = (req: Request, res: Response, next: NextFunction): void => {
    this.songCommentRepository.find({
      relations: ['author', 'song']
    })
      .then((data) => {
        if (data.length < 1) {
          handleExclusion(res)({
            status: 404,
            message: 'There is no comments'
          })
          return
        }

        res.status(200).json(data)
      }).catch((error) => {
        handleExclusion(res)({
          status: 500,
          message: 'Could not find comments',
          error
        })
      })
  }

  update = (req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction): void => {
    if (!req?.body?.id) {
      handleExclusion(res)({
        status: 400,
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
          .then((songComment) => {
            res.status(200).json({
              message: 'Comment updated',
              data: songComment
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
