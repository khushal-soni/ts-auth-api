import { Request, Response } from "express";
import { responseMessage } from "../config/errorManager.config";
import Logger from "../utils/logger";
import UserService from "../services/user.service";
import CustomResponse from "../utils/customResponse.utils";
// const multer = require("multer");
import * as multer from "multer";

export default class spreadSheetController {
   
    ///////////////////////////////////////////
    // IGNORE THIS ROUTE //////////////////////
    static async getRequest(req: Request, res: Response) {
        res.send(`SpreadSheet Route Working`);
    }
    ///////////////////////////////////////////
    ///////////////////////////////////////////

    static async importData(req: Request, res: Response) {
        
    }
   
}