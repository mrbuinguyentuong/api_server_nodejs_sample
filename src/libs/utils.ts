import * as _ from "lodash";
import * as bcrypt from "bcryptjs";
import * as uuid from "uuid";
import * as async from "async";
const path = require("path");
const phone = require("phone");
import { AdminService } from "../services";
import { redis } from '../constants/const';

class Utils{

    constructor(){

    }

    public isEmpty(param: any): boolean | Object | any {
        return _.isUndefined(param) || _.isEmpty(param) || _.isEmpty(param.trim());
    }

    public removePrivacy(params): any{
        return _.omit(params, ["password"]);
    }

    public hashPassword(params, callback): void{
        const saltRound = 10;
        const { password } = params;

        bcrypt.hash(password, saltRound, (err, hash) => {
            callback(err, hash);
        });
    }

    public hashPasswordSync(password: string): any{
        if(!password){
            return null;
        }
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
    }

    public comparePassword(params, callback): void {
        const { password, hash } = params;
        bcrypt.compare(password, hash, (err, isMatch) => {
            if(err){
                return callback(err);
            }
            callback(null, isMatch);
        });
    }

    public generationID(): string {
        return uuid.v4();
    }

    public validatePhone(params): boolean {
        return _.size(phone(params.phone, "VN")) !== 0;
    }

    public tmpDirectory(){
        return path.join(path.resolve(), "../../tmp/");
    }

    public createFileName(fileName){
        let arr: any = [];
        const timeStamp = new Date().getTime();

        arr = _.split(fileName, ".");
        return _.toString(`${_.dropRight(arr).join("")}-${timeStamp}.${arr[arr.length - 1]}`);
    }

    public makeRedisKeyForAns({ lesson, sessionID }){
        return `${lesson}-${sessionID}-${redis.ansKey}`;
    }

    public createAdminInit = async (): Promise<any> => {
        const users = [
            {
                username: "admin",
                email: "mrbuinguyentuong94@gmail.com",
                password: "Xyz@696969",
                phone: "+84987654321",
                role: 1
            }
        ];

        return new Promise(resolve => {
            async.eachSeries(
                users,
                async (user, cb) => {
                    await AdminService.create(user);
                    cb();
                },
                () => {
                    resolve();
                }
            );
        });
    }

    public madeTelegramMessage = (topic: any) => {
        let message = "Author " + topic.author + " has new topic: " + topic.subject + " [link](" + topic.detail + ").";
        return message;
    }

}

export default new Utils();