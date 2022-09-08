const mongoose = require("mongoose");
const colors = require("colors");

const MONGO_URI = "mongodb://localhost:27017/excelTask";
async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(colors.green(`Connected to database\n`));
    } catch (error) {
        console.log(colors.red(`${error}`));
    }
}

module.exports = connectDB;
