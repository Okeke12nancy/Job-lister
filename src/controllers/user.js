// const ErrorResponse = require("../utils/errorResponse");
// const asyncHandler = require("../middlewares/async");

// // @desc      Get all users
// // @route     GET /api/v1/users
// // @access    Private/Admin

// // controllers/userController.js
// const UserService = require("../services/userService");

// class UserController {
//   getUsers = asyncHandler(async (req, res, next) => {
//     res.status(200).json(await UserService.getUsers());
//   });

//   // @desc      Get single user
//   // @route     GET /api/v1/users/:id
//   // @access    Private/Admin
//   // controllers/userController.js

//   getUser = asyncHandler(async (req, res, next) => {
//     const user = await UserService.getUserById(req.params.id);

//     if (!user) {
//       return next(
//         new ErrorResponse(`No user with id of ${req.params.id}`, 404)
//       );
//     }

//     res.status(200).json({
//       success: true,
//       data: user,
//     });
//   });

//   // @desc      Create user
//   // @route     POST /api/v1/users
//   // @access    Private/Admin
//   // controllers/userController.js

//   createUser = asyncHandler(async (req, res, next) => {
//     const user = await UserService.createUser(req.body);

//     res.status(201).json({
//       success: true,
//       data: user,
//     });
//   });

//   // @desc      Update user
//   // @route     PUT /api/v1/users/:id
//   // @access    Private/Admin
//   // controllers/userController.js

//   updateUser = asyncHandler(async (req, res, next) => {
//     const user = await UserService.updateUser(req.params.id, req.body);

//     res.status(200).json({
//       success: true,
//       data: user,
//     });
//   });

//   // @desc      Delete user
//   // @route     DELETE /api/v1/users/:id
//   // @access    Private/Admin
//   // controllers/userController.js

//   deleteUser = asyncHandler(async (req, res, next) => {
//     await UserService.deleteUser(req.params.id);

//     res.status(200).json({
//       success: true,
//       data: {},
//     });
//   });
// }

// module.exports = UserController;
