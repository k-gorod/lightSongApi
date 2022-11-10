
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm"
import { UserConfig } from "./UserConfig";

@Entity()
export class SongEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    lyrics: string;

    @Column()
    chords: string;

    @Column()
    info: string;

    @Column()
    createdAt?: string;

    @Column()
    updatedAt?: string;
}