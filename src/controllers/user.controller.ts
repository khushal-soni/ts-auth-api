import { Request, Response } from "express";
import { responseMessage } from "../config/errorManager.config";
import Logger from "../utils/logger";
import UserService from "../services/user.service";
import CustomResponse from "../utils/customResponse.utils";

export default class userController {
    /*
    ///////////////////////////////////////////
    // IGNORE THIS ROUTE //////////////////////
    static async getRequest(req: Request, res: Response) {
        const users = await User.find();
        if (!users || users.length === 0) {
            return res.status(404).json({ error: `No user found` });
        }
        res.status(200).json({ users });
    }
    ///////////////////////////////////////////
    ///////////////////////////////////////////
    */

    static async registerUser(req: Request, res: Response) {
        try {
            const requestBody = req.body;
            const result: any = await UserService.registerUser(
                requestBody,
                res
            );

            if (result && result.error) {
                return CustomResponse.sendResponse(res, result.error);
            }

            return CustomResponse.sendResponse(res, result);
        } catch (error: any) {
            Logger.error(`Error: ${error.message}`);
            return CustomResponse.sendResponse(res, {
                statusCode: 500,
                message: responseMessage.GNRL_0001,
            });
        }
    }

    static async userLogin(req: Request, res: Response) {
        try {
            const requestBody = req.body;

            const result: any = await UserService.userLogin(requestBody, res);

            if (result && result.error) {
                return CustomResponse.sendResponse(res, result.error);
            }

            return CustomResponse.sendResponse(res, result);
        } catch (error: any) {
            Logger.error(`Error: ${error.message}`);
            return CustomResponse.sendResponse(res, {
                statusCode: 500,
                message: responseMessage.GNRL_0001,
            });
        }
    }

    static async handleRefreshToken(req: Request, res: Response) {
        try {
            const result: any = await UserService.handleRefreshToken(req);

            if (result && result.error) {
                return CustomResponse.sendResponse(res, result.error);
            }

            return CustomResponse.sendResponse(res, result);
        } catch (err: any) {
            Logger.error("--MSG--" + err.message + "\n--NAME--" + err.name);

            return CustomResponse.sendResponse(res, {
                statusCode: 500,
                message: responseMessage.GNRL_0001,
                responseData: err.message,
            });
        }
    }

    static async userLogout(req: Request, res: Response) {
        try {
            const result: any = await UserService.userLogout(req, res);

            if (result && result.error) {
                return CustomResponse.sendResponse(res, result.error);
            }

            return CustomResponse.sendResponse(res, result);
        } catch (err: any) {
            Logger.error(err);
            return CustomResponse.sendResponse(res, {
                statusCode: 500,
                message: responseMessage.GNRL_0001,
            });
        }
    }

    static async changePassword(req: Request, res: Response) {
        try {
            // The auth middleware sets req.user with the user's document so i can use user document with Querying the database.

            // Get the current password from user
            // const requestBody = req.body;

            const result: any = await UserService.changePassword(req);

            if (result && result.error) {
                return CustomResponse.sendResponse(res, result.error);
            }

            return CustomResponse.sendResponse(res, result);
        } catch (err: any) {
            Logger.error(err);
            return CustomResponse.sendResponse(res, {
                statusCode: 500,
                message: responseMessage.GNRL_0001,
            });
        }
    }

    static async forgotPassword(req: Request, res: Response) {
        try {
            const result: any = await UserService.forgotPassword(req);

            if (result && result.error) {
                return CustomResponse.sendResponse(res, result.error);
            }

            return CustomResponse.sendResponse(res, result);
        } catch (error) {
            Logger.error(error);
            return CustomResponse.sendResponse(res, {
                statusCode: 500,
                message: responseMessage.GNRL_0001,
            });
        }
    }

    static async resetPassword(req: Request, res: Response) {
        try {
            const result: any = await UserService.resetPassword(req);

            if (result && result.error) {
                return CustomResponse.sendResponse(res, result.error);
            }

            return CustomResponse.sendResponse(res, result);
        } catch (error) {
            Logger.error(error);
            return CustomResponse.sendResponse(res, {
                statusCode: 500,
                message: responseMessage.GNRL_0001,
            });
        }
    }
}
