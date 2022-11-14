
import { Relation, Column, PrimaryGeneratedColumn, Entity, BaseEntity, ManyToOne, ManyToMany } from 'typeorm'

import { Song } from './song.entity'
import { UserEntity } from './user.entity'

@Entity()
export class Playlist extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ default: false })
    isPrivat!: boolean

  @Column('simple-array')
    tags?: string[]

  @Column({ select: false })
    createdAt: Date

  @Column({ select: false })
    updatedAt: Date

  @Column()
    description: string

  @ManyToOne(() => UserEntity, user => user.createdPlaylists, { onDelete: 'SET NULL' })
    createdBy?: Relation<UserEntity>

  @ManyToMany(() => UserEntity, user => user.likedPlaylists, { onDelete: 'SET NULL' })
    likedBy?: Relation<UserEntity[]>

  @ManyToMany(() => Song, song => song.usedInPlaylists, { onDelete: 'SET NULL' })
    songlist: Relation<Song[]>
}
