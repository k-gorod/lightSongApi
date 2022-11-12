
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, UpdateDateColumn, CreateDateColumn, OneToMany } from "typeorm"
// import { SongCommentEntity } from "./SongCommentEntity";
import { SongEntity } from "./SongEntity";

@Entity()
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({select: true})
    password: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // @OneToMany(() => SongCommentEntity, comment => comment.author, {onDelete: "SET NULL"})
    // comments: SongCommentEntity[];

    @OneToMany(() => SongEntity, song => song.createdBy, {onDelete: "SET NULL"})
    songsAdded: SongEntity[];

    @Column()
    role?: string
}