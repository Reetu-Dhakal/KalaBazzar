import ApiError from '../utils/ApiError.js';

export const validate = (validations) => {
  return async (req, res, next) => {
    try {
      for (const validation of validations) {
        const result = await validation.run(req);
        if (result.errors.length) {
          const errors = result.errors.map((e) => ({
            field: e.path,
            message: e.msg,
          }));
          return next(ApiError.badRequest('Validation failed', errors));
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
