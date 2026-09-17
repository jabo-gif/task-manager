const { validationResult } = require('express-validator');

/**
 * Runs after express-validator check chains. Returns 422 with a field-level
 * error list if any validation rule failed.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  return next();
}

module.exports = { validate };
