import mongoose from "mongoose";
import Logger from "../utils/logger";

(async () => {
    try {
        await mongoose.connect(process.env.DB);
    } catch (err) {
        Logger.error(`Error: ${err}`);
    }
})();
