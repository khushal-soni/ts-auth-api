import { response, Response } from "express";
import { responseMessage } from "../config/errorManager.config";
import xlsx from "xlsx";
import moment from "moment";
import Logger from "../utils/logger";
import { Segment, Country, Product, Report } from "../models/spreadsheet.model";
import chalk from "chalk";

export default class spreadSheetService {
    static segments: string[] = [];
    static countries: string[] = [];
    static products: string[] = [];

    static duplicateMsg = function (errorObj: any) {
        return console.log(
            chalk.red.underline(
                `Duplicate Data: Data "${Object.values(
                    errorObj.keyValue
                )}" already exists in collection`
            )
        );
    };

    static async saveSegments(segments: string[]) {
        try {
            for (let segment of segments) {
                let document = new Segment({
                    segment,
                });
                let result = await document.save();
                // console.log(result);
            }
        } catch (error: any) {
            if (error.message.includes(`duplicate key`)) {
                this.duplicateMsg(error);
            } else {
                console.error(Logger.error(error.message));
            }
        }
    }

    static async saveCountries(countries: string[]) {
        try {
            for (let country of countries) {
                let document = new Country({
                    name: country,
                });
                let result = await document.save();
                // console.log(result);
            }
        } catch (error: any) {
            if (error.message.includes(`duplicate key`)) {
                this.duplicateMsg(error);
            } else {
                console.error(Logger.error(error.message));
            }
        }
    }

    static async saveProducts(products: string[]) {
        try {
            for (let product of products) {
                let document = new Product({
                    name: product,
                });
                let result = await document.save();
                // console.log(result);
            }
        } catch (error: any) {
            if (error.message.includes(`duplicate key`)) {
                this.duplicateMsg(error);
            } else {
                console.error(Logger.error(error.message));
            }
        }
    }

    static async exportToMongo(rows: any) {
        try {
            let result;
            for (let row of rows) {
                // Modify the Document before saving it so that it stores the ID
                const segmentID = await Segment.findOne({
                    segment: row.segment,
                });
                const countryID = await Country.findOne({ name: row.country });
                const productID = await Product.findOne({ name: row.product });

                row.segment = segmentID;
                row.country = countryID;
                row.product = productID;

                // let document = new Report(row);
                // result = await document.save();
                // console.log(result);
            }

            console.log(rows.slice(-1));

            return "working till here";
            // Perform bulk operation here
            // return object containing number of docs inserted
        } catch (error: any) {
            if (error.message.includes(`duplicate key`)) {
                this.duplicateMsg(error);
            } else {
                console.error(Logger.error(error.message));
            }
        }
    }

    static async importData(requestBody: any) {
        // Reads the file, it extracts the number of sheets per workbook

        const workbook = xlsx.readFile(requestBody.file.path, {
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
        // Data to extract - `Segments, Countries and Products` and get Unique Items from them using `sets`

        // Looping through each object i.e 'a row'
        // Manipulate Date and Rename all fields
        rows.forEach((row: any) => {
            row.country = row.Country;
            row.segment = row.Segment;
            row.product = row[" Product "];
            row.discountBand = row[" Discount Band "];
            row.unitsSold = row["Units Sold"];
            row.grossSales = row[" Gross Sales "];
            row.profit = row[" Profit "];
            row.dateTimeInUTC = moment.utc(row.Date).valueOf();
            row.dateTime = row.Date;

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

            this.segments.push(row.segment);
            this.countries.push(row.country);
            this.products.push(row.product);
        });

        ///////////////////////////////////////////////////////////////
        // GETTING RID OF DUPLICATE COUNTRIES, PRODUCTS AND SEGMENTS
        // Convert Arrays to Sets to get rid of duplicate data
        const segmentsSet = new Set(this.segments);
        const countriesSet = new Set(this.countries);
        const productSet = new Set(this.products);
        // Convert Sets back to Arrays and the duplicate date is gone!!!
        this.segments = Array.from(segmentsSet);
        this.countries = Array.from(countriesSet);
        this.products = Array.from(productSet);

        // console.log(
        //     this.segments +
        //         "\n\n" +
        //         this.countries +
        //         "\n\n" +
        //         this.products +
        //         "\n\n"
        // );
        // console.log(rows.slice(-1));

        /*
        // Double check if these functions are working properly
        this.saveSegments(this.segments);
        this.saveCountries(this.countries);
        this.saveProducts(this.products);

        // Modify this method so that it used insertMany and returns the number of documents inserted, and then send that as response
        this.exportToMongo(rows);

        return {};
        */

        return {
            statusCode: 200,
            message: `Uploaded File Successfully`,
        };
    }
}