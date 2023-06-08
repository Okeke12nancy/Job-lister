const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      console.log(profile);
      try {
        // Check if the user already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          // Create a new user if it doesn't exist
          user = await User.create({
            fullName: profile.displayName,
            email: profile.emails[0].value,
            role: "user",
          });
        }
        return done(null, profile);
      } catch (error) {
        done(error, false);
      }
    }
  )
);
