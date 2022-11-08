import { UserEntity } from '../database/entities';

export { signJWT } from './signJWT';

export const removeUserPassword = (user: UserEntity) => {
    const { password, ...theResrOfTheData} = user;
    return theResrOfTheData;
}