
import { Relation, Column, PrimaryGeneratedColumn, Entity, BaseEntity, ManyToOne } from 'typeorm'

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

  @Column({ nullable: false, select: false })
    createdAt: Date
}
