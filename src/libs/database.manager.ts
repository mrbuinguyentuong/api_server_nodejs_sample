import * as mongoose from "mongoose";
import config from '../configs/config';

import { LogManager } from "../libs";

class DatabaseManager{

    protected connection: mongoose.Connection;
    private className = "DatabaseManager";
    private fnName = "";

    public init(): Promise<any>{
        this.fnName = "init";
        let connection: mongoose.Connection;

        return new Promise((resolve, reject) => {

            connection = mongoose.connection;
            LogManager.logInfo(this.className, this.fnName, `Connect data with config ${JSON.stringify(config.database)}`);
            mongoose.connect(config.database.host, {
                useMongoClient: true
            });

            connection.on("open", e => {
                LogManager.logInfo(this.className, "Connect database", `Connect database is open ${JSON.stringify(e)}`);
                resolve();
            });

            connection.on("reconnect", () => {
                LogManager.logInfo(this.className, "Connect database", "Reconnect database");
            });

            connection.on("error", e => {
                LogManager.logError(this.className, "Connect database", "Connect database failure " + e);
                reject(e);
            });

            this.connection = connection;
        });
    }
}

export default new DatabaseManager();