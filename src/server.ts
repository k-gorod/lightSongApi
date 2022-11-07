
// import { ProductService } from './service/index';
// import { productRepository } from './DA/repositories/productRepository';
import { UserRouter } from './routes';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
// import LocalStrategy from 'passport-local';
import { UserService } from './service/UserService';
import { UserRepository } from './database/repositories';

const router = express.Router();
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', router);
app.use(session({
    secret: "sectet-key-to-do",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
// app.use(new LocalStrategy(
//     (username, password, authCheckDone)=>{

//     }
// ));

UserRouter(router, new UserService(UserRepository));


app.listen(PORT, () => {
    console.log(`Server listening ${PORT} port`)
})


// import connectDataBase from './DA';

// import dotenv from 'dotenv';
// dotenv.config();


// export const connection = connectDataBase();

