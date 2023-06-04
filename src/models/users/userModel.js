// Install Mongoose
const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randomize = require("randomatic");

const candidateSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      required: ["please provide your full name"],
    },

    jobTitle: {
      type: String,
      required: true,
      trim: true,
      required: ["please provide a job title"],
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
      required: true,
      unique: true,
    },

    email: {
      type: String,
      unique: true,
      required: ["please provide a email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },
    website: {
      type: String,
      unique: true,
      required: true,
    },

    currentSalary: {
      type: Number,
      required: ["please provide your curent Salary"],
    },

    expectedSalary: {
      type: Number,
      required: ["please provide your expected salary"],
    },

    experience: {
      type: String,
    },
    role: {
      type: String,
      enum: ["employer"],
      default: "employer",
      trim: true,
      required: true,
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

    AllowInSearch: {
      type: String,
      enum: ["yes", "no"],
      default: "yes",
      lowercase: true,
      required: true,
    },

    description: {
      type: true,
      required: ["please provide your description"],
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

candidateSchema.set("toJSON", {
  versionKey: false,

  transform(doc, ret) {
    delete ret.__v;
  },
});

// Encrypt password using bcrypt
candidateSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Encrypt password using bcrypt while updating (admin)
candidateSchema.pre("findOneAndUpdate", async function (next) {
  if (this._update.password) {
    this._update.password = await bcrypt.hash(this._update.password, 10);
  }
  next();
});

// Sign JWT and return
candidateSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
candidateSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
candidateSchema.methods.getResetPasswordToken = function () {
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
candidateSchema.methods.generateEmailConfirmToken = function (next) {
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

module.exports = mongoose.model("Candidate", candidateSchema);
// const User = mongoose.model("User", userSchema);

// exports.User = User;
