// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/api/v1/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Check if the user already exists
//         let user = await User.findOne({ email: profile.emails[0].value });

//         if (!user) {
//           // Create a new user if it doesn't exist
//           user = await User.create({
//             fullName: profile.displayName,
//             email: profile.emails[0].value,
//             role: "user",
//           });
//         }

//         // Generate token and send response
//         const sendTokenResponse = (user, statusCode, res) => {
//           const token = user.getSignerJwtToken();
//           const redirectUrl = `${process.env.FRONTEND_URL}/login?token=${token}`;

//           res.redirect(redirectUrl);
//         };
//       } catch (error) {
//         done(error, false);
//       }
//     }
//   )
// );
