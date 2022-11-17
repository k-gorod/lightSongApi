import { Router } from 'express'

import { ISongController } from '../types'

export const createSongRouter = (router: Router, songController: ISongController): Router => {
  router.post('/add', songController.create)
  router.get('/get-all', songController.getAllSongs)
  router.get('/get', songController.get)

  return router
}
