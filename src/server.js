const express = require("express");
const morgan = require("morgan");
const passport = require("passport");
const helmet = require("helmet");
const dotenv = require("dotenv");
const cors = require("cors");
const errorHandler = require("./middlewares/errorMiddlewares");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/authRoute");
const connectDB = require("./configs/databaseConfig");

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

app.use(passport.initialize());
const PORT = process.env.PORT || 3001;

app.use(errorHandler);

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
