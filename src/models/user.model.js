import { Schema, model, models } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoosePaginate from "mongoose-paginate-v2";
import validator from "validator";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: [true, "Username already taken"],
      trim: true,
      index: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [true, "Password must be greater than 6 charcters"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: [true, "Email address already in use"],
      validate: validator.isEmail,
      trim: true,
      lowercase: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    fullName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      index: true,
    },
    avatar: {
      public_id: {
        type: String,
        required: [true, "Public id is required"],
      },
      url: {
        type: String,
        required: [true, "Avatar url is required"],
      }
    },
    hasNotifications: {
      type: Boolean,
      default: false,
    },
    country: String,
    bio: String,
    phone: String,
    refreshToken: String,
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: String,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  // Return if the password is not modified
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

UserSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

UserSchema.plugin(mongoosePaginate);

export const User = models.User || model("User", UserSchema);
