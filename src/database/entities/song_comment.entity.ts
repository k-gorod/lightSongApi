
import { Relation, Column, PrimaryGeneratedColumn, Entity, BaseEntity, ManyToOne, CreateDateColumn } from 'typeorm'

import { Song } from './song.entity'
import { UserEntity } from './user.entity'

@Entity()
export class SongComment extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    text?: string

  @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

  @Column({ nullable: true })
    commentReplyId: number

  @ManyToOne(() => UserEntity, user => user.comments, { onDelete: 'SET NULL' })
    author?: Relation<UserEntity>

  @ManyToOne(() => Song, song => song.comments, { onDelete: 'SET NULL', nullable: true })
    song?: Relation<Song>
}
