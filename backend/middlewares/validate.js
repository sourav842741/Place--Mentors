import Joi from "joi";
import { ApiError } from "../utils/ApiError.js";

/**
 * Reusable validation middleware.
 * @param {Joi.ObjectSchema} schema - Joi schema to validate against
 * @param {string} source - 'body' | 'query' | 'params'
 */
const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join("; ");
      throw new ApiError(400, messages);
    }

    // Replace with sanitized/converted values
    req[source] = value;
    next();
  };
};

export default validate;
