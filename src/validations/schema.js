const Joi = require("joi");

// Validation schema for user registration
exports.registerSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string(),
  description: Joi.string(),
});

// Validation schema for user login
exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Validation schema for updating user details
exports.updateDetailsSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string(),
  description: Joi.string(),
});

// Validation schema for updating user password
exports.updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
});

// Validation schema for forgot password
exports.forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

// Validation schema for resetting password
exports.resetPasswordSchema = Joi.object({
  password: Joi.string().required(),
});

// Validation schema for confirming email
exports.confirmEmailSchema = Joi.object({
  token: Joi.string(),
});
