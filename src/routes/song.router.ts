import { Router } from 'express'

import { ISongController } from '../types'

export const createSongRouter = (router: Router, songController: ISongController): Router => {
  router.post('/add', songController.create!)
  router.get('/get-all', songController.getAll!)
  router.get('/get', songController.get!)
  router.put('/update', songController.update!)
  router.delete('/delete', songController.delete!)

  return router
}
