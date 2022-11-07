import { UserEntity } from "../database/entities"
import { Repository} from "typeorm";

export class UserService  {
    constructor(userRepository: Repository<UserEntity>){
        this.userRepository = userRepository;
    }

    private readonly userRepository: Repository<UserEntity>;

    getAll = () => {
        return this.userRepository.find({})
    }

    addUser = async () => {
        const user = new UserEntity()
        user.username = "Timber"
        user.password = "Saw"
        const response = await this.userRepository.save(user)
        return response;
    }
}