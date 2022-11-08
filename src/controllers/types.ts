import { NextFunction, Request, Response } from "express";

export interface IUserController {
    validateToken: (req: Request, res: Response, next: NextFunction) => Response
    register: (req: Request, res: Response, next: NextFunction) => Response | void
    login: (req: Request, res: Response, next: NextFunction) => Response  | void
    getAllUsers: (req: Request, res: Response, next: NextFunction) => Response | void
}

