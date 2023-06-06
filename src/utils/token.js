const jwt = require("jsonwebtoken");

// Generate an access token
const generateAccessToken = (payload) => {
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
  return accessToken;
};

// Verify a refresh token
const verifyRefreshToken = (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  return decoded;
};

module.exports = {
  generateAccessToken,
  verifyRefreshToken,
};
