import express, { Request, Response, NextFunction } from "express";
import userController from "../controllers/user.controller";
import auth from "../middleware/auth.middleware";
import {
    Schemas,
    validateSchema,
} from "../middleware/joiValidation.middleware";

class UserRouter {
    public router: express.Router;

    constructor() {
        this.router = express.Router();
        this.allRouterRegister();
    }

    private allRouterRegister() {
        this.getRouters();
        this.postRouters();
        this.patchRouters();
    }

    private getRouters() {
        // this.router.get("/", auth, userController.getRequest);

        this.router.get(
            "/welcome",
            auth,
            (req: express.Request, res: express.Response) => {
                res.status(200).send("Welcome 🙌");
                console.log(req.user);
            }
        );
    }

    private postRouters() {
        this.router.post(
            "/signup",
            validateSchema(Schemas.user.create),
            userController.registerUser
        );

        this.router.post(
            "/login",
            validateSchema(Schemas.user.login),
            userController.userLogin
        );

        this.router.post("/logout", userController.userLogout);
    }

    private patchRouters() {
        this.router.patch("/refresh", userController.handleRefreshToken);

        // Password related routes
        this.router.patch(
            "/change-password",
            auth,
            userController.changePassword
        );

        this.router.patch("/forgot-password", userController.forgotPassword);

        this.router.patch(
            "/reset-password/:token",
            userController.resetPassword
        );
    }
}

export default new UserRouter().router;
