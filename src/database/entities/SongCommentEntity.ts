
import { Entity, Column, BaseEntity } from "typeorm"

@Entity()
export class SongCommentEntity extends BaseEntity {
    @Column()
    author: string;

    @Column()
    text: string;

    @Column()
    createdAt: string;
}