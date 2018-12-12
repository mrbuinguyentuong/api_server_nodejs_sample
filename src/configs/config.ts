import devConfig from "./dev.config";
import prodConfig from "./prod.config";

export const env = process.env.NODE_ENV || "develop";

const config = () => {
    console.log(`App is running with env: ${env}`);
    switch(env){
        case "production":
            return prodConfig;
        default:
            return devConfig;
    }
};
export default config();

//Config send mail
export const mail_config = {
    host: "",
    port: 465,
    secure: true,
    emailTo: "admin@bntinfo.com",
    auth: {
        user: "",
        pass: ""
    }
}
