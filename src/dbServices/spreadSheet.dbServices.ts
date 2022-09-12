import { Product, Report } from "../models/spreadsheet.model";
import { vars } from "../config/vars.config";
import chalk from "chalk";
import { responseMessage } from "../config/errorManager.config";

export default class spreadSheetDBServices {
    static async getReports() {
        const reports = await Report.find();
        if (!reports) {
            return false;
        }
        return reports;
    }

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

    static async getData() {
        try {
            const data: any = await Report.aggregate([
                {
                    $lookup: {
                        from: "products",
                        let: {
                            product_id: "$product",
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$product_id"],
                                    },
                                },
                            },
                            {
                                $project: {
                                    name: 1,
                                    _id: 0,
                                },
                            },
                        ],
                        as: "product",
                    },
                },
                {
                    $unwind: {
                        path: "$product",
                    },
                },
                {
                    $set: {
                        product: "$product.name",
                        productPrice: {
                            $divide: ["$grossSales", "$unitsSold"],
                        },
                        date: { $dayOfMonth: "$dateTime" },
                        monthNumber: { $month: "$dateTime" },
                        year: { $year: "$dateTime" },
                    },
                },
                {
                    $unset: ["_id", "__v"],
                },
            ]);

            if (!data) {
                throw new Error(`${responseMessage.GNRL_0002}`);
            }

            return data;
        } catch (error: any) {
            console.log(chalk.red.underline(error));
        }
    }
}
