import * as express from 'express';
import { Router } from 'express';
import { join } from 'path';
import { IService } from '../services';
import * as _ from 'lodash';

import { LogManager, RedisManager } from '../libs';
import { Const } from '../constants';

export interface IRouting{}

class RootHandler<T extends IService> implements IRouting{

    public router: Router;
    protected className;
    protected rootService:T;

    constructor(rootService: T){
        this.rootService = rootService;
    }

    protected create = (req: express.Request): any => {
        const fnName = "create";
        LogManager.logInfo(this.className, fnName, "Function is calling");
        return this.rootService.create({
            ...req.body,
            sessionID: req.sessionID,
            decode: req.decode
        });
    }

    protected updated = (req: express.Request): any => {
        const fnName = "update";
        LogManager.logInfo(this.className, fnName, "Function is calling");
        return this.rootService.update({
            data: req.body,
            query: req.query
        });
    }

    protected get = async (req: express.Request): Promise<any> => {
        const fnName = "get";
        let result;
        const { id } = req.query;
        LogManager.logInfo(this.className, fnName, "Function is calling");
        result = await this.rootService.findOne({
            _id: id,
            sessionID: req.sessionID,
            decode: req.decode
        });
        return result;
    }

    protected delete = async (req: express.Request): Promise<any> => {
        const fnName = "delete";
        const { id } = req.query;
        let result;
        LogManager.logInfo(this.className, fnName, "Function is calling");
        result = await this.rootService.delete({
            id
        });
        return result;
    }

    protected getAll = (req: express.Request): any => {
        const fnName = "getAll";
        LogManager.logInfo(this.className, fnName, "Function is calling");
        return this.rootService.getAll({
            ...req.query,
            sessionID: req.sessionID,
            decode: req.decode
        });
    }

    protected countAll = (req: express.Request): any => {
        const fnName = "countAll";
        LogManager.logInfo(this.className, fnName, "Function is calling");
        const { query } = req;
        return this.rootService.countAll({
            query
        });
    }

    protected findById = async (req: express.Request): Promise<any> => {
        const fnName = "findById";
        LogManager.logInfo(this.className, fnName, "Function is calling");
        return this.rootService.findById(
            req.params.id
        );
    }

    protected exportFileXlsx = (): any => {
        const fnName = "exportFileXlsx";
        LogManager.logInfo(this.className, fnName, "Function is calling");
        const fields = ["name", "sku"];
        const name = join(__dirname, "../files", "export-file", "product.xlsx");
        return this.rootService.exportFileXlsx({
            fields,
            name
        });
    }

    protected updateById = async (req: express.Request): Promise<any> => {
        const fnName = "updateById";
        LogManager.logInfo(this.className, fnName, "Function is calling");
        let params = _.merge(req.params, req.body.data);
        return this.rootService.updateById(
            params
        );
    }

    protected HandlerResponse = (handlerController: Function) => {
        return async (req: express.Request, res: express.Response) => {
            if(handlerController.length === 1){
                let result = await handlerController(req);
                if(result && result.isBoom){
                    let err = result.output;
                    res.status(err.statusCode).send({
                        success: 0,
                        error: err.payload
                    });
                }
                else{
                    res.send({
                        success: 1,
                        result
                    });
                }
            }
            else{
                res.send({
                    success: 1
                });
            }
        }
    }

    protected loginFailHandler = async (id) => {
        let key = `${id}-${Const.LOGIN_FAIL}`;
        let keyDisable = `${id}-${Const.DISABLE_USER}`;
        let totalLoginFail: any = await RedisManager.getRedisKey(key) || 0;
        if(totalLoginFail < Const.LIMIT_NUMBER_LOGIN_FAIL){
            RedisManager.setKey(key, +totalLoginFail + 1, Const.LOGIN_FAIL_EXPIRE_TIME);
        }
        else{
            RedisManager.setKey(keyDisable, true, Const.LOGIN_FAIL_EXPIRE_TIME);
        }
    }

}

export { RootHandler };