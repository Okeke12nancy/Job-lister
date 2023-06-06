// const ErrorResponse = require("../utils/errorResponse");
// const asyncHandler = require("../middlewares/async");
// const User = require("../models/users");

// // services/userService.js
// const User = require("../models/User");

// class UserService {
//   static async getUsers() {
//     // Implement the logic to fetch users from the database
//     return await User.find();
//   }

//   // services/userService.js

//   static async getUserById(id) {
//     // Implement the logic to fetch a user by ID from the database
//     return await User.findById(id);
//   }

//   // services/userService.js

//   static async createUser(userData) {
//     // Implement the logic to create a new user in the database
//     return await User.create(userData);
//   }

//   // services/userService.js

//   static async updateUser(id, userData) {
//     // Implement the logic to update the user in the database
//     return await User.findByIdAndUpdate(id, userData, {
//       new: true,
//       runValidators: true,
//     });
//   }

//   // services/userService.js

//   static async deleteUser(id) {
//     // Implement the logic to delete the user from the database
//     return await User.findByIdAndDelete(id);
//   }
// }

// module.exports = UserService;
