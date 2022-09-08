const colors = require("colors");

exports.duplicateMsg = function (errorObj) {
    return console.log(
        colors.red.underline(
            `Duplicate Data: Data "${Object.values(
                errorObj.keyValue
            )}" already exists in collection`
        )
    );
};
