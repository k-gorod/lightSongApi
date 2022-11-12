import { Router } from 'express'

import { ISongController } from '../types'

export const createSongRouter = (router: Router, songController: ISongController): Router => {
  router.post('/add-song', songController.addSong)
  router.get('/get-all-songs', songController.getAllSongs)
  router.get('/:id', songController.getSong)

  return router
}
