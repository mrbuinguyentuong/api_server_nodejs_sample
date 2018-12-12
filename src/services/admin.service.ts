import * as Boom from "boom";
import * as _ from "lodash";

import { Const, Error } from "../constants";
import { RootService, IService } from "../services";
import { IUserModel as IModel, UserModel as Model } from "../models";
import { LogManager } from "../libs";

export interface IAdminService extends IService {
    updateUser(params: any);
    findUser(params: any);
    deleteUser({ id: string });
}

class AdminService extends RootService<IModel> implements IAdminService {

    protected className = "AdminService";
    protected subjects = "User";

    constructor(model: IModel = Model) {
        super(model);
    }

    public create = async (params): Promise<any> => {
        let result;
        const fnName = "create";
        LogManager.logDebug(this.className, fnName, `Call API register new user ${params.username} is calling`);
        result = await this.rootModel.create(params);
        if(!result){
            LogManager.logWarn(this.className, fnName, `Register user ${params.username} is fail: ${Error.EM0100}`);
            return Boom.badRequest(Error.EM0100);
        }
        if(result.isBoom){
            let user = await this.findOne(
                {
                    username: params.username,
                    isRemove: true
                },
                []
            );
            if(user && !user.isBoom && user.isRemove){
                return {
                    isBanner: true,
                    user: _.omit(user.toJSON(), ["password"])
                }
            }
            return result;
        }
        else{
            LogManager.logDebug(this.className, fnName, `Register new user ${params.username} was successful`);
            return _.omit(result.toJSON(), ["password"]);
        }
    }

    public findUser = async (query): Promise<any> => {
        let user;
        const fnName = "findOne";
        LogManager.logDebug(this.className, fnName, `Find user ${query.id} is calling`);
        user = await this.findOne(query, []);
        if(user.isBoom){
            LogManager.logWarn(this.className, fnName, `Find user ${query.id} is fail`);
            return user;
        }
        if(!user){
            LogManager.logWarn(this.className, fnName, `Find user ${query.id} is fail`);
            return Boom.notFound("User not found");
        }
        LogManager.logDebug(this.className, fnName, `End find user ${user.id}`);
        return user.removePrivacyInfo(user);
    }

    public deleteUser = async ({ id }) => {
        return await this.delete({ id });
    }

    public getAll = async (params: any) => {
        const page = params.page ? params.page : 1;
        if(page <= 0){
            return {};
        }
        const limit = !_.isUndefined(params.limit) ? params.limit : Const.LIMIT_RECORD;
        const fnName = "loadMore";
        let users;
        let query = _(params)
                    .pickBy(_.identity)
                    .omit(params, ['params', "limit", "sessionID", "decode"])
                    .value();
        /* Admin can get list user is remove */
        query.isRemove = { $in: [true, false] };
        LogManager.logInfo(this.className, fnName, "Function is calling");
        users = await this.rootModel.findAll(
            {
                page,
                limit,
                query
            },
            this.rootModel.populate
        );
        await _.forEach(users, async (user: any, index) => {
            users[index] = user.removePrivacyInfo(user);
        });
        /* Count number page of user */
        let result  = (await this.rootModel.countAll({ query })) || 0;
        return {
            total_record: result,
            records: users,
            page: {
                currentPage: _.parseInt(page),
                total: _.floor(result / Const.LIMIT_RECORD) + 1
            }
        };

    }

    public updateUser = async (params: any) => {
        const fnName = "update";
        let result;
        LogManager.logInfo(this.className, fnName, "Function is calling");
        result = await this.update(params);
        if(result.isBoom){
            return result;
        }
        if(!result){
            LogManager.logWarn(this.className, fnName, "User login fail");
            return Boom.badData(Error.EM0103);
        }

        return result.removePrivacyInfo(result);
    }
}

export default new AdminService();