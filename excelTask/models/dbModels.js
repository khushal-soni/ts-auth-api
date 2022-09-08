const mongoose = require("mongoose");

const SegmentSchema = new mongoose.Schema({
    segment: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: {
            unique: true,
            partialFilterExpression: { name: { $type: "string" } },
        },
    },
});

const CountriesSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        index: {
            unique: true,
            partialFilterExpression: { name: { $type: "string" } },
        },
    },
});

const ProductsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: {
            unique: true,
            partialFilterExpression: { name: { $type: "string" } },
        },
    },
});

const ReportSchema = new mongoose.Schema({
    country: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    segment: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    product: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    discountBand: {
        type: String,
        required: true,
    },
    unitsSold: {
        type: Number,
        required: true,
    },
    grossSales: {
        type: Number,
        required: true,
    },
    profit: {
        type: Number,
        required: true,
    },
    dateTimeInUTC: {
        type: Number,
        required: true,
    },
    dateTime: {
        type: Date,
        required: true,
    },
});

exports.Segment = mongoose.model("Segment", SegmentSchema);
exports.Country = mongoose.model("Country", CountriesSchema);
exports.Product = mongoose.model("Product", ProductsSchema);
exports.Report = mongoose.model("Report", ReportSchema);
