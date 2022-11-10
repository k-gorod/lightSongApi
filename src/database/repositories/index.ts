import { AppDataSource } from "..";
import { UserEntity } from "../entities";
import { SongEntity } from "../entities/SongEntity";

export const UserRepository = AppDataSource.getRepository(UserEntity);
export const SongRepository = AppDataSource.getRepository(SongEntity);