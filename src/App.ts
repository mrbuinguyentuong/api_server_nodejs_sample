import * as http from  "http";
import * as express from "express";
import * as cookieParse from "cookie-parser";
import * as morgan from "morgan";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as expressValidator from "express-validator";

import { Const } from "./constants";
import { DatabaseManager, LogManager, Utils, SocketManager } from "./libs";
import routers from "./routers";

const port = process.env.PORT || Const.port;

let app = express();
let httpServer = http.createServer(app);
const corsOptions: any = {
    origin: [Const.whiteList],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
};

(async () => {
    /* Middleware */
    app.use(cookieParse());
    app.use(morgan("dev"));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(expressValidator());
    app.use(express.static(path.join(__dirname, "public")));
    app.use(express.static(path.join(__dirname, "files")));
    app.use(cors(corsOptions));

    /* Database */
    await DatabaseManager.init();

    Utils.createAdminInit();

    /* Router */
    routers.init();
    app.use("/api", routers.router);

    /* Handler api not found */
    app.use((err, _req, res, next) => {
        if(err.status === 404){
            res.render("404");
        }
        else{
            next();
        }
    });
    /* Start server */
    httpServer.listen(port, () => {
        LogManager.logInfo("App", "Start server", "Server is working in port " + port);
        SocketManager.init(httpServer);
    });
})();

export default app;