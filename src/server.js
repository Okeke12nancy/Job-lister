const express = require("express");
const morgan = require("morgan");
const passport = require("passport");
const helmet = require("helmet");
const dotenv = require("dotenv");
const cors = require("cors");
const errorHandler = require("./middlewares/errorMiddlewares");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const authRoute = require("./routes/authRoute");
const connectDB = require("./configs/databaseConfig");
const cookieSession = require("cookie-session");

// Initialize Passport
require("./configs/passport");

require("colors");
const logger = require("./configs/logger.config");

// http server instance

dotenv.config();
connectDB();

const app = express();
// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Set security headers
app.use(helmet());

// Enable CORS
app.use(cors());

app.use("/api/v1/auth", authRoute);

app.set("view engine", "ejs");

// app.use(
//   session({
//     resave: false,
//     saveUninitialized: true,
//     secret: "SECRET",
//   })
// );

app.use(
  cookieSession({
    name: "tuto-session",
    keys: ["key1", "key2"],
  })
);

var userProfile;

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

require("./configs/passport");
require("dotenv").config();

app.get("/", (req, res) => {
  res.render("pages/index");
});

app.get("/success", (req, res) => {
  res.render("pages/success", {
    // name: req.user.displayName,
    pic: req.user.photos[0].value,
    email: req.user.emails[0].value,
  });
});
app.get("/error", (req, res) => res.send("error logging in"));

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/error" }),
  function (req, res) {
    // Successful authentication, redirect success.
    res.redirect("/success");
  }
);

app.get("/logout", (req, res) => {
  req.session = null;
  req.logout();
  res.redirect("/");
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
