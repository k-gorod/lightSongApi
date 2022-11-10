import { Router, Request } from 'express';
import { ISongController } from '../controllers/types';

// declare module 'express-session' {
//     interface SessionData {
//         user: number
//     }
// }

export const SongRouter = (router: Router, songController: ISongController ): void => {  // add ISongController
    // router.get("/", (req: Request,res)=>{
    //     if((req.session).user) {
    //         req.session.user++
    //     }else {
    //         req.session.user = 1
    //     }
    //     return res.send({
    //         message: `Welcome to ${process.env.APP_HOST} - lightUp song API`,
    //         user: req.session.user
    //     })
    // })
    router.post("/add-song", songController.addSong)
    
}
