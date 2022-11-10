import { Repository} from "typeorm";
import { Request, Response, NextFunction } from "express";
import { ISongController } from "./types";
import { SongEntity } from "../database/entities";
import { SongInformation } from "../database/entities/SongInformation";
import { excludeFields } from "../utils";

export class SongController implements ISongController {
    constructor(songRepository: Repository<SongEntity>){
        this.songRepository = songRepository;
    }

    private readonly songRepository: Repository<SongEntity>;

    addSong = (req: Request, res: Response, next: NextFunction) => {
        const { title, lyrics, chords, comments } = req.body;

        const song = new SongEntity();
        const info = new SongInformation();
        const user = req.session.user!;
        
        info.createdAt = `${new Date().toJSON()}`;
        info.updatedAt = `${new Date().toJSON()}`;
        info.updatedBy = user;
        info.createdBy = user;
        info.comments = comments;

        song.title = title;
        song.lyrics = lyrics;
        song.chords = chords;
        song.info = info;
        

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