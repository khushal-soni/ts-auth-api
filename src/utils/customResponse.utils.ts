import { Response } from "express";

// as responseMessage will contain message for both success and error cases, responseType will contain 'success' or 'error'

interface IResOptions {
    statusCode: number;
    message: string;
    responseType: string;
    responseData?: any;
}

export default class CustomResponse {
    static sendResponse(res: Response, options: IResOptions) {
        res.status(options.statusCode).json({
            responseMessage: options.message,
            responseData: options.responseData,
        });
    }
}
