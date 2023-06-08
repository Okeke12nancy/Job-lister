// install crypto and google-auth-library
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/user");
const sendTokenResponse = require("../utils/sendTokenResponse");

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
// controllers/authController.js
const AuthService = require("../services/authServices");

class AuthController {
  register = asyncHandler(async (req, res, next) => {
    const { fullName, email, password, role, description } = req.body;
    console.log("name");
    const user = await AuthService.registerUser(
      req, // here
      fullName,
      email,
      password,
      role,
      description
    );
    sendTokenResponse(user, 200, res);
  });

  login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await AuthService.loginUser(email, password);
    sendTokenResponse(user, 200, res);
  });

  //   // @desc      Log user out / clear cookie
  //   // @route     GET /api/v1/auth/logout
  //   // @access    Public

  logout = asyncHandler(async (req, res, next) => {
    AuthService.logoutUser(res);
  });

  //   // @desc      Get current logged in user
  //   // @route     GET /api/v1/auth/me
  //   // @access    Private

  getMe = asyncHandler(async (req, res, next) => {
    const user = await AuthService.getUserById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  });

  // controllers/userController.js

  //   // @desc      Update user details
  //   // @route     PUT /api/v1/auth/updatedetails
  //   // @access    Private

  updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };

    const user = await AuthService.updateUserDetails(
      req.user.id,
      fieldsToUpdate
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  // controllers/userController.js

  //   // @desc      Update password
  //   // @route     PUT /api/v1/auth/updatepassword
  //   // @access    Private
  updatePassword = asyncHandler(async (req, res, next) => {
    const user = await AuthService.getUserById(req.user.id);

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse("Password is incorrect", 401));
    }

    user.password = req.body.newPassword;
    await AuthService.saveUser(user);

    sendTokenResponse(user, 200, res);
  });

  //   // @desc      Forgot password
  //   // @route     POST /api/v1/auth/forgotpassword
  //   // @access    Public
  forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await AuthService.getUserByEmail(req.body.email);

    if (!user) {
      return next(new ErrorResponse("There is no user with that email", 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await AuthService.saveUser(user, { validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password reset token",
        message,
      });

      res.status(200).json({ success: true, data: "Email sent" });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await UserService.saveUser(user, { validateBeforeSave: false });

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  });
  // controllers/authController.js

  //   // @desc      Reset password
  //   // @route     PUT /api/v1/auth/resetpassword/:resettoken
  //   // @access    Public

  resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await AuthService.getUserByResetToken(resetPasswordToken);

    if (!user) {
      return next(new ErrorResponse("Invalid token", 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await AuthService.saveUser(user);

    sendTokenResponse(user, 200, res);
  });

  // controllers/authController.js

  //   /**
  //    * @desc    Confirm Email
  //    * @route   GET /api/v1/auth/confirmemail
  //    * @access  Public
  //    */
  confirmEmail = asyncHandler(async (req, res, next) => {
    // Grab token from email
    const { token } = req.query;

    if (!token) {
      return next(new ErrorResponse("Invalid Token", 400));
    }

    const splitToken = token.split(".")[0];
    const confirmEmailToken = crypto
      .createHash("sha256")
      .update(splitToken)
      .digest("hex");

    // get user by token
    const user = await User.findOne({
      confirmEmailToken,
      isEmailConfirmed: false,
    });

    if (!user) {
      return next(new ErrorResponse("Invalid Token", 400));
    }

    // update confirmed to true
    user.confirmEmailToken = undefined;
    user.isEmailConfirmed = true;

    // save
    user.save({ validateBeforeSave: false });

    // return token
    sendTokenResponse(user, 200, res);
  });
  // controllers/authController.js

  //   // @desc      Google login
  //   // @route     POST /api/v1/auth/google-login
  //   // @access    Public
  googleLogin = asyncHandler(async (req, res, next) => {
    const { idToken } = req.body;

    // Verify Google ID token
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email } = ticket.getPayload();

    // Check if the user already exists
    let user = await UserService.getUserByEmail(email);

    if (!user) {
      // Create a new user if it doesn't exist
      user = await UserService.createUser({
        fullName: name,
        email,
        role: "user",
      });
    }

    // Generate token and send response
    sendTokenResponse(user, 200, res);
  });
}

module.exports = new AuthController();
