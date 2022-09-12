// const mongoose = require("mongoose");
import mongoose from "mongoose";

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
        type: String,
        required: true,
    },
    segment: {
        type: String,
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

export const Product = mongoose.model("Product", ProductsSchema);
export const Report = mongoose.model("Report", ReportSchema);
