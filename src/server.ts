require("dotenv").config()

import { SongRouter, UserRouter } from './routes';
import express from 'express';
import session from 'express-session';
import { UserController } from './controllers';
import { SongRepository, UserRepository } from './database/repositories';
import { extractJWT } from './middleware/extractJWT';
import { SongController } from './controllers/SongController';
import { UserEntity } from './database/entities';


declare module 'express-session' {
    interface SessionData {
        user: UserEntity
    }
}

const userRouterInstance = express.Router();
const songRouterInstance = express.Router();

const app = express();
const PORT = 4444;
const userController = new UserController(UserRepository);
const songController = new SongController(SongRepository);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

app.use(session({
    secret: "sectet-key-todo",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 1 },
}))

app.use('/', userRouterInstance);
app.use('/songs', extractJWT, songRouterInstance);

app.use((req, res, next) => {
    const error = new Error('Not found');

    res.status(404).json({
        message: error.message
    });
});


UserRouter(userRouterInstance, userController);
SongRouter(songRouterInstance, songController);

app.listen(PORT, () => {
    console.log(`Server listening ${PORT} port`)
})



