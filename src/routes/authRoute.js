const express = require("express");
// const passport = require("../configs/passport");
const passport = require("passport");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const authController = require("../controllers/auth");
const validate = require("../middlewares/validate.middlewares");
const {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
  updateDetailsSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  confirmEmailSchema,
} = require("../validations/schema");
// Register User
router.post("/register", [validate(registerSchema)], authController.register);

// User Login
router.post("/login", [validate(loginSchema)], authController.login);

// User Logout
router.get("/logout", authController.logout);

// Get Current User
router.get("/me", protect, authController.getMe);

// Update User Details
router.put(
  "/updatedetails",
  protect,
  [validate(updateDetailsSchema)],
  authController.updateDetails
);

// Update Password
router.put(
  "/updatepassword",
  protect,
  [validate(updatePasswordSchema)],
  authController.updatePassword
);

// Forgot Password
router.post(
  "/forgotpassword",
  [validate(forgotPasswordSchema)],
  authController.forgotPassword
);

// Reset Password
router.put(
  "/resetpassword/:resettoken",
  [validate(resetPasswordSchema)],
  authController.resetPassword
);

// Confirm Email
router.get(
  "/confirmemail",
  [validate(confirmEmailSchema)],
  authController.confirmEmail
);

// // Google Login
// router.post("/google-login", authController.googleLogin);

// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   (req, res) => {
//     res.redirect("/"); // Redirect to the desired route after successful authentication
//   }
// );

module.exports = router;
