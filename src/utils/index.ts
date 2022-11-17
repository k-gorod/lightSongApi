import { Song, UserEntity } from '../database/entities'

export { signJWT } from './signJWT'

export const removeUserPassword = (user: UserEntity): any => {
  const { password, ...theResrOfTheData } = user
  return theResrOfTheData
}

export const excludeFields = (object: { [key: string]: any }, excludeList: string[]): any => {
  return Object.entries(object).reduce((acc, [key, value]) => excludeList.some(el => el === key) ? acc : { ...acc, [key]: value }, {})
}

export const getMinskTime = (): Date => {
  const date = new Date()
  date.setTime(Date.now() + (3 * 60 * 60 * 1000))

  return date
}

type ArrIdNumbers = Array<{ id: number }>

export const getSongListIds = (idArray: string[]): ArrIdNumbers => {
  return idArray.reduce<ArrIdNumbers>((acc: ArrIdNumbers, id: string) => ([...acc, { id: Number(id) }]), [])
}

type objectWithIds = Array<{ id: number }>

export const extractReqiredSongs = (requestSonglist: objectWithIds, dbSonglist: objectWithIds): objectWithIds => {
  return requestSonglist.reduce<objectWithIds>((acc, reqSong) => {
    return (
      dbSonglist.some((songFormDb: { id: number }) => songFormDb.id === reqSong.id) ? acc : [...acc, { id: reqSong.id }]
    )
  }, [])
}

export const extractExistingSongs = (requestSonglist: objectWithIds, dbSonglist: Song[]): Song[] => {
  return dbSonglist.reduce<Song[]>((acc, dbSong) => {
    return requestSonglist.some((reqSong) => Number(reqSong.id) === Number(dbSong.id)) ? [...acc, dbSong] : acc
  }, [])
}
