import express, { Request, Response, NextFunction } from "express";
import * as userController from "../controllers/userController";
import auth from "../middleware/auth";
import { Schemas, validateSchema } from "../middleware/ValidateSchema";
const router = express.Router();

// Get list of users - this is only to check Collection without using mongo on termial
router.get("/", auth, userController.getRequest);

router.post(
    "/signup",
    validateSchema(Schemas.user.create),
    userController.registerUser
);

router.post(
    "/login",
    validateSchema(Schemas.user.login),
    userController.userLogin
);

router.post("/logout", userController.userLogout);

router.patch("/refresh", userController.handleRefreshToken);

// Password related routes
router.patch("/change-password", auth, userController.changePassword);

router.patch("/forgot-password", userController.forgotPassword);

router.patch("/reset-password/:token", userController.resetPassword);

// Test authentication middleware
router.get("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌");
    console.log(req.user);
});

export default router;
