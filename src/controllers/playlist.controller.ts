import { IPlaylistController } from '@types'
import { NextFunction, Request, Response } from 'express'
import { Repository } from 'typeorm'

import { Song, UserEntity, Playlist } from '../database/entities'
import { deleteHandler, extractExistingSongs, extractReqiredSongs, getSongListIds } from '../utils'
// import { getMinskTime } from '../utils'

export class PlaylistController implements IPlaylistController {
  constructor (
    userRepository: Repository<UserEntity>,
    songRepository: Repository<Song>,
    playlistRepository: Repository<Playlist>
  ) {
    this.songRepository = songRepository
    this.userRepository = userRepository
    this.playlistRepository = playlistRepository
  }

  private readonly userRepository: Repository<UserEntity>
  private readonly songRepository: Repository<Song>
  private readonly playlistRepository: Repository<Playlist>

  create = (req: Request, res: Response, next: NextFunction): void => {
    const { name, isPrivat, tags, description, songs } = req.body

    if (req.session.user) {
      this.userRepository.find({
        where: {
          id: req.session.user.id
        }
      })
        .then(([createdBy]) => {
          this.songRepository.find({
            where: getSongListIds(songs)
          })
            .then(songlist => {
              this.playlistRepository.save({
                name,
                isPrivat,
                tags,
                description,
                songlist,
                createdBy
              })
                .then((dbAnswer) =>
                  res.status(201).json({
                    message: 'Playlist created'
                  })
                )
                .catch((err) => {
                  res.status(400).json({
                    message: 'Could not create playlist',
                    err
                  })
                })
            }).catch((err) => {
              res.status(500).json({
                message: 'DB failure while getting songs',
                err
              })
            })
        })
        .catch((err) => {
          res.status(401).json({
            message: 'Could not find user. Update session',
            err
          })
        })
    } else {
      res.status(501).json({
        message: 'Login please. Session storing not implemented'
      })
    }
  }

  get = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.query.id) {
      res.status(400).json({
        message: 'Provide id after ? sign'
      })
    }
    this.playlistRepository.find({
      where: {
        id: Number(req.query.id)
      }
    })
      .then((foundPlaylists) => {
        if (foundPlaylists.length === 1) {
          res.status(200).json({
            playlist: foundPlaylists[0]
          })
        } else {
          res.status(404).json({
            message: 'Could not find appropriate playlist. Check provided data'
          })
        }
      })
      .catch((err) => {
        res.status(500).json({
          message: 'Unable to get Playlist',
          err
        })
      })
  }

  getAll = (req: Request, res: Response, next: NextFunction): void => {
    this.playlistRepository.find({
      relations: ['createdBy', 'songlist', 'likedBy']
    })
      .then((playlists) => {
        res.status(200).json({
          playlists
        })
      })
      .catch((err) => {
        res.status(500).json({
          message: 'Unable to get Playlists',
          err
        })
      })
  }

  update = (req: Request, res: Response, next: NextFunction): void => {
    const { id, name, isPrivat, tags, description, likedBy, songlist } = req.body

    this.playlistRepository.findOne({
      where: {
        id: Number(id)
      },
      relations: ['likedBy', 'songlist']
    })
      .then((playlist) => {
        if (playlist != null) {
          this.userRepository.findOne({
            where: {
              id: likedBy ? Number(likedBy.id) : 0
            }
          })
            .then((user) => {
              const songsToAdd = extractReqiredSongs(songlist, playlist.songlist)
              const existingSongs = extractExistingSongs(songlist, playlist.songlist) // left only existing in database songs

              const updatePlaylist = (newSongs: Song[] = []): void => {
                playlist.name = name ?? playlist.name
                playlist.isPrivat = isPrivat ?? playlist.isPrivat
                playlist.tags = tags ?? playlist.tags
                playlist.description = description ?? playlist.description
                playlist.songlist = [...existingSongs, ...newSongs]
                playlist.likedBy = user ? [...playlist.likedBy!, user] : playlist.likedBy

                this.playlistRepository.save(playlist)
                  .then(() => {
                    res.status(200).json({
                      message: 'Playlist Updated'
                    })
                  })
                  .catch((error) => {
                    res.status(400).json({
                      message: 'Playlist update failure',
                      error
                    })
                  })
              }

              if (songsToAdd.length === 0) {
                updatePlaylist()
              } else {
                this.songRepository.find({
                  where: songsToAdd
                })
                  .then((newSongs) => {
                    updatePlaylist(newSongs)
                  })
                  .catch((error) => {
                    res.status(500).json({
                      message: 'Could not get songs',
                      error
                    })
                  })
              }
            })
            .catch(() => {
              res.status(400).json({
                message: 'User serach error'
              })
            })
        } else {
          res.status(400).json({
            message: 'Invalid playlist ID'
          })
        }
      })
      .catch((error) => {
        res.status(400).json({
          message: 'Could not find Playlist',
          error
        })
      })
  }

  delete = (req: Request, res: Response, next: NextFunction): void => {
    deleteHandler(req, res, this.playlistRepository)
  }
}
