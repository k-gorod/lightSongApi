import { UserEntity } from '../database/entities'

export { signJWT } from './signJWT'

export const removeUserPassword = (user: UserEntity): any => {
  const { password, ...theResrOfTheData } = user
  return theResrOfTheData
}

export const excludeFields = (object: { [key: string]: any }, excludeList: string[]): any => {
  return Object.entries(object).reduce((acc, [key, value]) => excludeList.some(el => el === key) ? acc : { ...acc, [key]: value }, {})
}
