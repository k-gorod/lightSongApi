import { UserEntity } from "../database/entities"
import { Repository} from "typeorm";
import { Request, Response, NextFunction } from "express";
import bcryptjs from "bcryptjs"
import { excludeFields, removeUserPassword, signJWT } from "../utils";
import { IUserController } from "@types";


export class UserController implements IUserController {
    constructor(userRepository: Repository<UserEntity>){
        this.userRepository = userRepository;
    }

    private readonly userRepository: Repository<UserEntity>;

    validateToken = (req: Request, res: Response, next: NextFunction) => {
        return res.status(200).json({
            message: "Authorized"
        })
    }

    register = (req: Request, res: Response, next: NextFunction) => {
        const { username, password } = req.body;
        bcryptjs.hash(password, 12, (hashError, hash)=>{
            if(hashError){
                return res.status(500).json(hashError)
            }
            
            const user = new UserEntity();
            user.username = username;
            user.password = hash;
            user.role = "user";

            this.userRepository.save(user)
                .then(()=>{
                    return res.status(201).json({
                        message: `${username} successfully registered`
                    });
                })
        })
        
    }

    getAllUsers = (req: Request, res: Response, next: NextFunction) => {
        this.userRepository.find({})
            .then((users)=>{
                const returnData = users.reduce<{}[]>((acc, user) => {
                    const userData = excludeFields(user, ["password"])
                    return [...acc, userData]
                }, [])

                return res.status(200)
                        .json({
                            data: returnData
                        })
            }).catch(()=>{
                res.status(401).json({
                    message: "Unable to get users"
                })
            })
    }

    login = (req: Request, res: Response, next: NextFunction) => {
        const { username, password } = req.body;

        const handleUnauthorazedError = (message?: string) => {
            return res.status(401).json({
                message: message || "Unauthorazed"
            })
        }

        this.userRepository.find({
            where: { username }
        })
            .then((users)=>{
                if(users.length !== 1) {
                    handleUnauthorazedError()
                }

                bcryptjs.compare(password, users[0].password, (error, result) => {
                    if(error) {
                        handleUnauthorazedError()
                    }

                    if(result) {
                        signJWT(users[0], (error, token, expiresIn) => {
                            if(error) {
                                handleUnauthorazedError(error.message)
                            }

                            if(token) {
                                req.session.user = users[0];
                                return res.status(200).json({
                                    message: "Authorization successful",
                                    auth: {
                                        token,
                                        expiresIn
                                    },
                                    user: excludeFields(users[0], ["password", "createdAt", "updatedAt", "id"])
                                })
                            }

                        })
                    }
                })
            }).catch((err)=>{
                handleUnauthorazedError(err.message)
            })
    }
        
}