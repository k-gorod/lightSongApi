import { Router } from 'express'

import { IPlaylistController } from '../types'

export const createPlaylistRouter = (router: Router, PlaylistController: IPlaylistController): Router => {
  router.post('/create', PlaylistController.create!)
  router.get('/get-all', PlaylistController.getAll!)
  router.put('/update', PlaylistController.update!)
  router.delete('/delete', PlaylistController.delete!)
  router.get('/get', PlaylistController.get!)

  return router
}
