import { Playlist } from './playlist.entity'
import { Song } from './song.entity'
import { SongComment } from './song_comment.entity'
import { UserEntity } from './user.entity'

export type Entities = Playlist | SongComment | Song | UserEntity

export {
  Playlist, SongComment, Song, UserEntity
}
