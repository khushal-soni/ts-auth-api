const xlsx = require("xlsx");
const colors = require("colors");
const moment = require("moment");
const connectDB = require("./config/dbConnection");
const { Segment, Product, Country, Report } = require("./models/dbModels");
const { duplicateMsg } = require("./utils/functions");
const mongoose = require("mongoose");

connectDB();

// Reads the file, it extracts the number of sheets per workbook
const workbook = xlsx.readFile("Financial Sample.xlsx", { cellDates: true });

let worksheets = {};
for (const sheetName of workbook.SheetNames) {
    worksheets[sheetName] = xlsx.utils.sheet_to_json(
        workbook.Sheets[sheetName]
    );
}

// Array of Object containing each row as an object
const rows = worksheets.Sheet1;
// Data to extract - `Segments, Countries and Products` and get Unique Items from them using `sets`
let segments = [];
let countries = [];
let products = [];

// Looping through each object i.e 'a row'
// Manipulate Date and Rename all fields
rows.forEach((row) => {
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

    segments.push(row.segment);
    countries.push(row.country);
    products.push(row.product);
});

// console.log(colors.cyan(rows.slice(-1)));

///////////////////////////////////////////////////////////////
// GETTING RID OF DUPLICATE COUNTRIES, PRODUCTS AND SEGMENTS
// Convert Arrays to Sets to get rid of duplicate data
const segmentsSet = new Set(segments);
const countriesSet = new Set(countries);
const productSet = new Set(products);
// Convert Sets back to Arrays and the duplicate date is gone!!!
segments = Array.from(segmentsSet);
countries = Array.from(countriesSet);
products = Array.from(productSet);
// console.log(segments + "\n\n" + countries + "\n\n" + products + "\n\n");

async function saveSegments(segments) {
    try {
        for (let segment of segments) {
            let document = new Segment({
                segment,
            });
            let result = await document.save();
            // console.log(result);
        }
    } catch (error) {
        if (error.message.includes(`duplicate key`)) {
            duplicateMsg(error);
        } else {
            console.error(colors.red(error.message));
        }
    }
}
saveSegments(segments);

async function saveCountries(countries) {
    try {
        for (let country of countries) {
            let document = new Country({
                name: country,
            });
            let result = await document.save();
            // console.log(result);
        }
    } catch (error) {
        if (error.message.includes(`duplicate key`)) {
            duplicateMsg(error);
        } else {
            console.error(colors.red(error.message));
        }
    }
}
saveCountries(countries);

async function saveProducts(products) {
    try {
        for (let product of products) {
            let document = new Product({
                name: product,
            });
            let result = await document.save();
            // console.log(result);
        }
    } catch (error) {
        if (error.message.includes(`duplicate key`)) {
            duplicateMsg(error);
        } else {
            console.error(colors.red(error.message));
        }
    }
}
saveProducts(products);

async function exportToMongo(rows) {
    try {
        let result;
        for (let row of rows) {
            // Modify the Document before saving it so that it stores the ID
            const segmentID = await Segment.findOne({ segment: row.segment });
            const countryID = await Country.findOne({ name: row.country });
            const productID = await Product.findOne({ name: row.product });

            row.segment = segmentID;
            row.country = countryID;
            row.product = productID;

            let document = new Report(row);
            result = await document.save();
            console.log(result);
        }
    } catch (error) {
        if (error.message.includes(`duplicate key`)) {
            duplicateMsg(error);
        } else {
            console.error(colors.red(error.message));
        }
    }
}
exportToMongo(rows);
