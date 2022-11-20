import { NextFunction, Request, Response } from 'express'

export interface IUserController {
  validateToken: (req: Request, res: Response, next: NextFunction) => void
  register: (req: Request, res: Response, next: NextFunction) => void
  login: (req: Request, res: Response, next: NextFunction) => void
  logout: (req: Request, res: Response, next: NextFunction) => void
  getAllUsers: (req: Request, res: Response, next: NextFunction) => void
  get: (req: Request, res: Response, next: NextFunction) => void
}

export interface ISongController {
  create: (req: Request, res: Response, next: NextFunction) => void
  getAllSongs: (req: Request, res: Response, next: NextFunction) => void
  get: (req: Request, res: Response, next: NextFunction) => void
}

export interface ISongCommentController {
  getAllComments: (req: Request, res: Response, next: NextFunction) => void
  addSongComment: (req: Request, res: Response, next: NextFunction) => void
}

export interface IPlaylistController {
  create: (req: Request, res: Response, next: NextFunction) => void
  get: (req: Request, res: Response, next: NextFunction) => void
  getAll: (req: Request, res: Response, next: NextFunction) => void
  update: (req: Request, res: Response, next: NextFunction) => void
  delete: (req: Request, res: Response, next: NextFunction) => void
}
