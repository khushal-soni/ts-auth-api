import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Mailjet from "node-mailjet";
import * as resMsgs from "../utils/responseMessages";
import { User } from "../models/userModel";
import Logger from "../utils/logger";

const mailjet: Mailjet = new Mailjet({
    apiKey: process.env.MJ_APIKEY_PUBLIC || "1f1208d7531b4422bbf3ab38318ec3f2",
    apiSecret:
        process.env.MJ_APIKEY_PRIVATE || "ca50fbd647739a1c1abc88c21d19810b",
});

export const getRequest = async (req: Request, res: Response) => {
    const users = await User.find();
    if (!users || users.length === 0) {
        return res.status(404).json({ error: `No user found` });
    }
    res.status(200).json({ users });
};

export const registerUser = async (req: Request, res: Response) => {
    try {
        // Get user Input
        const { username, email, password } = req.body;

        // Validate Input
        if (!username && !email && !password) {
            return res.status(400).json({
                error: `Invalid input, please provide the required data`,
            });
        }

        // Check if the user already exists
        const oldUser = await User.findOne({ email });
        if (!oldUser) {
            return res
                .status(409)
                .json({ error: `User already exists, please login` });
        }

        // create User instance
        const user = new User({
            username,
            email: email.toLowerCase(),
            password,
            status: "active",
        });
        // create access and refresh tokens
        const accessToken: string = await jwt.sign(
            { _id: user._id, email },
            process.env.ACCESS_TOKEN_KEY,
            { expiresIn: "5m" }
        );
        const refreshToken: string = await jwt.sign(
            { _id: user._id, email },
            process.env.REFRESH_TOKEN_KEY,
            { expiresIn: "10m" }
        );

        if (!accessToken || !refreshToken) {
            return res.status(500).json({
                error: `Error while generating the token, please try again`,
            });
        }

        // Save token to User Instance
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        // Save the User Instance to DB
        const isCreated = await user.save();
        if (!isCreated) {
            return res.status(500).json({
                error: `Error while creating the new user`,
            });
        }

        // Send the refresh token as http-only cookie
        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });

        // Send the user document in response if everything goes well.
        res.status(200).json({
            username: user.username,
            accessToken: accessToken,
        });
    } catch (err: any) {
        Logger.error(err);
        res.status(500).json({ result: 0, error_message: err.message });
    }
};

export const userLogin = async (req: Request, res: Response) => {
    try {
        // Get the user input
        let { email, password } = req.body;

        // Validate input
        if (!email && !password) {
            return res.status(400).json("Please fill in all the fields.");
        }

        email = email.toLowerCase();
        // Check if the user exists and the password matches
        const user = await User.findOne({ email });

        // Check if the user exists
        if (!user) {
            return res
                .status(404)
                .json({ result: 0, error: `user does not exist` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            // Create tokens if the credentials match
            const accessToken = await jwt.sign(
                { _id: user._id, email },
                process.env.ACCESS_TOKEN_KEY,
                { expiresIn: "5m" }
            );
            const refreshToken = await jwt.sign(
                { _id: user._id, email },
                process.env.REFRESH_TOKEN_KEY,
                { expiresIn: "10m" }
            );

            // Check if the token is generated
            if (!accessToken && !refreshToken) {
                return res.status(500).json({
                    result: 0,
                    error: `Error while generating the token, please try again`,
                });
            }

            user.status = "active";
            user.accessToken = accessToken;
            user.refreshToken = refreshToken;
            const isUpdated = await user.save();
            if (!isUpdated) {
                return res.status(500).json({
                    result: 0,
                    error: `Error while updating user details`,
                });
            }

            // Send the refresh token as http-only cookie
            res.cookie("jwt", refreshToken, {
                httpOnly: true,
                sameSite: "none",
                secure: true,
                maxAge: 24 * 60 * 60 * 1000,
            });

            // Send the user document in response if everything goes well.
            res.status(200).json({
                result: 1,
                data: {
                    username: user.username,
                    token: accessToken,
                    tokenType: "access",
                },
            });
        } else {
            return res
                .status(400)
                .json({ result: 0, error: `Invalid credentials` });
        }
    } catch (err: any) {
        Logger.error(err);
        res.status(500).json({
            result: 0,
            error: err.message,
        });
    }
};

export const handleRefreshToken = async (req: Request, res: Response) => {
    try {
        // Look for the cookie containing refresh token
        const cookies = req.cookies;
        // check if jwt cookie exists
        if (!cookies?.jwt) return res.sendStatus(401);
        const refreshToken = cookies.jwt;

        // Check if the user exists with that refresh token
        const user = await User.findOne({ refreshToken: `${refreshToken}` });

        if (!user)
            return res
                .status(403)
                .json({ error: `No user found with this refresh token` });

        // Verify the refresh token
        const decodedToken = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_KEY
        );
        if (!decodedToken) return res.sendStatus(403);

        // If the Refresh token is verified then generate a new access token and send it as JSON response
        const accessToken = await jwt.sign(
            { _id: user._id, email: user.email },
            process.env.ACCESS_TOKEN_KEY,
            { expiresIn: "5m" }
        );

        // Update the user document so that it contains the new accessToken
        user.accessToken = accessToken;
        await user.save();

        res.status(200).json({ username: user.username, accessToken });
    } catch (err: any) {
        Logger.error("--MSG--" + err.message + "--NAME--" + err.name);

        // If it is not a TokenExpiredError, send error msg
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                error: "invalid_token",
                message: "The access token expired",
            });
        }

        res.status(500).json({ error: `Internal server error` });
    }
};

