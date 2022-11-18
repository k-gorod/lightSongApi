import { NextFunction, Request, Response } from 'express'

type controllerMethodType = (req: Request, res: Response, next: NextFunction) => void

interface abstractController {
  create?: controllerMethodType
  get?: controllerMethodType
  getAll?: controllerMethodType
  update?: controllerMethodType
  delete?: controllerMethodType
}

export interface IUserController extends abstractController {
  validateToken: controllerMethodType
  register: controllerMethodType
  login: controllerMethodType
  logout: controllerMethodType
}

export interface ISongController extends abstractController {}

export interface ISongCommentController extends abstractController {
  add: controllerMethodType
}

export interface IPlaylistController extends abstractController {}
