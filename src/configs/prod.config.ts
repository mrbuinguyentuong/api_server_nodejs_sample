//Host information
const host = process.env.HOST || "";
const database_name = "";
const database_user = "";
const database_password = "";
//Database config
const db_host = process.env.DB_HOST || host;
const db_name = process.env.DB_NAME || database_name;
const db_user = process.env.DB_USER || database_user;
const db_password = process.env.DB_PASSWORD || database_password;
//Redis config
const redis_host = process.env.REDIS_HOST || host;
const redis_port = process.env.REDIS_PORT || "";

const dbDev = {
    host: db_host,
    name: db_name,
    user: db_user,
    password: db_password,
}

const config = {
    database: {
        host: dbDev.user
        ?
        `mongodb://${dbDev.user}:${dbDev.password}@${dbDev.host}/${dbDev.name}`
        :
        `mongodb://${dbDev.host}/${dbDev.name}`
    },
    jwt: {
        options: {
            algorithm: "HS256",
            expirseIn: "24h"
        },
        secretKey: "@_api_server_nodejs_@",
        timeout: 15000
    },
    minio: {

    },
    redis: {
        options: {
            host: redis_host,
            port: redis_port
        }
    },
    session: {
        secret: "",
        resave: false,
        saveUninitialized: true
    },
    clientSite: "http://localhost:6969",
    emailAdmin: "admin@bntinfo.com",
    email_config: {
        host: "",
        port: 465,
        secure: true,
        auth: {
            user: "",
            pass: ""
        }
    }
};

export default config;