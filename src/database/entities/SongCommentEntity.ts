
import { Entity, Column, BaseEntity, CreateDateColumn, ManyToOne } from 'typeorm'

import { SongEntity } from './SongEntity'
import { UserEntity } from './UserEntity'

@Entity()
export class SongCommentEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, ({ id, username }) => ({ id, username }), { onDelete: 'SET NULL' })
    author?: UserEntity

  @ManyToOne(() => SongEntity, ({ id, title }) => ({ id, title }), { onDelete: 'SET NULL' })
    song?: SongEntity

  @Column()
    text?: string

  @CreateDateColumn()
    createdAt?: Date
}
