
import { Entity, Column, BaseEntity } from "typeorm"
import { SongCommentEntity } from "./SongCommentEntity";
import { UserEntity } from "./UserEntity";

@Entity()
export class SongInformation extends BaseEntity {
    @Column()
    createdAt?: string;

    @Column()
    updatedAt?: string;

    @Column(()=>UserEntity)
    createdBy?: UserEntity

    @Column(()=>UserEntity)
    updatedBy?: UserEntity

    // @Column("simple-array")
    // comments?: SongCommentEntity[];
}