import { AppDataSource } from '..'
import { UserEntity, SongEntity } from '../entities'

export const UserRepository = AppDataSource.getRepository(UserEntity)
export const SongRepository = AppDataSource.getRepository(SongEntity)
// export const SongCommentRepository = AppDataSource.getRepository(SongCommentEntity);
