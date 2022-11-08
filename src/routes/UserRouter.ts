import { Router } from 'express';
import { IUserController } from '../controllers/types';
import { extractJWT } from '../middleware/extractJWT';

export const UserRouter = (router: Router, userController: IUserController ): void => {
    router.get("/", (_,res)=>{
        return res.json({
            message: `Welcome to ${process.env.APP_HOST} - lightUp song API`
        })
    })
    router.get("/validate", extractJWT, userController.validateToken)
    router.post("/register", userController.register)
    router.post("/login", userController.login)
    router.get("/get-all", userController.getAllUsers)
}
