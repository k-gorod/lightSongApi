
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm"
import { SongInformation } from "./SongInformation";

@Entity()
export class SongEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    lyrics?: string;

    @Column()
    chords?: string;

    @Column(() => SongInformation)
    info: SongInformation;

}