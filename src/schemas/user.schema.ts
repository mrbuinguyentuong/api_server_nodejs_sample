import * as mongoose from "mongoose";
import * as paginate from "mongoose-paginate";
import * as uniqueValidator from "mongoose-unique-validator";
import * as Bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as _ from "lodash";
import * as Boom from "boom";

const phone = require("phone");

import { options, validateMinLength, ISchema, validateMaxLength } from "./root.schema";
import config from "../configs/config";
import { Const, Error as errCode } from "../constants";

const Schema = mongoose.Schema;

/* Interface */
export interface IUserSchema extends ISchema {}

class UserSchema implements IUserSchema {

    private schemaDef: mongoose.SchemaDefinition;
    private schemaName: string;

    constructor() {

        this.schemaName = "User";
        this.schemaDef = {
            username: {
                type: String,
                required: [true, errCode.EM0115],
                unique: true,
                dropDups: true,
                validate: this.validateUsername()
            },
            password: {
                type: String,
                required: [true, errCode.EM0104],
                dropDups: true,
                trim: true,
                validate: this.validatePassword()
            },
            email: {
                type: String,
                required: [true, errCode.EM0112],
                dropDups: true,
                trim: true,
                validate: this.validateEmail()
            },
            phone: {
                type: String,
                trim: true,
                unique: true,
                validate: this.validatePhone()
            },
            googleToken: {
                type: String
            },
            facebookToken: {
                type: String
            },
            fullName: {
                type: String
            },
            address: {
                type: String
            },
            avatar: {
                type: String
            },
            rating: {
                type: Number
            },
            star: {
                type: Number
            },
            role: {
                type: String,
                required: false,
                enum: ["1", "2", "3"],
                trim: true,
                default: "2"
            },
            isRemove: {
                type: String,
                default: false
            }
        }

    }

    public schemaInstance = () => {
        const self = this;
        let schema = new Schema(
            this.schemaDef,
            {
                ...options,
                collection: self.schemaName
            }
        );
        schema.plugin(paginate).plugin(uniqueValidator);

        schema.methods.validatePassword = function(reqPassword: string) {
            if(!reqPassword){
                return null;
            }
            if(!this._doc.password){
                return true;
            }
            return Bcrypt.compareSync(reqPassword, this._doc.password);
        };

        schema.methods.removePrivacyInfo = (user): object => {
            user._doc = _.omit(user._doc, ["password", "resetPasswordToken"]);
            return user;
        };

        schema.methods.generationToken = (user): string => {
            return jwt.sign(user, config.jwt.secretKey);
        };

        schema.pre("save", function(next){
            if(this.isModified("password")){
                this.password = self.hashPassword(this.password);
            }
            next();
        });

        schema.post("save", function(error: any, _doc, next){
            if(error.name === "ValidationError"){
                if(error.errors.role){
                    next(Boom.badData("Role was outside scope"));
                }
                if(error.errors.password){
                    next(Boom.badData(error.errors.password.message));
                }
                if(error.errors.username){
                    const { kind } = error.errors.username;

                    switch (kind) {
                        case "unique":
                            next(Boom.conflict(errCode.EM0116));
                            break;
                        default:
                            next(Boom.badData(error.errors.username.message));
                            break;
                    }
                }
                if(error.errors.email){
                    let { message } = error.errors.email;
                    next(Boom.badData(message));
                }
                if(error.errors.phone){
                    if(error.errors.phone.kind === "unique"){
                        next(Boom.conflict(errCode.EM0118));
                    }
                    next(Boom.badData(error.errors.phone.message));
                }
                next();
            }
            else{
                next(error);
            }
        });

        schema.post("find", function(error: any, _doc: any, next){
            if(error.kind === "ObjectId"){
                next(new Error("User is not found"));
            }
            next();
        });

        schema.pre("findOneAndUpdate", function(next){
            if(this.getUpdate().password){
                this.getUpdate().password = self.hashPassword(this.getUpdate().password);
            }
            if(this.getUpdate().apiKey){
                this.getUpdate().isUpdateKey = false;
            }
            return next();
        });

        schema.post("findOneAndUpdate", function(error: any, _doc, next){
            if(error.code === 11000){
                return next(Boom.conflict("Username is exist"));
            }
            next();
        });

        return schema;

    }

    private hashPassword = (password: string): string | null => {
        if(!password){
            return null;
        }
        return Bcrypt.hashSync(password, Bcrypt.genSaltSync(8));
    }

    /* Get Name Model */
    public getName = () => {
        return this.schemaName;
    }

    public validateUsername = () => {
        return [
            {
                validator: function(v){
                    return validateMinLength(v, Const.user.minLenUsername);
                },
                message: errCode.EM0106
            },
            {
                validator: function(v){
                    return validateMaxLength(v, Const.user.maxLenUsername);
                }
            }
        ];
    }

    public validateEmail = () => {
        return [
            {
                validator: function(email){
                    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(email);
                },
                message: errCode.EM0110
            }
        ];
    }

    public validatePhone = () => {
        return [
            {
                validator: function(_phone){
                    let arr = phone(_phone);
                    if(!_.isArray(arr) || _.isUndefined(arr[1])){
                        return false;
                    }
                    else{
                        return true;
                    }
                },
                message: errCode.EM0117
            }
        ];
    }

    public validatePassword = () => {
        return [
            {
                validator: function(v){
                    return validateMinLength(v, Const.user.minLenPassword);
                },
                message: errCode.EM0107
            },
            {
                validator: function(v){
                    return validateMaxLength(v, Const.user.maxLenPassword);
                },
                message: errCode.EM0108
            },
            {
                validator: function(v){
                    return new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})").test(v);
                },
                message: errCode.EM0109
            }
        ];
    }

}

export default new UserSchema();