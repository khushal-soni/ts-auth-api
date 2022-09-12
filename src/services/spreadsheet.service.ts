import { Request, Response } from "express";
import { responseMessage } from "../config/errorManager.config";
import xlsx from "xlsx";
import moment from "moment";
import { Product, Report } from "../models/spreadsheet.model";
import chalk from "chalk";

export default class spreadSheetService {
    static async saveProduct(product: string) {
        try {
            const productDoc = new Product({
                name: product,
            });
            const result = await productDoc.save();
            return result;
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
                    let result: any = await this.saveProduct(row.product);
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
