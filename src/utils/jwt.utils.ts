import jwt from "jsonwebtoken";
import { Document } from "mongoose";
import { IUserModel, ITokens } from "../interface/custom";
import { vars } from "../config/vars.config";
import { string } from "joi";

const { accessTokenKey, refreshTokenKey } = vars;

export default class JWTMethods {
    static generateTokens(user: IUserModel, expireTime: string[]) {
        const accessToken: string = jwt.sign(
            { _id: user._id, email: user.email },
            accessTokenKey,
            { expiresIn: expireTime[0] }
        );
        const refreshToken: string = jwt.sign(
            { _id: user._id, email: user.email },
            refreshTokenKey,
            { expiresIn: expireTime[1] }
        );

        const tokens: ITokens = {
            accessToken,
            refreshToken,
        };

        return tokens;
        // return { accessToken, refreshToken };
    }
}
