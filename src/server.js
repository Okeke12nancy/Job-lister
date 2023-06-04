const http = require("http");
const dotenv = require("dotenv");
require("colors");
const { app } = require("./app");
const logger = require("./configs/logger.config");
const connectDB = require("./configs/databaseConfig");

// http server instance
const server = http.createServer(app);

dotenv.config();

// // connecting to database
// connectDB(process.env.MONGODB_URI);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.info(`Backend is blazing 🔥🔥🔥 @ port ${PORT}`.bold.yellow);
  //   console.log(`Backend is blazing 🔥🔥🔥 @ port ${PORT}`);
});
