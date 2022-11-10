import { Repository} from "typeorm";
import { Request, Response, NextFunction } from "express";
import bcryptjs from "bcryptjs"
import { ISongController } from "./types";
import { excludeFields, removeUserPassword, signJWT } from "../utils";
import { UserConfig } from "../database/entities/UserConfig";
import { SongEntity } from "../database/entities";

export class SongController implements ISongController {
    constructor(songRepository: Repository<SongEntity>){
        this.songRepository = songRepository;
    }

    private readonly songRepository: Repository<SongEntity>;

    addSong = (req: Request, res: Response, next: NextFunction) => {
        const { title, lyrics, chords, info } = req.body;
        const song = new SongEntity();

        song.title = title;
        song.lyrics = lyrics;
        song.chords = chords;
        song.info = info;
        song.createdAt = `${new Date().toJSON()}`;
        song.updatedAt = `${new Date().toJSON()}`;

        this.songRepository.save(song)
            .then(()=>{
                return res.status(201).json({
                    message: "Song being added"
                });
            }).catch((error)=>{
                return res.status(502).json({
                    message: "502: Something went wrong",
                    error
                });
            })
    }

    getAllSongs = (req: Request, res: Response, next: NextFunction) => {
        this.songRepository.find({})
            .then((songList)=>{
                return res.status(200).json(songList);
            }).catch((error)=>{
                return res.status(502).json({
                    message: "502: Something went wrong",
                    error
                });
            })
    }

    
}