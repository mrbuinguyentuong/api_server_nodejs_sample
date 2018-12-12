import * as express from "express";
import * as _ from "lodash";
import * as Boom from "boom" ;
import * as jwt from "jsonwebtoken";

import AdminHandler from "./admin.handler";
import UserHandler from "./user.handler";

import { Error, Const } from "../constants";
import config from "../configs/config";

class Routing {
    public router: express.Router;

    constructor () {
        this.router = express.Router();
    }

    public init() {
        this.router.use(this.authenHandler);

        /* User Handler */
        this.router.use("/user", UserHandler.router);

        /* Admin API */
        this.router.use("/admin", this.checkAdminPermission, AdminHandler.router);
    }

    public authenHandler(req, res, next) {
        const url = req.originalUrl;
        let token, authenString;
        if(_.indexOf(Const.whileListUrl, url) != -1){
            next();
        }
        else{
            authenString = _.split(req.headers.authorization, " ");
            if(!_.isEmpty(authenString) && authenString[0] === "x-access-token"){
                token = authenString[1];
                jwt.verify(token, config.jwt.secretKey, function(err, decode) {
                    if(err){
                        res.status(403).send({
                            success: 0,
                            result: Boom.forbidden(Error.EM0001).output.payload
                        });
                    }
                    else{
                        req.decode = decode;
                        next();
                    }
                });
            }
            else{
                res.status(403).send({
                    success: 0,
                    result: Boom.forbidden(Error.EM0001).output
                });
            }
        }
    }
    /* decode Token */
    public decodeToken(req, res, next) {
        let token, authenString;

        if(req.headers.authorization){
            authenString = _.split(req.headers.authorization, " ");
            /* get token from header */
            if(!_.isEmpty(authenString) && authenString[0] === "x-access-token"){
                token = authenString[0];
                jwt.verify(token, config.jwt.secretKey, function(err, decode) {
                    if(err){
                        next();
                    }
                    else{
                        req.decode = decode;
                        next();
                    }
                });
            }
            else{
                res.status(403).send({
                    success: 0,
                    result: Boom.forbidden(Error.EM0001).output
                });
            }
        }
        else{
            next();
        }
    }

    private checkAdminPermission(req, res, next) {
        if(_.parseInt(req.decode.role) !== 1){
            return res.send(Boom.forbidden(Error.EM0001));
        }
        next();
    }
}

export default new Routing();
