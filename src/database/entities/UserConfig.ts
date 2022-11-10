
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm"

@Entity()
export class UserConfig extends BaseEntity {
    @Column()
    role: "user" | "kostya"
}