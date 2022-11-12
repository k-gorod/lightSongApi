import express from 'express'
import session from 'express-session'

require('dotenv').config()

import { UserController, SongController, SongCommentController } from './controllers'
import { SongRepository, UserRepository, SongCommentRepository } from './database/repositories'
import { credentialVerification } from './middleware/credentialVerification'
import { createUserRouter, createSongRouter, createSongCommentRouter } from './routes'

const app = express()
const PORT = 4444

const userController = new UserController(UserRepository)
const songController = new SongController(UserRepository, SongRepository)
const commentController = new SongCommentController(UserRepository, SongRepository, SongCommentRepository)

const userRouter = createUserRouter(express.Router(), userController)
const songRouter = createSongRouter(express.Router(), songController)
const songCommentRouter = createSongCommentRouter(express.Router(), commentController)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
    return res.status(200).json({})
  }

  next()
})

app.use(session({
  secret: 'sectet-key-todo',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 1 }
}))

app.use('/', userRouter)
// app.use('/songs', songRouter);
app.use('/songs', credentialVerification, songRouter)
app.use('/comments', songCommentRouter)

app.use((req, res, next) => {
  const error = new Error('Not found')

  res.status(404).json({
    message: error.message
  })
})

app.listen(PORT, () => {
  console.log(`Server listening ${PORT} port`)
})
