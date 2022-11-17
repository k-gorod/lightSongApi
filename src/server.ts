import express from 'express'
import session from 'express-session'

require('dotenv').config()

import { UserController, SongController, SongCommentController } from './controllers'
import { PlaylistController } from './controllers/playlist.controller'
import { SongRepository, UserRepository, SongCommentRepository, PlaylistRepository } from './database/repositories'
import { credentialVerification } from './middleware/credentialVerification'
import { createUserRouter, createSongRouter, createSongCommentRouter } from './routes'
import { createPlaylistRouter } from './routes/playlist.router'

const app = express()
const PORT = 4444

const userController = new UserController(UserRepository)
const songController = new SongController(UserRepository, SongRepository)
const commentController = new SongCommentController(UserRepository, SongRepository, SongCommentRepository)
const playlistController = new PlaylistController(UserRepository, SongRepository, PlaylistRepository)

const userRouter = createUserRouter(express.Router(), userController)
const songRouter = createSongRouter(express.Router(), songController)
const songCommentRouter = createSongCommentRouter(express.Router(), commentController)
const playlistRouter = createPlaylistRouter(express.Router(), playlistController)

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
app.use('/song', credentialVerification, songRouter)
app.use('/comment', songCommentRouter)
app.use('/playlist', playlistRouter)

app.use((req, res, next) => {
  const error = new Error('Wrong route')

  res.status(404).json({
    message: error.message
  })
})

app.listen(PORT, () => {
  console.log(`Server listening ${PORT} port`)
})
