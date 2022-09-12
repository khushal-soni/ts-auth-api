import { Request, Response } from "express";
import { responseMessage } from "../config/errorManager.config";
import xlsx from "xlsx";
import moment from "moment";
import chalk from "chalk";
import { Product, Report } from "../models/spreadsheet.model";
import spreadSheetDBServices from "../dbServices/spreadSheet.dbServices";

const path: string = "./resources/spreadSheets/";
export default class spreadSheetService {
    static async exportData(req: Request) {
        try {
            const data: any = await spreadSheetDBServices.getData();
            if (!data) {
                return {
                    error: {
                        statusCode: 409,
                        message: responseMessage.AUTH_0015,
                    },
                };
            }

            // INCOMPLETE 2. Countries in comma separated

            for (let row of data) {
                row.Country = row.country;
                row.Segment = row.segment;
                row.Product = row.product;
                row["Discount Band"] = row.discountBand;
                row["Product Price"] = row.productPrice;
                row["Units Sold"] = row.unitsSold;
                row["Gross Sales"] = row.grossSales;
                row.Profit = row.profit;
                // row["UTC Date"] = moment(row.dateTimeInUTC).format(
                //     "MM-DD-YYYY"
                // );
                row["Date and Time"] = moment(row.dateTime).format(
                    "MM-DD-YYYY hh:mm:ss"
                );
                row.Date = row.date;
                row["Month Number"] = row.monthNumber;
                row.Year = row.year;

                delete row.country;
                delete row.segment;
                delete row.product;
                delete row.discountBand;
                delete row.productPrice;
                delete row.unitsSold;
                delete row.grossSales;
                delete row.profit;
                delete row.dateTimeInUTC;
                delete row.dateTime;
                delete row.date;
                delete row.monthNumber;
                delete row.year;
            }

            const fileName: string = `report_${Date.now()}.xlsx`;
            const ws = xlsx.utils.json_to_sheet(data);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
            xlsx.writeFile(wb, `${path}${fileName}`);

            return {
                statusCode: 200,
                responseData: fileName,
                path,
            };
        } catch (error: any) {
            console.log(chalk.red.underline(error.message));
        }
    }

    static async importData(req: Request) {
        try {
            const workbook = xlsx.readFile(req.file.path, {
                cellDates: true,
            });

            let worksheets: any = {};
            for (const sheetName of workbook.SheetNames) {
                worksheets[sheetName] = xlsx.utils.sheet_to_json(
                    workbook.Sheets[sheetName]
                );
            }

            // Array of Object containing each row as an object
            const rows = worksheets.Sheet1;

            // Looping through each object i.e 'a row'
            // Manipulate Date and Rename all fields
            for (let row of rows) {
                row.country = row.Country;
                row.segment = row.Segment;
                row.product = row[" Product "];
                row.discountBand = row[" Discount Band "];
                row.unitsSold = row["Units Sold"];
                row.grossSales = row[" Gross Sales "];
                row.profit = row[" Profit "];
                row.dateTimeInUTC = moment.utc(row.Date).valueOf();
                row.dateTime = row.Date;

                // Add the product here
                const productExists: any = await Product.findOne({
                    name: row.product,
                });

                if (!productExists) {
                    let result: any = await spreadSheetDBServices.saveProduct(
                        row.product
                    );
                    if (!result) {
                        throw new Error(responseMessage.GNRL_0002);
                    }
                    row.product = result._id;
                } else {
                    row.product = productExists._id;
                }

                delete row.Date;
                delete row["Month Number"];
                delete row[" Month Name "];
                delete row.Year;
                delete row[" Product "];
                delete row[" Gross Sales "];
                delete row[" Profit "];
                delete row["Units Sold"];
                delete row[" Discount Band "];
                delete row.Country;
                delete row.Segment;
            }

            const result = await Report.insertMany(rows);

            if (!result) {
                return {
                    error: {
                        statusCode: 409,
                        message: responseMessage.AUTH_0015,
                    },
                };
            }

            return {
                statusCode: 200,
                message: `${result.length} records uploaded`,
            };
        } catch (error: any) {
            console.log(chalk.red.underline(error.message));
        }
    }
}
