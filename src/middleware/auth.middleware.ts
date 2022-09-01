import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/userModel";
import Logger from "../utils/logger";

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken: any = req.headers["x-access-token"];
        if (!accessToken) {
            return res.status(403).json({ error: `auth-token missing` });
        }
        // Logger.info(accessToken);

        // Verify the token
        const decodedToken = (await jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_KEY
        )) as JwtPayload;

        if (decodedToken) {
            // Find the user if token is verified.
            const user = await User.findOne({
                _id: decodedToken._id,
                accessToken,
            });
            if (!user) return res.status(400).json({ error: `No user found.` });
            console.log(user);
            req.user = user;
            req.accessToken = accessToken;

            next();
        }
    } catch (err: any) {
        Logger.error("--MSG--" + err.message + "--NAME--" + err.name);

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                error: "invalid_token",
                message: "The access token expired",
            });
        }

        res.status(500).json({
            error: "authentication_error",
            message: "Error while authenticating",
        });
    }
};
