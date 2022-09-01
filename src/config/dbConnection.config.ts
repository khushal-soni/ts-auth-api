import mongoose from "mongoose";
import Logger from "../utils/logger";
import { vars } from "./vars.config";

const { mongoURI } = vars;

(async () => {
    try {
        if (typeof mongoURI !== "string") {
            throw new Error(`Invalid URI`);
        }
        await mongoose.connect(mongoURI);
        Logger.info(`Connected to database`);
    } catch (err) {
        Logger.error(`Error: ${err}`);
    }
})();
