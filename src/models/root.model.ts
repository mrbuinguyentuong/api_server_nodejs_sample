import * as mongoose from "mongoose";
import * as _ from "lodash";
import * as Boom from "boom";
import * as fs from "fs";
import * as json2xls from "json2xls";

import { Const } from "../constants";
import { ISchema } from "../schemas";
import { LogManager } from "../libs";

const ObjectId = mongoose.Types.ObjectId;

export interface IRootModel {
    populate?: Array<any>;
    create(object: any): Promise<any>;
    update(object: any): Promise<any>;
    deleteById(id: any): Promise<any>;
    findOne(filter: any, populate?:any): Promise<any>;
    findAll(filter: any, populate?:any): Promise<any>;
    exportFileXlsx(fields: any, name: any): Promise<any>;
    findById(id: any): Promise<any>;
    delete(query: any): Promise<any>;
    countAll(params:any): Promise<any>;
}

export class RootModel<S extends ISchema> implements IRootModel {

    protected model: mongoose.Model<mongoose.Document>;
    protected className;
    public fnName;
    public populate;

    constructor(schema: S) {
        this.model = mongoose.model(schema.getName(), schema.schemaInstance());
    }

    public create = (params: any): Promise<any> => {
        const fnName = "create";
        LogManager.logInfo(this.className, fnName, "Function is calling");
        return new Promise(resolve => {
            const model = new this.model(params);
            model.save((err, result) => {
                if(err && err.isBoom){
                    resolve(err);
                }
                else{
                    if(err){
                        resolve(Boom.conflict(err));
                    }
                    else{
                        resolve(result);
                    }
                }
            });
        });
    }

    public update = (params: any): Promise<any> => {
        let { query, data } = params;
        const fnName = "update";
        LogManager.logInfo(this.className, fnName, "Function is calling");
        query._id = query.id;
        query = _.omit(query, ["id"]);
        return new Promise(resolve => {
            this.model.findOneAndUpdate(
                {
                    ...query,
                    isRemove: _.isUndefined(query.isRemove) ? false : query.isRemove,
                },
                data,
                err => {
                    if(err && err.isBoom){
                        return resolve(err);
                    }
                    if(err){
                        resolve(this.handlerQueryError(err));
                    }
                    resolve(this.findOne(query, []));
                }
            );
        });
    }

    public findById = (id: string): Promise<any> => {
        const fnName = "findById";
        LogManager.logInfo(this.className, fnName, "Function is calling");
        let _id = new ObjectId(id);
        return new Promise(resolve => {
            this.model.findById(_id, (err, result) => {
                if(err){
                    resolve(Boom.notFound("Have Error with database"));
                }
                else{
                    resolve(result ? result : {});
                }
            });
        });
    }

    public deleteById = ({ id }): Promise<any> => {
        const fnName = "deleteById";
        LogManager.logInfo(this.className, fnName, "Function is calling");
        return new Promise(resolve => {
            this.model.findOneAndUpdate(
                {
                    _id: id
                },
                {
                    isRemove: true
                },
                err => {
                    resolve(err);
                }
            );
        });
    }

    public findOne = (filter: any, populate: any): Promise<any> => {
        const fnName = "findOne";
        let _populate = this.populate;
        filter = _.omit(filter, ["decode", "sessionID"]);

        if(filter.id && !filter._id){
            filter._id = filter.id;
            filter = _.omit(filter, ["id"]);
        }

        LogManager.logInfo(this.className, fnName, "Function is calling");
        return new Promise(resolve => {
            if(_.isUndefined(populate)){
                this.model
                    .find({
                        ...filter,
                        isRemove: _.isUndefined(filter.isRemove) ? false : filter.isRemove
                    })
                    .limit(1)
                    .exec((err, result) => {
                        if(err){
                            resolve(this.handlerQueryError(err));
                        }
                        else{
                            resolve(result);
                        }
                    });
            }
            else{
                this.model
                    .find({
                        ...filter,
                        isRemove: _.isUndefined(filter.isRemove) ? false : filter.isRemove
                    })
                    .populate(_.union(_populate, populate))
                    .limit(1)
                    .exec((err, result) => {
                        if(err){
                            resolve(this.handlerQueryError(err));
                        }
                        else{
                            resolve(result);
                        }
                    });
            }
        });
    }

