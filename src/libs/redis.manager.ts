import * as redis from "redis";
import { LogManager } from "../libs";
import { Const } from "../constants";
import configs from "../configs/config";

const options: any = configs.redis.options || {};

class RedisManager {
    public client: redis.RedisClient;
    private className = "RedisManager";
    fnName = "";

    public init(): Promise<any> {
        let client = redis.createClient(options);
        LogManager.logInfo(this.className, "redis", "Connect redis server");
        return new Promise((resolve) => {
            /* Catch event connect redis successful */
            client.on("connect", () => {
                LogManager.logInfo(this.className, "redis", "Connect redis server is successful");
                client.flushdb();
                resolve();
            });
            /* Catch event connect redis failure */
            client.on("error", err => {
                LogManager.logError(this.className, "redis", "Connect redis server was failure " + err);
                throw err;
            });
            this.client = client;
        });
    }

    public setKey(key, value: any, expire = Const.redis.expireTime) {
        this.fnName = "setKey";
        expire = expire !== null ? expire : Const.redis.expireTime;
        this.client.set(key, value, "EX", expire);
    }

    public getRedisKey(key): Promise<any> {
        this.fnName = "getRedisKey";
        return new Promise((resolve, reject) => {
            this.client.unref();
            this.client.get(key, (err, reply) => {
                if(err){
                    reject(err);
                }
                resolve(reply);
            });
        });
    }

    public removeKey(key): Promise<any> {
        this.fnName = "removeKey";
        return new Promise((resolve) => {
            this.client.unref();
            this.client.del(key, () => {
                resolve();
            });
        });
    }

    public setObject = (key, obj) => {
        this.client.HMSET(key, obj);
    }

    public getObject(key): Promise<any> {
        return new Promise((resolve) => {
            this.client.hgetall(key, (_err, obj) => {
                resolve(obj);
            });
        });
    }

}

export default new RedisManager();