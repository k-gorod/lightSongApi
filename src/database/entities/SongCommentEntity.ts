
import { Relation, Column, PrimaryGeneratedColumn, Entity, BaseEntity, CreateDateColumn, ManyToOne } from 'typeorm'

import { SongEntity } from './SongEntity'
import { UserEntity } from './UserEntity'

@Entity()
export class SongCommentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number

  @ManyToOne(() => UserEntity, user => user.comments, { onDelete: 'SET NULL' })
    author?: Relation<UserEntity>

  @ManyToOne(() => SongEntity, song => song.comments, { onDelete: 'SET NULL' })
    song?: Relation<SongEntity>

  @Column()
    text?: string

  @CreateDateColumn()
    createdAt?: Date
}
