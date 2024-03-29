import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import "../config/dbConnection.config";
import cookieParser from "cookie-parser";

import userRouter from "../routes/userRouter";
import spreadSheetRouter from "../routes/spreadSheetRouter";

const app = express();

// Set a middleware for logger
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/public")));
app.use("/users", userRouter);
app.use("/api/spreadsheet", spreadSheetRouter);

app.get("*", (req: Request, res: Response) => {
    res.status(404).send("Error: Page not Found");
});

export default app;
