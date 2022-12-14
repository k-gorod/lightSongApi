import { Song, UserEntity } from '../database/entities'

export { signJWT } from './signJWT'
export { permissionToRepository } from './permissionToRepository'

import { Entities } from '@types'
import bcryptjs from 'bcryptjs'
import { Request, Response } from 'express'
import { Repository } from 'typeorm'

export const removeUserPassword = (user: UserEntity): any => {
  const { password, ...theResrOfTheData } = user
  return theResrOfTheData
}

export const excludeFields = (object: any, excludeList: any): any => {
  return Object.entries(object).reduce((acc, [key, value]) => excludeList.some((el: any) => el === key) ? acc : { ...acc, [key]: value }, {})
}

export const postRequestSelection = (object: any, selectList: any): any => {
  return Object.entries(selectList).reduce((acc, [key, value]) => {
    if (value === true) {
      return { ...acc, [key]: object[key] }
    } else if (Array.isArray(object[key])) {
      return value ? { ...acc, [key]: object[key].map((el: any) => postRequestSelection(el, value)) } : acc
    } else {
      return object[key] ? { ...acc, [key]: postRequestSelection(object[key], value) } : acc
    }
  }, {})
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

export const handleExclusion = (
  res: Response
) => ({
  message = 'Bad request',
  error = {},
  status = 404
}) => {
  res.status(status).json({
    status,
    message,
    error
  })
}

export const deleteHandler = (req: Request, res: Response, repository: Repository<Entities>): void => {
  if (!req?.body?.targetItems) {
    res.status(400).json({
      message: 'Provide array of IDs'
    })
    return
  }

  const { targetItems } = req.body

  repository.find({
    where: targetItems.map((id: number | string) => ({ id: Number(id) }))
  })
    .then((foundPlaylists) => {
      if (foundPlaylists.length < 1) {
        handleExclusion(res)({
          status: 404,
          message: 'Could not find any item'
        })
        return
      }

      repository
        .remove(foundPlaylists)
        .then((deletedItems) => {
          res.status(200).json({
            message: 'Deleted',
            count: deletedItems.length
          })
        })
        .catch((error) => {
          handleExclusion(res)({
            status: 400,
            message: 'Something went wrong. Unable to deleted',
            error
          })
        })
    })
    .catch((error) => {
      handleExclusion(res)({
        status: 400,
        message: 'Something went wrong. Unable to find',
        error
      })
    })
}

export const hashString = async (string: string): Promise<string> => {
  return await new Promise((resolve, reject) => {
    bcryptjs.hash(string, 12, (error, hash) => {
      if (error) {
        reject(error)
      } else {
        resolve(hash)
      }
    })
  })
}