    public findAll = (params: any, populate?: any): Promise<any> => {
        let { page, limit, query } = params;
        let skip = 0;
        page = page || 1;
        limit = !_.isUndefined(limit) ? limit : Const.LIMIT_RECORD;
        skip = params.skip | (Const.LIMIT_RECORD * (page - 1));
        /* Query name */
        if(query.name){
            query.name = new RegExp(query.name, "i");
        }
        /* Query username */
        if(query.username){
            query.username = new RegExp(query.username, "i");
        }
        /* Query desc */
        if(query.desc){
            query.desc = new RegExp(query.desc, "i");
        }
        /* Query title */
        if(query.title){
            query.title = new RegExp(query.title, "i");
        }
        if(query.subject){
            query.subject = new RegExp(query.subject, "i");
        }

        return new Promise(resolve => {
            if(_.isUndefined(populate)){
                this.model
                    .find({
                        ...query,
                        isRemove: _.isUndefined(query.isRemove) ? false : query.isRemove
                    })
                    .limit(limit)
                    .skip(skip)
                    .sort({
                        $natural: -1
                    })
                    .exec((err, result) => {
                        if(err){
                            resolve(this.handlerQueryError(err));
                        }
                        else{
                            resolve(result);
                        }
                    });
            }
            else{
                this.model
                    .find({
                        ...query,
                        isRemove: _.isUndefined(query.isRemove) ? false : query.isRemove
                    })
                    .limit(limit)
                    .skip(skip)
                    .sort({
                        $natural: -1
                    })
                    .populate(populate)
                    .exec((err, result) => {
                        if(err){
                            resolve(this.handlerQueryError(err));
                        }
                        else{
                            resolve(result);
                        }
                    })
            }
        });
    }

    public getAll = ({ populate }: any): Promise<any> => {
        const fnName = "getAll";
        LogManager.logInfo(this.className, fnName, "Function is calling");
        return new Promise(resolve => {
            if(populate){
                this.model
                    .find({
                        isRemove: false
                    })
                    .sort({
                        $natural: -1
                    })
                    .populate(populate)
                    .exec((err, result) => {
                        if(err){
                            resolve(this.handlerQueryError(err));
                        }
                        else{
                            resolve(result);
                        }
                    });
            }
            else{
                this.model
                    .find({
                        isRemove: false
                    })
                    .sort({
                        $natural: -1
                    })
                    .exec(async (err, result) => {
                        if(err){
                            resolve(this.handlerQueryError(err));
                        }
                        else{
                            resolve(result);
                        }
                    });
            }
        });
    }

    public async exportFileXlsx(fields: any, name: string): Promise<any>{
        let message = "";
        let data = await this.getAll({});
        const fnName = "exportFileXlsx";

        LogManager.logInfo(this.className, fnName, "Function is calling");

        if (data == null || data == "undefined") {
            message = "Database empty";
        }
        // Export json to excel
        //export only the field column in fields
        var xls = json2xls(data, {
            fields: fields
        });

        try {
            fs.writeFileSync(name, xls, "binary");
            message = "The file was saved!";
        } catch (error) {
            message = error;
        }

        const result = {
            path: name.substring(name.indexOf("files"), name.length),
            message: message
        };
        return result;

    }

    public async countAll({ query }): Promise<any>{
        const fnName = "countAll";
        LogManager.logInfo(this.className, fnName, "Function is calling");
        if(query){
            return new Promise(resolve => {
                this.model
                    .count({
                        ...query,
                        isRemove: false
                    })
                    .exec((err, result) => {
                        if(err){
                            resolve(this.handlerQueryError(err));
                        }
                        else{
                            resolve(result);
                        }
                    });
            });
        }
        else{
            return new Promise(resolve => {
                this.model
                    .count({
                        isRemove: false
                    })
                    .exec((err, result) => {
                        if(err){
                            resolve(this.handlerQueryError(err));
                        }
                        else{
                            resolve(result);
                        }
                    });
            });
        }
    }

    public delete = (query): Promise<any> => {
        if(query.id){
            query._id = query.id;
            delete query.id;
        }
        return new Promise(resolve => {
            this.model
                .find(query)
                .remove(err => {
                    console.log(err);
                    resolve();
                });
        });
    }

    protected handlerQueryError(err){
        return Boom.badData(err);
    }

}

