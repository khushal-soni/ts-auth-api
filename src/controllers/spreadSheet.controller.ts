import { Request, Response } from "express";
import Logger from "../utils/logger";
import { responseMessage } from "../config/errorManager.config";
import CustomResponse from "../utils/customResponse.utils";
import spreadSheetService from "../services/spreadsheet.service";
export default class spreadSheetController {
    ///////////////////////////////////////////
    // IGNORE THIS ROUTE //////////////////////
    static async getRequest(req: Request, res: Response) {
        res.send(`SpreadSheet Route Working`);
    }
    ///////////////////////////////////////////
    ///////////////////////////////////////////

    static async importData(req: Request, res: Response) {
        try {
            if (!req.file) {
                return CustomResponse.sendResponse(res, {
                    statusCode: 400,
                    message: `Please upload an excel file`,
                });
            }

            const result: any = await spreadSheetService.importData(req);

            if (result && result.error) {
                return CustomResponse.sendResponse(res, result.error);
            }

            console.log(result);

            return CustomResponse.sendResponse(res, result);
        } catch (error: any) {
            console.log(error);

            return CustomResponse.sendResponse(res, {
                statusCode: 500,
                message: responseMessage.GNRL_0001,
            });
        }
    }

    static async download(req: Request, res: Response) {
        try {
            const result: any = await spreadSheetService.exportData(req);

            if (result && result.error) {
                return CustomResponse.sendResponse(res, result.error);
            }

            return CustomResponse.sendSpreadSheet(res, result);
        } catch (error: any) {
            console.log(error);

            return CustomResponse.sendResponse(res, {
                statusCode: 500,
                message: responseMessage.GNRL_0001,
            });
        }
    }
}
