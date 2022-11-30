import { IPlaylistController } from '@types'
import { NextFunction, Request, Response } from 'express'
import { Repository } from 'typeorm'

import { Song, UserEntity, Playlist } from '../database/entities'
import { deleteHandler, extractExistingSongs, extractReqiredSongs, getSongListIds, handleExclusion, postRequestSelection } from '../utils'
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
    if (req.session.user?.role === 'guest') {
      handleExclusion(res)({
        status: 403,
        message: 'Permission denied'
      })
      return
    }

    if (!req.session.user?.id) {
      handleExclusion(res)({
        status: 501,
        message: 'Sign in please'
      })

      return
    }

    if (!req.body) {
      handleExclusion(res)({
        status: 400,
        message: 'Provide body'
      })

      return
    }

    const { name, isPrivat, tags, description, songs } = req.body

    this.userRepository.findOne({
      where: {
        id: req.session.user.id
      }
    })
      .then((createdBy) => {
        if (!createdBy) {
          handleExclusion(res)({
            status: 501,
            message: 'Sign in please'
          })
          return
        }

        this.songRepository.find({
          where: getSongListIds(songs)
        })
          .then(songlist => {
            if (songlist.length < 1) {
              handleExclusion(res)({
                status: 404,
                message: 'Songs not found'
              })
              return
            }

            this.playlistRepository.save({
              name,
              isPrivat,
              tags,
              description,
              songlist,
              createdBy
            })
              .then((playlist) => {
                const data = postRequestSelection(playlist, {
                  id: true,
                  name: true,
                  isPrivat: true,
                  tags: true,
                  description: true,
                  songlist: {
                    id: true,
                    songAuthor: true,
                    title: true
                  },
                  createdBy: {
                    id: true,
                    username: true
                  },
                  createdAt: true
                })

                res.status(201).json({
                  message: 'Playlist created',
                  data
                })
              }
              )
              .catch((error) => {
                handleExclusion(res)({
                  status: 400,
                  message: 'Could not create playlist',
                  error
                })
              })
          }).catch((error) => {
            handleExclusion(res)({
              status: 500,
              message: 'DB failure while getting songs',
              error
            })
          })
      })
      .catch((error) => {
        handleExclusion(res)({
          status: 401,
          message: 'Could not find user. Sign in please',
          error
        })
      })
  }

  get = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.query.id) {
      handleExclusion(res)({
        status: 400,
        message: 'Provide id after ? sign'
      })
      return
    }

    if (req.session.user?.role === 'guest') {
      handleExclusion(res)({
        status: 403,
        message: 'Permission denied'
      })
      return
    }

    this.playlistRepository.findOne({
      select: {
        createdBy: {
          id: true,
          username: true
        },
        songlist: {
          id: true,
          songAuthor: true,
          title: true
        },
        likedBy: {
          id: true,
          username: true
        }
      },
      where: {
        id: Number(req.query.id)
      },
      relations: ['createdBy', 'songlist', 'likedBy']
    })
      .then((foundPlaylist) => {
        if (!foundPlaylist) {
          handleExclusion(res)({
            status: 404,
            message: 'Could not find appropriate playlist. Check provided data'
          })
          return
        }

        if ((foundPlaylist.isPrivat && req.session.user?.id !== foundPlaylist.createdBy?.id) && req.session.user?.role !== 'admin') {
          handleExclusion(res)({
            status: 403,
            message: 'Permission denied. You should be playlist\'s owner'
          })
          return
        }

        res.status(200).json(foundPlaylist)
      })
      .catch((error) => {
        handleExclusion(res)({
          status: 500,
          message: 'Unable to get Playlist',
          error
        })
      })
  }

  getAll = (req: Request, res: Response, next: NextFunction): void => {
    if (req.session.user?.role === 'guest') {
      handleExclusion(res)({
        status: 403,
        message: 'Permission denied'
      })
      return
    }

    this.playlistRepository.find({
      select: {
        createdBy: {
          id: true,
          username: true
        },
        songlist: {
          id: true,
          songAuthor: true,
          title: true
        },
        likedBy: {
          id: true,
          username: true
        }
      },
      relations: ['createdBy', 'songlist', 'likedBy']
    })
      .then((playlists) => {
        if (playlists.length < 1) {
          handleExclusion(res)({
            status: 404,
            message: 'There is no playlists'
          })
          return
        }

        res.status(200).json({
          playlists
        })
      })
      .catch((error) => {
        handleExclusion(res)({
          status: 500,
          message: 'Unable to get Playlists',
          error
        })
      })
  }

  update = (req: Request, res: Response, next: NextFunction): void => {
    if (req.session.user?.role === 'guest') {
      handleExclusion(res)({
        status: 403,
        message: 'Permission denied'
      })
      return
    }

    if (!req.body) {
      handleExclusion(res)({
        status: 400,
        message: 'Provide body'
      })

      return
    }

    const { id, name, isPrivat, tags, description, likedBy, songlist } = req.body

    this.playlistRepository.findOne({
      where: {
        id: Number(id)
      },
      relations: ['likedBy', 'songlist', 'createdBy']
    })
      .then((playlist) => {
        if (!playlist) {
          handleExclusion(res)({
            status: 400,
            message: 'Invalid playlist ID'
          })

          return
        }

        if (playlist.createdBy?.id !== req.session.user?.id && req.session.user?.role !== 'admin') {
          handleExclusion(res)({
            status: 403,
            message: 'Permission denied. You should be playlist\'s owner'
          })
          return
        }

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
                .then((savedPlatlist) => {
                  const data = postRequestSelection(savedPlatlist, {
                    id: true,
                    name: true,
                    isPrivat: true,
                    tags: true,
                    description: true,
                    songlist: {
                      id: true,
                      songAuthor: true,
                      title: true
                    },
                    createdBy: {
                      id: true,
                      username: true
                    },
                    createdAt: true
                  })

                  res.status(200).json({
                    message: 'Playlist Updated',
                    data
                  })
                })
                .catch((error) => {
                  handleExclusion(res)({
                    status: 500,
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
                  if (newSongs.length < 1) {
                    handleExclusion(res)({
                      status: 404,
                      message: 'Could not find any appropriate song'
                    })
                    return
                  }
                  updatePlaylist(newSongs)
                })
                .catch((error) => {
                  handleExclusion(res)({
                    status: 500,
                    message: 'Could not get songs',
                    error
                  })
                })
            }
          })
          .catch((error) => {
            handleExclusion(res)({
              status: 400,
              message: 'User serach error',
              error
            })
          })
      })
      .catch((error) => {
        handleExclusion(res)({
          status: 400,
          message: 'Could not find Playlist',
          error
        })
      })
  }

  delete = (req: Request, res: Response, next: NextFunction): void => {
    if (req.session.user?.role !== 'admin') {
      handleExclusion(res)({
        status: 403,
        message: 'Permission denied'
      })

      return
    }

    deleteHandler(req, res, this.playlistRepository)
  }
}
