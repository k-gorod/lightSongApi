import { IUserController } from '@types'
import { Router } from 'express'

import { credentialVerification } from '../middleware/credentialVerification'

export const createUserRouter = (router: Router, userController: IUserController): Router => {
  router.get('/validate', credentialVerification, userController.validateToken)
  router.post('/register', userController.register)
  router.post('/login', userController.login)
  router.get('/get-all', userController.getAllUsers)

  return router
}
