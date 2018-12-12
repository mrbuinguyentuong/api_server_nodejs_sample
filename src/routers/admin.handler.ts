import { Router } from "express";
import * as express from "express";
import { AdminService as Service, IAdminService as IService } from "../services";
import { RootHandler, IRouting } from "./root.handler";
import { LogManager } from "../libs";

interface IHandler extends IRouting {

}

class AdminHandler extends RootHandler<IService> implements IHandler {

    public router: Router;
    protected className = "AdminHandler";

    constructor(service: IService = Service) {
        super(service);
        this.router = Router();
        this.init();
    }
    /* API for admin management user of application */
    public init = () => {
        let router = Router();
        /* Admin create user */
        router.post("/user", this.HandlerResponse(this.create));
        /* Admin get a user */
        router.get("/user/info", this.HandlerResponse(this.get));
        /* Admin delete user */
        router.delete("/user", this.HandlerResponse(this.deleteUser));
        /* Admin update user */
        router.put("/user", this.HandlerResponse(this.update));
        /* Admin get list user */
        router.get("/user/all", this.HandlerResponse(this.getAll));
        /* Admin count all user active */
        router.get("/user/count", this.HandlerResponse(this.countAll));
        this.router = router;
    }

    public update = (req: express.Request): any => {
        const fnName = "update";
        LogManager.logInfo(this.className, fnName, "Function is calling");
        return this.rootService.updateUser({
            data: req.body,
            query: req.query
        });
    }

    protected get = async (req: express.Request): Promise<any> => {
        const fnName = "get";
        let result;
        const { id } = req.query;
        LogManager.logInfo(this.className, fnName, "Function is calling");
        result = await this.rootService.findUser({
            _id: id,
            sessionID: req.sessionID,
            decode: req.decode
        });
        return result;
    }

    protected deleteUser = async (req: express.Request) => {
        const { id } = req.query;
        return await this.rootService.deleteUser({ id });
    }

}

export default new AdminHandler();