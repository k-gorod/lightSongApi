import { Router } from 'express'

import { ISongCommentController } from '../types'

export const createSongCommentRouter = (router: Router, SongCommentController: ISongCommentController): Router => {
  router.post('/add', SongCommentController.addSongComment)
  router.get('/get-all', SongCommentController.getAllComments)

  return router
}