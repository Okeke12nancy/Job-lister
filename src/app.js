const express = require("express");
const morgan = require("morgan"); // this will console log every request details on the terminal
const passport = require("passport");
const helmet = require("helmet");
const dotenv = require("dotenv");
const cors = require("cors"); // allows other servers to access these APIs
const errorHandler = require("./middlewares/errorMiddlewares");
const cookieParser = require("cookie-parser");
// const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const app = express();
const hpp = require("hpp");
const authRoute = require("./routes/authRoute");
const connectDB = require("./configs/databaseConfig");

// Initialize Passport
require("./configs/passport");

// Connect Database

// initializing dotenv
dotenv.config(); // this is to help load the data you have in your .env file.

// Connect to database
connectDB();

// Sanitize data
// app.use(mongoSanitize());

// // Prevent XSS attacks
// app.use(xss());
// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
// Cookie parser
app.use(cookieParser());

app.use(rateLimit());
// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// initilizing middlewares
app.use(morgan("dev"));
app.use(helmet());
// Prevent http param pollution
app.use(hpp());

// appRoutes(app);
app.use("/api/v1/auth", authRoute);

app.use(passport.initialize());
app.use(errorHandler);
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome", status: "success" });
});

module.exports = app;
