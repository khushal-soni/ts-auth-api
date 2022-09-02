import { response, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel";
import { responseMessage } from "../config/errorManager.config";
import userDBServices from "../dbServices/user.dbServices";
import Mailjet from "node-mailjet";
import Logger from "../utils/logger";

const mailjet: Mailjet = new Mailjet({
    apiKey: process.env.MJ_APIKEY_PUBLIC || "1f1208d7531b4422bbf3ab38318ec3f2",
    apiSecret:
        process.env.MJ_APIKEY_PRIVATE || "ca50fbd647739a1c1abc88c21d19810b",
});

export default class UserService {
    static async registerUser(requestBody: any, res: Response) {
        const { username, email, password } = requestBody;

        const ifAlreadyExists = await userDBServices.findUser({ email });
        if (ifAlreadyExists) {
            return {
                error: {
                    statusCode: 409,
                    message: responseMessage.AUTH_0015,
                },
            };
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

        user.accessToken = accessToken;
        user.refreshToken = refreshToken;

        const result = await userDBServices.saveInstance(user);

        if (!result) {
            return {
                error: {
                    statusCode: 500,
                    message: responseMessage.GNRL_0002,
                },
            };
        }

        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });

        return {
            statusCode: 200,
            message: responseMessage.AUTH_0001,
            responseData: result,
        };
    }

    static async userLogin(requestBody: any, res: Response) {
        let { email, password } = requestBody;
        email = email.toLowerCase();

        const user = await userDBServices.findUser({ email });
        if (!user) {
            return {
                error: {
                    statusCode: 404,
                    message: responseMessage.AUTH_0007,
                },
            };
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return {
                error: {
                    statusCode: 400,
                    message: responseMessage.AUTH_0010,
                },
            };
        }

        const accessToken = jwt.sign(
            { _id: user._id, email },
            process.env.ACCESS_TOKEN_KEY,
            { expiresIn: "5m" }
        );
        const refreshToken = jwt.sign(
            { _id: user._id, email },
            process.env.REFRESH_TOKEN_KEY,
            { expiresIn: "10m" }
        );

        user.status = "active";
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;

        const isUpdated = await userDBServices.saveInstance(user);
        if (!isUpdated) {
            return {
                error: {
                    statusCode: 500,
                    message: responseMessage.GNRL_0002,
                },
            };
        }

        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        return {
            statusCode: 200,
            message: responseMessage.AUTH_0002,
            responseData: isUpdated,
        };
    }

    static async handleRefreshToken(req: any) {
        const cookies = req.cookies;
        if (!cookies?.jwt) return { error: { statusCode: 401, message: "" } };

        const refreshToken = cookies.jwt;

        const user = await userDBServices.findUser({
            refreshToken: `${refreshToken}`,
        });
        if (!user) {
            return {
                error: {
                    statusCode: 403,
                    message: responseMessage.AUTH_0007,
                },
            };
        }

        const decodedToken = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_KEY
        );
        if (!decodedToken) return { error: { statusCode: 403, message: "" } };

        const accessToken = jwt.sign(
            { _id: user._id, email: user.email },
            process.env.ACCESS_TOKEN_KEY,
            { expiresIn: "5m" }
        );

        user.accessToken = accessToken;
        const result: any = userDBServices.saveInstance(user);

        return {
            statusCode: 200,
            message: "",
            responseData: result,
        };
    }

    static async userLogout(req: any, res: Response) {
        const refreshToken = req.cookies.jwt;
        if (!refreshToken) return { error: { statusCode: 204 } };

        const user = await userDBServices.findUser({ refreshToken });

        if (!user) {
            res.clearCookie("jwt", { httpOnly: true });
            return {
                statusCode: 204,
                message: responseMessage.AUTH_0003,
            };
        }

        user.status = "inactive";
        user.accessToken = undefined;
        user.refreshToken = undefined;
        await userDBServices.saveInstance(user);

        res.clearCookie("jwt", { httpOnly: true });

        return {
            statusCode: 204,
            message: responseMessage.AUTH_0003,
        };
    }

    static async changePassword(req: any) {
        const { currentPass, newPass, confirmPass } = req.body;
        if (!currentPass || !newPass || !confirmPass) {
            return {
                error: {
                    statusCode: 400,
                    message: responseMessage.AUTH_0006,
                },
            };
        }

        if (newPass !== confirmPass) {
            return {
                error: {
                    statusCode: 400,
                    message: responseMessage.AUTH_0011,
                },
            };
        }

        if (await bcrypt.compare(currentPass, req.user.password)) {
            req.user.password = newPass;

            const result = await userDBServices.saveInstance(req.user);

            return {
                statusCode: 200,
                message: responseMessage.AUTH_0004,
                responseData: result,
            };
        } else {
            return {
                error: {
                    statusCode: 400,
                    message: responseMessage.AUTH_0012,
                },
            };
        }
    }

    static async forgotPassword(req: any) {
        const { email } = req.body;
        console.log(email);

        const user = await userDBServices.findUser({ email });
        if (!user) {
            return {
                error: {
                    statusCode: 404,
                    message: responseMessage.AUTH_0007,
                },
            };
        }

        const resetToken = jwt.sign(
            { _id: user._id },
            process.env.RESET_PASSWORD_JWT_KEY,
            { expiresIn: "5m" }
        );

        user.resetLink = resetToken;
        const result = await userDBServices.saveInstance(user);
        Logger.info(result);
        if (!result) {
            return {
                error: {
                    statusCode: 400,
                    message: responseMessage.GNRL_0002,
                },
            };
        }

        const mailResult = await mailjet
            .post("send", { version: "v3.1" })
            .request({
                Messages: [
                    {
                        From: {
                            Email: "khushalsoni089@gmail.com",
                            Name: "Khushal Soni",
                        },
                        To: [
                            {
                                Email: `${email}`,
                                Name: `${user.username}`,
                            },
                        ],
                        Subject: "Password Reset Link",
                        TextPart: "",
                        HTMLPart: `<h2>Click on the link below to reset your password.</h2>
                <a href='http://localhost:3000/users/reset-password/${resetToken}'><button>Click here</button></a>`,
                    },
                ],
            });

        if (!mailResult) {
            return {
                error: {
                    statusCode: 400,
                    message: responseMessage.AUTH_0018,
                },
            };
        }

        return {
            statusCode: 200,
            message: responseMessage.AUTH_0019,
            responseData: {
                resetToken: user.resetLink,
            },
        };
    }

    static async resetPassword(req: any) {
        const resetToken = req.params.token;
        const { newPass } = req.body;

        if (!resetToken) {
            return {
                error: {
                    statusCode: 401,
                    message: responseMessage.AUTH_0014,
                },
            };
        }

        if (!newPass) {
            return {
                error: {
                    statusCode: 401,
                    message: responseMessage.AUTH_0006,
                },
            };
        }

        try {
            const decodedToken = jwt.verify(
                resetToken,
                process.env.RESET_PASSWORD_JWT_KEY
            );
            if (!decodedToken) {
                return {
                    error: {
                        statusCode: 401,
                        message: responseMessage.AUTH_0016,
                    },
                };
            }

            const user = await userDBServices.findUser({
                resetLink: resetToken,
            });
            if (!user) {
                return {
                    error: {
                        statusCode: 404,
                        message: responseMessage.AUTH_0007,
                    },
                };
            }

            user.password = newPass;
            user.resetLink = undefined;
            const isSaved = await userDBServices.saveInstance(user);
            if (!isSaved) {
                return {
                    error: {
                        statusCode: 500,
                        message: responseMessage.GNRL_0002,
                    },
                };
            }

            // Send response if new password is saved successfully.
            return {
                statusCode: 200,
                message: responseMessage.AUTH_0004,
            };
        } catch (err: any) {
            if (err.message.includes("jwt expired")) {
                return {
                    error: {
                        statusCode: 400,
                        message: responseMessage.AUTH_0017,
                    },
                };
            }

            return {
                error: {
                    statusCode: 500,
                    message: responseMessage.AUTH_0002,
                },
            };
        }
    }
}