export const userLogout = async (req: Request, res: Response) => {
    try {
        // check if we get refresh token in cookie
        const refreshToken = req.cookies.jwt;
        if (!refreshToken) return res.sendStatus(204);

        // Check if any user contains that refresh token
        const user = await User.findOne({ refreshToken });

        // If no user is found and we have a cookie then clear the cookie
        if (!user) {
            res.clearCookie("jwt", { httpOnly: true });
            return res.sendStatus(204);
        }

        // Delete accessToken and refreshToken from db
        user.status = "inactive";
        user.accessToken = undefined;
        user.refreshToken = undefined;
        await user.save();

        res.clearCookie("jwt", { httpOnly: true });
        res.status(200).json({ result: 1, message: "" });
    } catch (err: any) {
        Logger.error(err);
        res.sendStatus(400);
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        // The auth middleware sets req.user with the user's document so i can use user document with Querying the database.

        // Get the current password from user
        const { currentPass, newPass, confirmPass } = req.body;

        // Check if any of these fields are falsy values
        if (!currentPass || !newPass || !confirmPass) {
            return res
                .status(400)
                .json({ error: `Please fill all the required fields` });
        }

        // Check if the newPass field matches the confirm pass field
        if (newPass !== confirmPass) {
            return res.status(400).json({
                error: `New password doesn't match confirmation password`,
            });
        }

        // Check if the password that user sent matches with the users current password
        if (await bcrypt.compare(currentPass, req.user.password)) {
            req.user.password = newPass;
            await req.user.save();
            return res
                .status(200)
                .json({ result: 1, message: resMsgs.success.s4 });
        } else {
            return res.status(400).json({ error: `Wrong password` });
        }
    } catch (err: any) {
        Logger.error(err);
        res.status(500).json({ error: `Something went wrong` });
    }
};

// Generates a link and sends a mail
export const forgotPassword = async (req: Request, res: Response) => {
    // 1. Query database to check if user exists
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({
            error: "User with this email does not exists.",
        });
    }

    // 2. If found, Generate Password reset token and set it's expiry time so that it expires if the user don't reset in 10 mins. Add that to user document/object
    const token = jwt.sign(
        { _id: user._id },
        process.env.RESET_PASSWORD_JWT_KEY,
        { expiresIn: "5m" }
    );

    user.updateOne({ resetLink: token }, (err: any, success: any) => {
        if (err) {
            return res
                .status(400)
                .json({ error: "Reset Password Link Error!" });
        } else {
            // Send mail if no error
            const request = mailjet.post("send", { version: "v3.1" }).request({
                Messages: [
                    {
                        From: {
                            Email: "khushalsoni089@gmail.com",
                            Name: "Khushal Soni",
                        },
                        To: [
                            {
                                Email: `${email}`,
                                Name: `${user.username}`,
                            },
                        ],
                        Subject: "Password Reset Link",
                        TextPart: "",
                        HTMLPart: `<h2>Click on the link below to reset your password.</h2>
                            <a href='http://localhost:3000/users/reset-password/${token}'><button>Click here</button></a>`,
                    },
                ],
            });
            request
                .then((result) => {
                    return res.status(200).json({
                        message:
                            "Email sent, please check your inbox and follow the instructions",
                    });
                })
                .catch((err) => {
                    return res.status(400).json({
                        error: "Something went wrong while sending the email",
                    });
                });
        }
    });
};

// This contains the actual reset logic
export const resetPassword = async (req: Request, res: Response) => {
    const resetToken = req.params.token;
    const { newPass } = req.body;

    if (!resetToken) {
        return res.status(401).json({ error: `Authentication Error` });
    }

    if (!newPass) {
        return res
            .status(401)
            .json({ error: `Password field cannot be empty` });
    }

    try {
        // Decode the token and verify the token
        const decodedToken = await jwt.verify(
            resetToken,
            process.env.RESET_PASSWORD_JWT_KEY
        );
        if (!decodedToken) {
            return res.status(401).json({ error: "Invalid Token." });
        }

        // Find the user based on the resetToken that we get from link
        const user = await User.findOne({ resetLink: resetToken });
        if (!user) {
            return res.status(404).json({ error: "User does not exist." });
        }

        // If user is found then update the user document and save it
        user.password = newPass;
        user.resetLink = undefined;
        const isSaved = await user.save();
        if (!isSaved) {
            return res.status(500).json({
                error: `Error while changing the password, please try again.`,
            });
        }

        // Send response if new password is saved successfully.
        res.status(200).json({ message: resMsgs.success.s4 });
    } catch (err: any) {
        if (err.message.includes("jwt expired")) {
            return res
                .status(400)
                .json({ result: 0, message: "Link expired." });
        }
        res.status(500).json({
            result: 0,
            message: `Something went wrong`,
            error: err.message,
        });
    }
};
