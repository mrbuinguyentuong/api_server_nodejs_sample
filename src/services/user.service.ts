import * as Boom from "boom";
import * as _ from "lodash";

import { RootService, IService } from "../services";
import { IUserModel as IModel } from "../models";
import { UserModel } from "../models";
import { Error } from "../constants";
import { LogManager } from "../libs";

/* Interface */
import { IUser } from "../interfaces";

export interface IUserService extends IService {
    login(params: any): any;
    register(user: IUser) : any;
    changePassword(params: any): any;
    forgotPassword(params:any): any;
    resetPassword(params:any): any;
}

class UserService extends RootService<IModel> implements IUserService {

    protected className = "UserService";
    protected subjects = "User";
    public fnName = "";

    constructor(model: IModel = UserModel) {
        super(model);
    }

    public create = async (params): Promise<any> => {
        let user = await this.rootModel.create(params);
        const fnName = "create";

        LogManager.logInfo(this.className, fnName, "Function create new user is calling");
        /* Remove password */
        if(user._doc){
            user = _.omit(user._doc, ["password"]);
        }
        return user;
    }

    public login = async (params): Promise<any> => {
        let user;
        let token;
        const fnName = "login";

        LogManager.logInfo(this.className, fnName, "Function login user is calling");
        if(_.isEmpty(params.password) || _.isEmpty(params.username)){
            return this.badData("Username or password is wrong");
        }
        user = await this.rootModel.findOne(_.omit(params, ["password"]));
        user = user[0];
        if(!user){
            LogManager.logWarn(this.className, fnName, `User login fail`);
            return Boom.badData("Username or password is wrong");
        }
        if(user.isBoom){
            return user;
        }
        /* Check password */
        if(!user.validatePassword(params.password)){
            LogManager.logWarn(this.className, fnName, `User ${user.username} login fail wrong password`);
            return Boom.badData("Username or password is wrong");
        }
        /* Remove */
        user = user.removePrivacyInfo(user);
        token = user.generationToken(user.toJSON());
        LogManager.logDebug(this.className, fnName, `User ${user.username} login success`);
        return {
            ...user.toJSON(),
            token
        };
    }

    public findOne = async (query): Promise<any> => {
        let user;
        const fnName = "findOne";
        LogManager.logDebug(this.className, fnName, `Find user ${query.id} is calling`);
        user = await this.rootModel.findOne(query);

        if(user && user.isBoom){
            LogManager.logWarn(this.className, fnName, `Find user ${query.id} is fail`);
            return user;
        }
        user = user[0];
        if(_.isUndefined(user)){
            return this.subjectNotFound();
        }
        user = user.removePrivacyInfo(user);
        LogManager.logDebug(this.className, fnName, `End find user ${query.id} `);
        return user;
    }

    public update = async (params: any) => {
        let { data, query } = params;
        const fnName = "update";
        let result, user;
        LogManager.logInfo(this.className, fnName, "Function is calling");
        /* Check post is exist */
        result = await this.rootModel.findOne({
            _id: query.id
        });
        result  = result[0];
        if(_.isUndefined(result)){
            return this.subjectNotFound();
        }
        /* Remove privacy params, only for admin */
        data = _.omit(data, ["role", "isRemove"]);
        result = await this.rootModel.update({
            query,
            data
        });
        if(result.isBoom){
            LogManager.logWarn(this.className, fnName, `Update user ${query.id} is fail`);
            return result;
        }
        user = result[0];
        user = user.removePrivacyInfo(user);
        return user;
    }

    public register = async (user: IUser): Promise<any> => {
        let result;
        const fnName = "register";

        LogManager.logDebug(this.className, fnName, `Call API register new user ${user.username}`);
        result = await this.rootModel.create(user);
        if(!result){
            LogManager.logWarn(this.className, fnName, `Register user ${user.username} is fail: ${Error.EM0100}`);
            return Boom.badRequest(Error.EM0100);
        }
        if(result.isBoom){
            return result;
        }
        else{
            LogManager.logDebug(this.className, fnName, `Register new user ${user.username} was successful`);
            return _.omit(result.toJSON(), ["password"]);
        }
    }

    public changePassword = async (params): Promise<any> => {
        const { data, query } = params;
        const { oldPassword, password } = data;
        const fnName = "changePassword";
        let user, result;

        LogManager.logInfo(this.className, fnName, "Function change user password is calling");
        if(!oldPassword){
            return Boom.badData(Error.EM0101);
        }
        if(!password){
            return Boom.badData(Error.EM0104);
        }
        user = await this.rootModel.findOne(_.omit(params.query, ["password", "oldPassword"]));
        user = user[0];
        if(!user){
            LogManager.logWarn(this.className, fnName, "Find user fail");
            return Boom.badData(Error.EM0103);
        }
        if(user.isBoom){
            return user;
        }
        /* Check password */
        if(!user.validatePassword(oldPassword)){
            LogManager.logWarn(this.className, fnName, `User  ${user.username} validate password fail`);
            return Boom.badData(Error.EM0102);
        }

        result = await this.rootModel.update({
            query,
            data: {
                password
            }
        });
        if(result.isBoom){
            LogManager.logWarn(this.className, fnName, `Update user ${query.id} is fail`);
            return result;
        }
        user = result[0];
        user = user.removePrivacyInfo(user);
        return user;
    }

    public forgotPassword = async (params): Promise<any> => {
        const { email } = params;
        const fnName = "forgotPassword";
        let user, result, token;
        LogManager.logInfo(this.className, fnName, "Function forgot password is calling");
        if(!email){
            return Boom.badData(Error.EM0112);
        }

        user = await this.rootModel.findOne({
            email
        });
        user = user[0];
        if(!user){
            LogManager.logWarn(this.className, fnName, "Find user fail");
            return Boom.badData(Error.EM0103);
        }
        token = user.generationToken(email + JSON.stringify(Date.now()));
        result = await this.rootModel.update({
            query: {
                id: user.id
            },
            data: {
                resetPasswordToken: token,
                resetPasswordExpires: Date.now() + 3600000
            }
        });
        if(result.isBoom){
            LogManager.logWarn(this.className, fnName, `Update user ${user.id} is fail`);
            return "";
        }
        user = user[0];
        user = user.removePrivacyInfo(user);
        return user;
    }

    public resetPassword = async (params): Promise<any> => {
        const { data, query } = params;
        const { password } = data;
        const fnName = "resetPassword";
        let user, result;

        LogManager.logInfo(this.className, fnName, "Function reset password is calling");
        if(!password){
            return Boom.badData(Error.EM0104);
        }
        user = await this.rootModel.findOne(params.query);
        user = user[0];
        if(!user){
            LogManager.logWarn(this.className, fnName, "Password reset token is invalid or has expired.");
            return Boom.badData(Error.EM0113);
        }
        result = await this.rootModel.update({
            query: {
                ...query,
                id: user.id
            },
            data: {
                password,
                resetPasswordToken: undefined,
                resetPasswordExpires: undefined
            }
        });
        if(result.isBoom){
            LogManager.logWarn(this.className, fnName, `Update user ${query.id} is fail`);
            return result;
        }
        user = result[0];
        return user;
    }
}

export default new UserService();