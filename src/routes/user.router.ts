import { IUserController } from '@types'
import { Router } from 'express'

import { credentialVerification } from '../middleware/credentialVerification'

export const createUserRouter = (router: Router, userController: IUserController): Router => {
  router.get('/', (req, res) => {
    res.status(200).send('Ok')
  })
  router.post('/register', userController.register)
  router.post('/sign-in', userController.signIn)
  router.post('/sign-out', userController.signOut)
  router.get('/validate', credentialVerification, userController.validateToken)
  router.get('/user/get-all', credentialVerification, userController.getAll!)
  router.get('/user/get', credentialVerification, userController.get!)
  router.delete('/user/delete', credentialVerification, userController.delete!)

  return router
}
