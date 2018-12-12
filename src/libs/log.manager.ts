import * as log4js from "log4js";

const options: any = {
    pm2: true,
    appenders: {
        console : {
            type: "console"
        }
    },
    categories: {
        default: {
            appenders: [
                "console"
            ],
            level: "debug"
        }
    }
}

class LogManager {

    public logger;
    private logName = "APINODEJS";

    constructor(){
        log4js.configure(options);
        this.logger = log4js.getLogger(this.logName);
    }

    public logDebug(fileName, fnName, message){
        this.logger.debug(fileName + ' - ' + fnName + ' - ' + message);
    }

    public logInfo(fileName, fnName, message){
        this.logger.info(fileName + ' - ' + fnName + ' - ' + message);
    }

    public logWarn(fileName, fnName, message) {
        this.logger.warn(fileName + ' - ' + fnName + ' - ' + message);
    }

    public logError(fileName, fnName, message) {
        this.logger.error(fileName + ' - ' + fnName + ' - ' + message);
    }
}

export default new LogManager();