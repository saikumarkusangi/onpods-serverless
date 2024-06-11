import e from "express";
import userModel from "../../../models/userModel.js";
import UserSchema from "../../../models/userModel.js";
import {
  sendCreateAccountOTP,
  sendForgotPasswordOTP,
} from "../../../services/nodeMailer.js";
import bcrypt from "bcrypt";
import { quoteModel } from "../../../models/quoteModel.js";
import { podcastmodel } from "../../../models/podcastModel.js";
import { deleteEpisodeFromS3, deleteImageFromS3 } from "../../../services/s3Service.js";

/**
 * @description : User registration
 * @access: public
 * @param {object} req: request for registration
 * @param {object} res: response for registration
 * @return {object} : response for registration {status, message, data}
 */
export const register = async (req, res) => {
  try {
    const data = new UserSchema({
      ...req.body,
    });



    let findUser = await UserSchema.findOne({
      email: data.email,
    });

    if (!findUser) {
      const result = await UserSchema.create(data);
      return res.status(200).json({
        status: "success",
        message: "Account created successfully",
        userId: result.id,
        // token: generateToken(result.id)
      });
    } else {
      return res.status(404).json({
        status: "fail",
        message: "User Already Exists",
      });
    }
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: `${error}`,
    });
  }
};

/**
 * @description : User Login
 * @access: public
 * @param {object} req: request for Login
 * @param {object} res: response for Login
 * @return {object} : response for Login {status, message, data}
 */

export const login = async (req, res) => {
  const { email, password, oauth } = req.body;

  try {
    if (oauth) {
      const user = await UserSchema.findOne({ oauth });
      if (user) {
        return res.status(200).json({
          data: {
            username: user.username,
            email: user.email,
            userType: user.userType,
            id: user.id,
          },
        });
      } else {
        return res.status(404).json({
          message: 'user not found'
        })
      }
    } else {
      const user = await UserSchema.findOne({ email });

      if (!user || user.oauth !== '') {
        return res.status(404).json({
          status: "fail",
          message: "User not found",
        });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (isPasswordMatch) {
        return res.status(200).json({
          data: {
            username: user.username,
            email: user.email,
            userType: user.userType,
            id: user.id,
          },
        });
      } else {
        return res.status(401).json({
          status: "fail",
          message: "Incorrect Password",
        });
      }
    }

  } catch (err) {

    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

/**
 * @description : User Logout
 * @access: public
 * @param {object} req: request for logout
 * @param {object} res: response for logout
 * @return {object} : response for logout {status, message}
 */
export const logout = async (req, res) => {
  const { id } = req.body;
  const user = await UserSchema.findById(id);

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "Something went wrong",
    });
  }

  await UserSchema.findByIdAndUpdate(
    { _id: id },
    {
      isActive: false,
    }
  );

  return res.status(200).json({
    status: "success",
    message: "Logout successful",
  });
};

export const sendCreateAccountOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const response = sendCreateAccountOTP(email);

    return res.status(200).json({
      status: "success",
      message: "OTP Sent Successfully",
      otp: response,
    });
  } catch (error) {
    return res.status(404).json({
      message: `${error}`,
    });
  }
};

export const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserSchema.findOne({ email: email });
    if (!user) {
      return res.status(200).json({
        status: "fail",
        message: "User not found",
      });
    }
    const response = sendForgotPasswordOTP(email);

    return res.status(200).json({
      status: "success",
      message: "OTP Sent Successfully",
      otp: response,
    });
  } catch (error) {
    return res.status(404).json({
      message: `${error}`,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
   
    const { password, email } = req.body;
    
  const hashPass = await bcrypt.hash(password, 8);
    const user = await UserSchema.findOneAndUpdate(
      { email: email },
      {
        password: hashPass,
      }
    );
    if (!user) {
      return res.status(200).json({
        status: "fail",
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password Updated Successfully",
        });
  } catch (error) {
    return res.status(404).json({
      message: `${error}`,
    });
  }
};

export const deleteAccount = async (req, res) => {
  const userId = req.headers.authorization;

  try {
    const user = await userModel.findById(userId);

    if (user) {

      // Delete quotes associated with the user
      const quotes = await quoteModel.find({ userId: user._id });

      const imageKeys = quotes.map(quote => {
        const parts = quote.imageUrl.split('/');
        return parts[parts.length - 1];
      });

      // Delete images from S3 in parallel
      await Promise.all(imageKeys.map(objectKey => deleteImageFromS3(objectKey)));

      // Delete quotes from MongoDB
      await quoteModel.deleteMany({ userId: user._id });
      // Delete podcasts associated with the user
      const podcasts = await podcastmodel
        .find({ userId: user._id })
        .populate('episodes');


      // Delete every episode associated with the podcasts
      await Promise.all(
        podcasts.map(async (podcast) => {
          await Promise.all(
            podcast.episodes.map(async (episode) => {
              await Promise.all([
                deleteEpisodeFromS3(episode.audioUrl),
                deleteEpisodeFromS3(episode.posterUrl),
              ]);
            })
          );
        })
      );

      await podcastmodel.deleteMany({ userId: user._id });

      await userModel.findByIdAndDelete(userId);

      return res.status(200).json({
        status: 'success',
        message: 'Account deleted successfully',
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: `${err}`,
    });
  }
};


export default {
  deleteAccount,
  register,
  login,
  logout,
  sendCreateAccountOtp,
  resetPassword,
};
