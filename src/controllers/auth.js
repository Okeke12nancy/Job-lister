// install crypto and google-auth-library
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const sendEmail = require("../utils/sendEmail");
//const { sendEmail } = require('../services/emailService');

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
// controllers/authController.js
// const AuthService = require("../services/authServices");

class AuthController {
  register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role, description } = req.body;
    const user = await AuthService.registerUser(name, email, password, role);
    this.sendTokenResponse(user, 200, res);
  });

  // controllers/authController.js

  //   // @desc      Login user
  //   // @route     POST /api/v1/auth/login
  //   // @access    Public
  login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await AuthService.loginUser(email, password);
    this.sendTokenResponse(user, 200, res);
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
    const user = await UserService.getUserById(req.user.id);
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

    const user = await UserService.updateUserDetails(
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
    const user = await UserService.getUserById(req.user.id);

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse("Password is incorrect", 401));
    }

    user.password = req.body.newPassword;
    await UserService.saveUser(user);

    sendTokenResponse(user, 200, res);
  });

  //   // @desc      Forgot password
  //   // @route     POST /api/v1/auth/forgotpassword
  //   // @access    Public
  forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await UserService.getUserByEmail(req.body.email);

    if (!user) {
      return next(new ErrorResponse("There is no user with that email", 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await UserService.saveUser(user, { validateBeforeSave: false });

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

    const user = await UserService.getUserByResetToken(resetPasswordToken);

    if (!user) {
      return next(new ErrorResponse("Invalid token", 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await UserService.saveUser(user);

    this.sendTokenResponse(user, 200, res);
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

    // Get user by token
    const user = await UserService.getUserByConfirmToken(confirmEmailToken);

    if (!user) {
      return next(new ErrorResponse("Invalid Token", 400));
    }

    // Update confirmed to true
    user.confirmEmailToken = undefined;
    user.isEmailConfirmed = true;

    // Save
    await UserService.saveUser(user);

    // Return token
    this.sendTokenResponse(user, 200, res);
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
    this.sendTokenResponse(user, 200, res);
  });
}

module.exports = new AuthController();

// const sendTokenResponse = (user, statusCode, res) => {
//   // Create Token
//   const token = user.getSignerJwtToken();

//   const options = {
//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true,
//   };

//   if (process.env.NODE_ENV === "production") {
//     options.secure = true;
//   }

//   res
//     .status(statusCode)
//     .cookie("token", token, options)
//     .json({ success: true, token });
// };

// module.exports = AuthController;
