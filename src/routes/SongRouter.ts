import { Router } from 'express';
import { IUserController } from '../controllers/types';
import { extractJWT } from '../middleware/extractJWT';

export const SongRouter = (router: Router, userController: any ): void => {
    router.get("/", (req,res)=>{
        return res.json({
            message: `Welcome to ${process.env.APP_HOST} - lightUp song API`,
            session: req.session
        })
    })
}
