import "reflect-metadata"
import { DataSource } from "typeorm"
import { SongEntity, UserEntity } from "./entities"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "lucky.db.elephantsql.com",
    port: 5432,
    username: "najpdrzz",
    password: "XlcsSBgfirltjG-S4WiNAM1UZYNf479m",
    database: "najpdrzz",
    entities: [UserEntity, SongEntity],
    synchronize: true,
    logging: false,
})

AppDataSource.initialize()
    .then(() => {
        // here you can start to work with your database
    })
    .catch((error) => console.log(error))