import { Request } from "express";
import multer from "multer";

export default class multerMiddleware {
    static storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "uploads");
        },
        filename: (req, file, cb) => {
            console.log(file.originalname);
            cb(null, `${Date.now()}-spreadsheet-${file.originalname}`);
        },
    });

    static upload = multer({
        storage: this.storage,
        fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
            if (
                file.mimetype.includes("excel") ||
                file.mimetype.includes("spreadsheetml")
            ) {
                cb(null, true);
            } else {
                cb(`Please upload a excel file`, false);
            }
        },
    });
}
