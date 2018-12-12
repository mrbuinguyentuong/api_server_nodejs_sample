import { IRoot } from "./IRoot";

enum Role {
    Admin = "1",
    Guest = "2",
    FreeUser = "3",

}

interface IUser extends IRoot {
    username: string;
    password: string;
    email: string;
    fullName: string;
    address: string;
    phone: string;
    avatar: string;
    rating: string;
    star: number;
    googleToken?: string;
    facebookToken?: string;
    role: Role;
}

export { IUser }