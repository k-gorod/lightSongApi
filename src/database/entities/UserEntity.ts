
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm"
import { UserConfig } from "./UserConfig";

@Entity()
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    createdAt: string;

    @Column()
    updatedAt: string;

    @Column(()=>UserConfig)
    config?: UserConfig
    
}