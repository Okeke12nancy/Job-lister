const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randomize = require("randomatic");

const employerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add your email"],
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
      required: true,
      required: [true, "Please add your website url"],
    },
    teamSize: {
      type: String,
    },

    phoneNumber: {
      type: Number,
    },
    AboutCompany: {
      type: String,
      required: [true, "Please add a description of your company"],
    },
    profileImage: {
      type: "String",
      default: "",
    },
    role: {
      type: String,
      enum: ["employer"],
      default: "employer",
      trim: true,
      required: true,
      lowercase: true,
    },
    allowInSearch: {
      type: Boolean,
      enum: ["yes", "no"],
      default: "yes",
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

employerSchema.set("toJSON", {
  versionKey: false,

  transform(doc, ret) {
    delete ret.__v;
  },
});

// Encrypt password using bcrypt
employerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Encrypt password using bcrypt while updating (admin)
employerSchema.pre("findOneAndUpdate", async function (next) {
  if (this._update.password) {
    this._update.password = await bcrypt.hash(this._update.password, 10);
  }
  next();
});

// Sign JWT and return
employerSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
employerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
employerSchema.methods.getResetPasswordToken = function () {
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
employerSchema.methods.generateEmailConfirmToken = function (next) {
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

module.exports = mongoose.model("Employer", employerSchema);
