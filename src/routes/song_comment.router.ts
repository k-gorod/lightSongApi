import { Router } from 'express'

import { ISongCommentController } from '../types'

export const createSongCommentRouter = (router: Router, SongCommentController: ISongCommentController): Router => {
  router.post('/add', SongCommentController.add)
  router.get('/get-all', SongCommentController.getAll!)
  router.get('/get', SongCommentController.get!)
  router.delete('/delete', SongCommentController.delete!)
  router.put('/update', SongCommentController.update!)

  return router
}
