import { Response } from "express";

// as responseMessage will contain message for both success and error cases, responseType will contain 'success' or 'error'

interface IResOptions {
    statusCode: number;
    message: string;
    responseData?: any;
    path?: any;
}

export default class CustomResponse {
    static sendResponse(res: Response, options: IResOptions) {
        res.status(options.statusCode).json({
            responseMessage: options.message,
            responseData: options.responseData,
        });
    }

    static sendOK(res: Response, msg?: string | object): object {
        res.status(200);
        return res.json({
            status: "success",
            message: msg,
        });
    }

    static sendSpreadSheet(res: Response, options: IResOptions) {
        res.download(`${options.path}${options.responseData}`, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
}
