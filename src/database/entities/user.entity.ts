
import { userConfig } from '@types'
import { Entity, CreateDateColumn, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany, Relation, ManyToMany, JoinTable } from 'typeorm'

import { Playlist } from './playlist.entity'
import { Song } from './song.entity'
import { SongComment } from './song_comment.entity'

@Entity()
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ unique: true, nullable: false })
    login: string

  @Column({ select: false, nullable: false })
    password: string

  @Column({ nullable: true })
    username: string

  @Column({ nullable: false })
    role?: string

  @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

  @Column({ select: false, nullable: true })
    lastSingIn: Date

  @Column('simple-json', { select: false, nullable: true })
    config?: userConfig

  @OneToMany(() => SongComment, comment => comment.author, { onDelete: 'SET NULL', nullable: true })
    comments: Relation<SongComment[]>

  @OneToMany(() => Song, song => song.createdBy, { onDelete: 'SET NULL' })
    songsAdded: Relation<Song[]>

  @OneToMany(() => Playlist, playlist => playlist.createdBy, { onDelete: 'CASCADE' })
  @JoinTable()
    createdPlaylists: Relation<Playlist[]>

  @ManyToMany(() => Playlist, playlist => playlist.likedBy, { onDelete: 'SET NULL' })
  @JoinTable()
    likedPlaylists: Relation<Playlist[]>
}
