import { IUserController } from '@types'
import { Router } from 'express'

import { credentialVerification } from '../middleware/credentialVerification'

export const createUserRouter = (router: Router, userController: IUserController): Router => {
  router.get('/', (req, res) => {
    res.status(200).send('Ok')
  })
  router.get('/validate', credentialVerification, userController.validateToken)
  router.post('/register', userController.register)
  router.post('/login', userController.login)
  router.post('/logout', userController.logout)
  router.get('/user/get-all', userController.getAll!)
  router.get('/user/get', userController.get!)
  router.delete('/user/delete', userController.delete!)

  return router
}
