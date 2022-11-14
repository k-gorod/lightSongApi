import { AppDataSource } from '..'
import { UserEntity, Song, SongComment } from '../entities'

export const UserRepository = AppDataSource.getRepository(UserEntity)
export const SongRepository = AppDataSource.getRepository(Song)
export const SongCommentRepository = AppDataSource.getRepository(SongComment)
