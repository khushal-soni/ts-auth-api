import express, { Request, Response, NextFunction } from "express";
import spreadSheetController from "../controllers/spreadSheet.controller";
import auth from "../middleware/auth.middleware";
// import {
//     Schemas,
//     validateSchema,
// } from "../middleware/joiValidation.middleware";

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
        this.router.get(
            "/welcome",
            (req: express.Request, res: express.Response) => {
                res.status(200).send("Welcome 🙌");
                console.log(req.user);
            }
        );
    }
}

export default new spreadSheetRouter().router;
