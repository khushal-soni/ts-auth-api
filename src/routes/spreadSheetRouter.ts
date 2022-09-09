import express, { Request, Response, NextFunction } from "express";
import spreadSheetController from "../controllers/spreadSheet.controller";
import multerMiddleware from "../middleware/multer.middleware";

class spreadSheetRouter {
    public router: express.Router;

    constructor() {
        this.router = express.Router();
        this.allRouterRegister();
    }

    private allRouterRegister() {
        this.getRouters();
        this.postRouters();
    }

    private getRouters() {
        this.router.get("/", spreadSheetController.getRequest);
    }

    private postRouters() {
        this.router.post(
            "/upload",
            multerMiddleware.upload.single("file"),
            spreadSheetController.importData
        );
    }
}

export default new spreadSheetRouter().router;
