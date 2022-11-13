
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany, Relation } from 'typeorm'

import { SongCommentEntity } from './SongCommentEntity'
import { SongEntity } from './SongEntity'

@Entity()
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ unique: true })
    username: string

  @Column({ select: false })
    password: string

  @Column({ select: false })
    createdAt: Date

  @Column({ select: false, nullable: true })
    lastSingIn: Date

  @OneToMany(() => SongCommentEntity, comment => comment.author, { onDelete: 'SET NULL' })
    comments: Relation<SongCommentEntity[]>

  @OneToMany(() => SongEntity, song => song.createdBy, { onDelete: 'SET NULL' })
    songsAdded: Relation<SongEntity[]>

  @Column()
    role?: string
}
// {
//     id: true,
//     username: true,
//     password: true,
//     createdAt: true,
//     updatedAt: true,
//     songsAdded: true,
//     role: true,
// }
