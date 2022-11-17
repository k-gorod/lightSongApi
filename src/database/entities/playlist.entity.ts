
import { Relation, Column, PrimaryGeneratedColumn, Entity, BaseEntity, ManyToOne, ManyToMany, CreateDateColumn, UpdateDateColumn, JoinTable } from 'typeorm'

import { Song } from './song.entity'
import { UserEntity } from './user.entity'

@Entity()
export class Playlist extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ nullable: false })
    name!: string

  @Column({ default: false, nullable: false })
    isPrivat!: boolean

  @Column('simple-array', { nullable: true })
    tags?: string[]

  @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', select: false })
    updatedAt: Date

  @Column({ nullable: true })
    description?: string

  @ManyToOne(() => UserEntity, user => user.createdPlaylists, { nullable: false })
    createdBy?: Relation<UserEntity>

  @ManyToMany(() => UserEntity, user => user.likedPlaylists, { nullable: true })
    likedBy?: Relation<UserEntity[]>

  @ManyToMany(() => Song, song => song.usedInPlaylists, { nullable: true })
  @JoinTable()
    songlist: Relation<Song[]>
}
