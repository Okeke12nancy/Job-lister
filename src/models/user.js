// Install Mongoose
const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randomize = require("randomatic");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      // required: ["please provide your full name"],
    },

    jobTitle: {
      type: String,
      trim: true,
    },

    profileImage: {
      type: "String",
      default: "",
    },

    resume: {
      type: String,
      default: "",
    },

    phone: {
      type: Number,
      min: 1,
    },

    email: {
      type: String,
      // unique: true,
      // required: ["please provide a email"],
      // match: [
      //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      //   "Please add a valid email",
      // ],
    },

    password: {
      type: String,
      // required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },
    website: {
      type: String,
    },

    currentSalary: {
      type: Number,
    },

    expectedSalary: {
      type: Number,
    },

    experience: {
      type: String,
    },
    role: {
      type: String,
      enum: ["employer", "candidate"],
      default: "candidate",
      lowercase: true,
      trim: true,
      // required: true,
    },
    educationalLevel: {
      type: String,
    },
    language: {
      type: String,
    },
    categories: {
      type: String,
    },

    allowInSearch: {
      type: String,
      enum: ["yes", "no"],
      default: "yes",
      lowercase: true,
      required: true,
    },

    description: {
      type: String,
      // required: ["please provide your description"],
    },

    aboutCompany: {
      type: String,
    },

    passwordChangedAt: {
      type: Date,
      select: false,
    },

    deleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    deletedAt: {
      type: Date,
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
    confirmEmailToken: String,
    isEmailConfirmed: {
      type: Boolean,
      default: false,
    },
    twoFactorCode: String,
    twoFactorCodeExpire: Date,
    twoFactorEnable: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  versionKey: false,

  transform(doc, ret) {
    delete ret.__v;
  },
});

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Encrypt password using bcrypt while updating (admin)
userSchema.pre("findOneAndUpdate", async function (next) {
  if (this._update.password) {
    this._update.password = await bcrypt.hash(this._update.password, 10);
  }
  next();
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Generate email confirm token
userSchema.methods.generateEmailConfirmToken = function (next) {
  // email confirmation token
  const confirmationToken = crypto.randomBytes(20).toString("hex");

  this.confirmEmailToken = crypto
    .createHash("sha256")
    .update(confirmationToken)
    .digest("hex");

  const confirmTokenExtend = crypto.randomBytes(100).toString("hex");
  const confirmTokenCombined = `${confirmationToken}.${confirmTokenExtend}`;
  return confirmTokenCombined;
};

module.exports = mongoose.model("User", userSchema);
// const User = mongoose.model("User", userSchema);

// exports.User = User;
