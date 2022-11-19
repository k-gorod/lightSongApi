
import { Relation, Entity, Column, OneToMany, PrimaryGeneratedColumn, BaseEntity, ManyToOne, ManyToMany, UpdateDateColumn, CreateDateColumn } from 'typeorm'

import { Playlist } from './playlist.entity'
import { SongComment } from './song_comment.entity'
import { UserEntity } from './user.entity'

@Entity()
export class Song extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ default: 'unknown' })
    songAuthor: string

  @Column()
    title: string

  @Column({ nullable: true })
    lyrics?: string

  @Column({ nullable: true })
    chords?: string

  @Column({ nullable: true })
    description?: string

  @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date

  @OneToMany(() => SongComment, comment => comment.song, { onDelete: 'SET NULL' })
    comments?: Relation<SongComment[]>

  @ManyToOne(() => UserEntity, ({ id, username }) => ({ id, username }), { onDelete: 'SET NULL' })
    createdBy?: Relation<UserEntity>

  @ManyToOne(() => UserEntity, ({ id, username }) => ({ id, username }), { onDelete: 'SET NULL' })
    updatedBy?: Relation<UserEntity>

  @ManyToMany(() => Playlist, playlist => playlist.songlist, { onDelete: 'SET NULL' })
    usedInPlaylists: Relation<Playlist[]>
}
