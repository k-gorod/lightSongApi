import { Router, Response, Request } from 'express';
import { UserEntity } from '../../database/entities';
// import UserService
type UserService = any

export const UserRouter = (router: Router, userService: UserService): void => {
    router.get("/get", async (req, res)=>{
        const data = await userService.getAll()
        res.status(200).send(data)
    })

    router.post("/add", async (req, res)=>{
        const data = await userService.addUser()
        res.status(200).send(data)
    })
}