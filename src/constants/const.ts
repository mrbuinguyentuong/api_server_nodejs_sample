export const serverPrefix = "/api";

export const port = 3000;

export const LIMIT_RECORD = 25;
export const FILE_TYPE_IMAGE = "1";
export const LOGIN_FAIL = "login-fail";
export const DISABLE_USER = "disable-user";
export const LOGIN_FAIL_EXPIRE_TIME = 1800;
export const LIMIT_NUMBER_LOGIN_FAIL = 10;

export const whiteList = ["http://localhost:8080"];
export const whileListUrl = [
    `${serverPrefix}/user/login`,
    `${serverPrefix}/user/register`,
    `${serverPrefix}/user/forgot`,
    `${serverPrefix}/api-doc`
];

export const user = {
    minLenUsername: 3,
    maxLenUsername: 36,
    minLenPassword: 8,
    maxLenPassword: 25
};

export const userRoles = [
    {
        id: 1,
        name: "Admin",
        description: "The super admin role."
    },
    {
        id: 2,
        name: "Guest",
        description: "The fallback role for non-users."
    },
    {
        id: 3,
        name: "User",
        description: "The default user role."
    }
];

export const minio = {
    expiryTime: 24 * 60 * 60 * 7
}

export const redis = {
    defaultAvatar: "default_avatar.png",
    expireTime: 24 * 60 * 60 * 7,
    ansKey: "ANS",
    currentLesson: "current_lesson"
}

export const freeUser = {
    redisExpireTime: 60 * 60 * 24
}

export const selectUserField = [
    "id",
    "username",
    "firstName",
    "lastName",
    "email",
    "phone"
];

export const file = {
    fileExtensionSupport: ["jpeg", "jpg", "png"],
    limitSizeUpload: 2 * 1000 * 1000
};

export const typeProduct = [
    {
        type: 0,
        name: "exchange"
    },
    {
        type: 1,
        name: "sell"
    },
    {
        type: 2,
        name: "exchange & sell"
    }
];

