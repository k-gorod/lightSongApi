
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToOne } from "typeorm"
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

    @Column()
    comments?: string;
    
}