import multer, { Field } from "multer";

export const upload = multer({ dest: './public/uploads' });

// const spreadsheetFilter = (req: Request, file: any, cb: Function) => {
//     if (
//         file.mimetype.includes('excel') ||
//         file.mimetype.includes('spreadsheetml')
//     ) {
//         cb(null, true);
//     } else {
//         cb(`Please upload only excel file`, false);
//     }
// };