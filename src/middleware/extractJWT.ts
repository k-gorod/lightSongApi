import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'

export const extractJWT = (req: Request, res: Response, next: NextFunction) => {

    const token = req.headers.authorization?.split(' ')[1];
    const secret = process.env.TOKEN_SECRET!

    if(token){
        jwt.verify(token, secret, (error, decoded)=>{
            if(error){
                return res.status(404).json(error)
            } else {
                res.locals.jwt = decoded
                next()
            }
        })
    } else {
        return res.status(401).json({
            message: "Unauthorized"
        })
    }
}
