import mongoose from "mongoose";
import { User } from "../models/userModel";
import Logger from "../utils/logger";
import { vars } from "../config/vars.config";
import { IUserModel } from "../interface/custom";

export default class userDBServices {
    static async getAllUsers() {
        const users = await User.find();
        if (!users) {
            return false;
        }
        return users;
    }

    static async findUser(email: string) {
        const ifUserExists = await User.findOne({ email });
        // If there is a user return user data else false
        if (ifUserExists) {
            return ifUserExists;
        }
        return false;
    }

    static async saveInstance(userInstance: IUserModel) {
        // Call Save/Create Method on User Instance
        const result = await userInstance.save();
        return result;
    }
}
