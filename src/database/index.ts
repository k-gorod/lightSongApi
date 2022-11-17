import 'reflect-metadata'
import { DataSource } from 'typeorm'
require('dotenv').config() // to correct exicute migrations

import { SongComment, Song, UserEntity, Playlist } from './entities'
// import * as Entities from './entities'

export const AppDataSource = new DataSource({
  name: 'default',
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [SongComment, Song, UserEntity, Playlist],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: false
})

AppDataSource.initialize()
  .then(() => {
    // start to work with your database
  })
  .catch((error) => console.log(error))
