import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Logger from "../utils/logger";
import { User } from "../models/userModel";
import { responseMessage } from "../config/errorManager.config";
import userDBServices from "../dbServices/user.dbServices";
import CustomResponse from "../utils/customResponse.utils";

export default class UserService {
    static async userRegisterService(data: any, res: Response) {
        const { username, email, password } = data;

        // Check if the user already exists
        const oldUser = await userDBServices.findUser(email);
        if (oldUser) {
            return CustomResponse.sendResponse(res, {
                statusCode: 409,
                message: responseMessage.AUTH_0015,
                responseType: "error",
            });
        }

        const user = new User({
            username,
            email: email.toLowerCase(),
            password,
            status: "active",
        });

        const accessToken: string = jwt.sign(
            { _id: user._id, email },
            process.env.ACCESS_TOKEN_KEY,
            { expiresIn: "5m" }
        );
        const refreshToken: string = jwt.sign(
            { _id: user._id, email },
            process.env.REFRESH_TOKEN_KEY,
            { expiresIn: "10m" }
        );

        if (!accessToken || !refreshToken) {
            return res.status(500).json({
                error: responseMessage.AUTH_0008,
            });
        }

        user.accessToken = accessToken;
        user.refreshToken = refreshToken;

        const result = await userDBServices.saveInstance(user);
        if (!result) {
            CustomResponse.sendResponse(res, {
                statusCode: 500,
                message: responseMessage.GNRL_0002,
                responseType: "error",
            });
        }

        // Send the refresh token as http-only cookie
        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });

        // Send the user document in response if everything goes well.
        CustomResponse.sendResponse(res, {
            statusCode: 200,
            message: responseMessage.AUTH_0001,
            responseData: result,
            responseType: "success",
        });
    }
}
