import { NextFunction, Request, Response } from 'express'

export interface IUserController {
  validateToken: (req: Request, res: Response, next: NextFunction) => void
  register: (req: Request, res: Response, next: NextFunction) => void
  login: (req: Request, res: Response, next: NextFunction) => void
  getAllUsers: (req: Request, res: Response, next: NextFunction) => void
}

export interface ISongController {
  addSong: (req: Request, res: Response, next: NextFunction) => void
  getAllSongs: (req: Request, res: Response, next: NextFunction) => void
  getSong: (req: Request, res: Response, next: NextFunction) => void
}

export interface ISongCommentController {
  getAllComments: (req: Request, res: Response, next: NextFunction) => void
  addSongComment: (req: Request, res: Response, next: NextFunction) => void
}
