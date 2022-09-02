import dotenv from "dotenv";
dotenv.config();

export const vars = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    mongoURI: process.env.MONGODB_URI,
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    resetPasswordKey: process.env.RESET_PASSWORD_JWT_KEY,
    mailjetPublicKey: process.env.MJ_APIKEY_PUBLIC,
    mailjetPrivateKey: process.env.MJ_APIKEY_PRIVATE,
};
