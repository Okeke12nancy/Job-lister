const jwt = require("jsonwebtoken");

const sendTokenResponse = (user, statusCode, res) => {
  // Generate token
  const token = generateToken(user.id);

  // Set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Set secure cookie option in production
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  // Send the token as a cookie
  res.cookie("token", token, cookieOptions);

  // Remove password field from user object
  const { password, ...userWithoutPassword } = user;

  // Send the response with the token and user data
  res.status(statusCode).json({
    success: true,
    token,
    user: userWithoutPassword,
  });
};

// Generate token function (example implementation)
const generateToken = (userId) => {
  // Create the payload
  const payload = {
    user: {
      id: userId,
    },
  };

  // Sign the token with your secret key
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  return token;
};

module.exports = sendTokenResponse;
