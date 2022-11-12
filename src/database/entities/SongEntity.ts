
import { Entity, Column, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn, BaseEntity, ManyToOne } from 'typeorm'

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

  @CreateDateColumn()
    createdAt?: Date

  @UpdateDateColumn()
    updatedAt?: Date

  @ManyToOne(() => UserEntity, ({ id, username }) => ({ id, username }), { onDelete: 'SET NULL' })
    createdBy?: UserEntity

  @ManyToOne(() => UserEntity, ({ id, username }) => ({ id, username }), { onDelete: 'SET NULL' })
    updatedBy?: UserEntity
}
