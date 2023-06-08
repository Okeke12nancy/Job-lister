const ErrorResponse = require("../utils/errorResponse");

const sendEmail = require("../utils/sendEmail");
const User = require("../models/user");
const { generateAccessToken, verifyRefreshToken } = require("../utils/token");

// services/authService.js

class AuthService {
  static async registerUser(req, name, email, password, role) {
    //
    const user = await User.create({ name, email, password, role });
    const confirmEmailToken = user.generateEmailConfirmToken();
    const confirmEmailURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/confirmemail?token=${confirmEmailToken}`;
    const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${confirmEmailURL}`;
    user.save({ validateBeforeSave: false });
    const sendResult = await sendEmail({
      email: user.email,
      subject: "Email confirmation token",
      message,
    });
    return user;
  }

  // services/authService.js

  static async loginUser(email, password) {
    if (!email || !password) {
      throw new ErrorResponse("Please provide an email and password", 400);
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new ErrorResponse("Invalid credentials", 401);
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      throw new ErrorResponse("Invalid credentials", 401);
    }

    return user;
  }

  // services/authService.js

  static logoutUser(res) {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  }

  // services/authService.js

  static async getUserById(userId) {
    const user = await User.findById(userId);
    return user;
  }

  // services/authService.js

  static async updateUserDetails(userId, fieldsToUpdate) {
    const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });
    return user;
  }

  // services/authService.js

  static async getUserById(userId) {
    return await User.findById(userId).select("+password");
  }

  static async saveUser(user) {
    await user.save();
  }

  // services/authService.js

  static async getUserByEmail(email) {
    return await User.findOne({ email });
  }

  static async saveUser(user, options = {}) {
    await user.save(options);
  }

  // services/authService.js

  static async getUserByResetToken(resetPasswordToken) {
    return await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  }

  static async saveUser(user) {
    await user.save();
  }

  // services/authService.js

  static async getUserByConfirmToken(confirmEmailToken) {
    return await User.findOne({
      confirmEmailToken,
      isEmailConfirmed: false,
    });
  }

  static async saveUser(user) {
    await user.save();
  }

  // services/authService.js

  static async getUserByEmail(email) {
    return await User.findOne({ email });
  }

  static async createUser(userData) {
    return await User.create(userData);
  }
}

module.exports = AuthService;
