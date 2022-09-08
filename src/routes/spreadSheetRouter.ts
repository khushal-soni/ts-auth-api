import express, { Request, Response, NextFunction } from "express";
import spreadSheetController from "../controllers/spreadSheet.controller";
import { upload } from "../middleware/multer.middleware";

class spreadSheetRouter {
    public router: express.Router;

    constructor() {
        this.router = express.Router();
        this.allRouterRegister();
    }

    private allRouterRegister() {
        this.getRouters();
    }

    private getRouters() {
        this.router.get('/', spreadSheetController.getRequest);
    }

    private postRouters() {
        this.router.post('/upload', upload.single('spreadsheet'), spreadSheetController.importData)
    }
}

export default new spreadSheetRouter().router;
