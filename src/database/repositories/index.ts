import { AppDataSource } from '..'
import { UserEntity, Song, SongComment, Playlist } from '../entities'

export const UserRepository = AppDataSource.getRepository(UserEntity)
export const SongRepository = AppDataSource.getRepository(Song)
export const SongCommentRepository = AppDataSource.getRepository(SongComment)
export const PlaylistRepository = AppDataSource.getRepository(Playlist)
