
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, OneToMany } from 'typeorm'

// import { SongCommentEntity } from "./SongCommentEntity";
import { SongEntity } from './SongEntity'

@Entity()
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ unique: true })
    username: string

  @Column({ select: false })
    password: string

  @CreateDateColumn({ select: false })
    createdAt: Date

  @Column({ select: false })
    lastSingIn: Date

  // @OneToMany(() => SongCommentEntity, comment => comment.author, {onDelete: "SET NULL"})
  // comments: SongCommentEntity[];

  @OneToMany(() => SongEntity, song => song.createdBy, { onDelete: 'SET NULL' })
    songsAdded: SongEntity[]

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
