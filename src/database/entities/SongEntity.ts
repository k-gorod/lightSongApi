
import { Relation, Entity, Column, OneToMany, PrimaryGeneratedColumn, BaseEntity, ManyToOne } from 'typeorm'

import { SongCommentEntity } from './SongCommentEntity'
import { UserEntity } from './UserEntity'

@Entity()
export class SongEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    title: string

  @Column({ nullable: true })
    lyrics?: string

  @Column({ nullable: true })
    chords?: string

  @Column({ nullable: true })
    description?: string

  @Column({ nullable: false, select: false })
    createdAt: Date

  @Column({ nullable: true, select: false })
    updatedAt: Date

  @OneToMany(() => SongCommentEntity, comment => comment.song, { onDelete: 'SET NULL' })
    comments?: Relation<SongCommentEntity[]>

  @ManyToOne(() => UserEntity, ({ id, username }) => ({ id, username }), { onDelete: 'SET NULL' })
    createdBy?: Relation<UserEntity>

  @ManyToOne(() => UserEntity, ({ id, username }) => ({ id, username }), { onDelete: 'SET NULL' })
    updatedBy?: Relation<UserEntity>
}
