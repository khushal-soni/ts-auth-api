import Joi, { ObjectSchema } from "joi";
import { NextFunction, Request, Response } from "express";
import Logger from "../utils/logger";
import { IUserModel } from "../interface/custom";

export const validateSchema = (schema: ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.body);
            next();
        } catch (error) {
            Logger.error(error);
            return res.status(422).json({ error });
        }
    };
};

export const Schemas = {
    user: {
        create: Joi.object<IUserModel>({
            username: Joi.string().required(),
            email: Joi.string().required(),
            password: Joi.string().required(),
            accessToken: Joi.string(),
            refreshToken: Joi.string(),
            status: Joi.string(),
            resetLink: Joi.string(),
        }),

        // For Future use, More validation schemas can be added here.
        login: Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required(),
        }),
    },
};
