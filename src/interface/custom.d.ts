import * as express from "express";
import { IncomingHttpHeaders } from "http";
import { Document } from "mongoose";

declare global {
    namespace Express {
        // Inject additional properties on express.Request
        interface Request {
            accessToken?: string;
            user?: any;
        }
    }

    namespace NodeJS {
        interface ProcessEnv {
            // Inject additional properties on process.env
            PORT?: string;
            DB: string;
            ACCESS_TOKEN_KEY: string;
            REFRESH_TOKEN_KEY: string;
            RESET_PASSWORD_JWT_KEY: string;
            MJ_APIKEY_PUBLIC: string;
            MJ_APIKEY_PRIVATE: string;
            NODE_ENV: "development" | "production";
        }
    }
}

// Doing this so that instances will have save method on them
export interface IUserModel extends Document {
    username: string;
    email: string;
    password: string;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    status?: string;
    resetLink?: string | undefined;
}

// export interface IUserModel extends IUser, Document {}

export interface DecodedToken {
    _id?: string;
    email?: string;
}
