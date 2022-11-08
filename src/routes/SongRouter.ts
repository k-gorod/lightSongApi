import { Router, Request } from 'express';

declare module 'express-session' {
    interface SessionData {
        user: number
    }
}

export const SongRouter = (router: Router, userController: any ): void => {
    router.get("/", (req: Request,res)=>{
        if((req.session).user) {
            req.session.user++
        }else {
            req.session.user = 1
        }
        return res.send({
            message: `Welcome to ${process.env.APP_HOST} - lightUp song API`,
            user: req.session.user
        })
    })
}
