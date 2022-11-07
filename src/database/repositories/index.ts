import { AppDataSource } from "..";
import { UserEntity } from "../entities";

export const UserRepository = AppDataSource.getRepository(UserEntity);