import { UserEntity } from "../database/entities";
import jwt from "jsonwebtoken"
type signJWTFunction = (user: UserEntity, callback: (error: Error | null, token: string | null, expiresIn?: number) => void ) => void

export const signJWT: signJWTFunction = (user, callback ) => {
    const timeSinceEpoch = new Date().getTime();

    const expiresIn = timeSinceEpoch + Number(process.env.TOKEN_EXPIRETIME!) * 100
    const secret = process.env.TOKEN_SECRET!;
    const issuer = process.env.TOKEN_ISSUER!;
    const algorithm = "HS256" 


    try{

        jwt.sign(
        {
            username: user.username
        },
        secret,
        {
            issuer,
            algorithm,
            expiresIn
        },
        (error, token)=>{
            if(error)callback(error, null);
            
            if(token)callback(null, token, expiresIn);
        }
        )
    }catch(error){
        callback(error as Error, null);
    }
}