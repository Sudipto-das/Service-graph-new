const AppError = require("../utils/AppError");

const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error.errors) {
        const message = error.errors.map((e) => e.message).join(". ");
        return next(new AppError(message, 400));
      }
      return next(new AppError(error.message, 400));
    }
  };
};

module.exports = validate;
