import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IUserModel } from "../interface/custom";

const UserSchema: Schema = new Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minLength: 8,
        },
        accessToken: {
            type: String,
            default: "",
        },
        refreshToken: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            required: true,
        },
        resetLink: {
            type: String,
            default: "",
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

// This method will be called automatically on every DB action, I'll use it to hide credentials.
UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    return userObject;
};

// A mongoose middleware which hashes the password when save event is triggered.
UserSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

export const User = mongoose.model<IUserModel>("User", UserSchema);
