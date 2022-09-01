import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import "../config/dbConnection.config";
import cookieParser from "cookie-parser";

import userRouter from "../routes/userRouter";
import Logger from "../utils/logger";

const app = express();
const port = process.env.PORT || 3000;

// Set a middleware for logger
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public")));
app.use("/users", userRouter);

app.get("*", (req: Request, res: Response) => {
    res.status(404).send("Error: Page not Found");
});

export default app;
