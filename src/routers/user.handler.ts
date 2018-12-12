import { Router } from "express";
import * as express from "express";
import * as _ from "lodash";

import { UserService as Service, IUserService as IService } from "../services";
import { LogManager } from "../libs";
import { RootHandler, IRouting } from "./root.handler";
import { Const } from "../constants";

/* Interface */
import { IUser } from "../interfaces";
export interface IUserRouting extends IRouting {}

class UserHandler extends RootHandler<IService> implements IUserRouting {
    public router: Router;
    protected className = "UserHandler";

    constructor(service: IService = Service) {
        super(service);
        this.router = Router();
        this.init();
    }

    public init = () => {
        let router = Router();

        router.get("/", this.HandlerResponse(this.get));

        router.put("/", this.HandlerResponse(this.update));

        router.post("/register", this.HandlerResponse(this.register));

        router.post("/login", this.HandlerResponse(this.login));

        router.put("/password", this.HandlerResponse(this.changePassword));

        router.post("/forgot", this.HandlerResponse(this.forgotPassword));

        this.router = router;
    }

    private register = async(req) => {
        const fnName = "register";
        let user: IUser = req.body;

        LogManager.logInfo(this.className, fnName, `Register new user with ${JSON.stringify(_.omit(req.body, "password"))}`);

        if(!user.email && user.username){
            user.email = user.username;
        }
        /* Force register with role free user */
        req.body.role = Const.userRoles[1].id;
        return this.rootService.register(req.body);
    }

    private login = async (req: express.Request): Promise<any> => {
        const fnName = "login";
        let result;
        const { sessionID } = req;
        LogManager.logDebug(this.className, fnName, `User ${req.body.username} call API login`);
        result = await this.rootService.login(req.body);
        if(result.isBoom){
            this.loginFailHandler(sessionID);
        }
        return result;
    }

    protected get = async (req: express.Request): Promise<any> => {
        const fnName = "get";
        let result;
        const { id } = req.decode;
        LogManager.logInfo(this.className, fnName, "Function is calling");
        result = await this.rootService.findOne({
            _id: id
        });
        return result;
    }

    protected update = (req: express.Request): any => {
        const fnName = "update";
        let user: IUser = req.body;
        /* Support update fullName, address, phone, avatar */
        let _user: any = _.pick(user, ["fullName", "address", "phone", "avatar"]);
        _user = _.pickBy(_user, _.identity);
        /* Remove password, role, avatar in request */
        LogManager.logInfo(this.className, fnName, "Function is calling");
        return this.rootService.update({
            data: _user,
            query: {
                id: req.decode.id
            }
        });
    }

    protected changePassword = (req: express.Request): any => {
        const fnName = "update";
        /* Remove password, role, avatar in request */
        LogManager.logInfo(this.className, fnName, "Function is calling");
        return this.rootService.changePassword({
            data: _.omit(req.body, ["role", "avatar"]),
            query: {
                id: req.decode.id
            }
        });
    }

    protected forgotPassword = (req: express.Request): any => {
        const fnName = "forgot";
        LogManager.logInfo(this.className, fnName, "Function is calling");
        return this.rootService.forgotPassword({
            email: req.body.email
        });
    }
}

export default new UserHandler();