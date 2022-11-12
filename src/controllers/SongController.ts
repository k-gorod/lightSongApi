import { Repository} from "typeorm";
import { Request, Response, NextFunction } from "express";
import { SongEntity, UserEntity } from "../database/entities";
import { ISongController } from "../types";

import { excludeFields } from "../utils";

export class SongController implements ISongController {
    constructor(
        songRepository: Repository<SongEntity>,
        userRepository: Repository<UserEntity>,
    ){
        this.songRepository = songRepository;
        this.userRepository = userRepository;
    }

    private readonly songRepository: Repository<SongEntity>;
    private readonly userRepository: Repository<UserEntity>;

    addSong = (req: Request, res: Response, next: NextFunction) => {
        const { title, lyrics, chords, description } = req.body;

        const song = new SongEntity();
        this.userRepository.find({
            where: {id: req.session.user!.id, }
        })
            .then(([user]) => {
                // handle user not found
                song.updatedBy = user;
                song.createdBy = user;

                song.title = title;
                song.lyrics = lyrics;
                song.chords = chords;
                song.description = description;

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
            })
        
        
    }

    getAllSongs = (req: Request, res: Response, next: NextFunction) => {
       
        this.songRepository.find({
            relationLoadStrategy: "join",
            select: {
                id: true,
                title: true,
                lyrics: true,
                chords: true,
                description: true,
                createdAt: true,
                createdBy: {
                    id: true,
                    username: true,
                },
            },
            relations: ['createdBy'],
        })
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