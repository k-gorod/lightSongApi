import { IPlaylistController } from '@types'
import { NextFunction, Request, Response } from 'express'
import { Repository } from 'typeorm'

import { SongComment, Song, UserEntity } from '../database/entities'
// import { getMinskTime } from '../utils'

export class PlaylistController implements IPlaylistController {
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

  create = (req: Request, res: Response, next: NextFunction): void => {
    console.log('create')
    res.status(501).json({
      message: 'create'
    })
  }

  get = (req: Request, res: Response, next: NextFunction): void => {
    console.log('get')
    res.status(501).json({
      message: 'get'
    })
  }

  getAll = (req: Request, res: Response, next: NextFunction): void => {
    console.log('getAll')
    res.status(501).json({
      message: 'getAll'
    })
  }

  update = (req: Request, res: Response, next: NextFunction): void => {
    console.log('update')
    res.status(501).json({
      message: 'update'
    })
  }

  delete = (req: Request, res: Response, next: NextFunction): void => {
    console.log('delete')
    res.status(501).json({
      message: 'delete'
    })
  }
}
