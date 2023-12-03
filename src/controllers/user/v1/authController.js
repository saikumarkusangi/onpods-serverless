import UserSchema from "../../../models/userModel.js";
import {
  sendCreateAccountOTP,
  sendForgotPasswordOTP,
} from "../../../services/nodeMailer.js";
import bcrypt from "bcrypt";

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
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Email and password are required",
    });
  }

  try {
    const user = await UserSchema.findOne({ email });

    if (!user) {
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
    const { email, password } = req.body;
    hashPass = await bcrypt.hash(password, 8);
    const user = await UserSchema.findOneAndUpdate(
      { email: email },
      {
        password: hashPass,
      },
      { new: true }
    );
    if (!user) {
      return res.status(200).json({
        status: "fail",
        message: "User not found",
      });
    }
 
    return res.status(200).json({
      status: "success",
      message: "Password Updated Successfully",
      otp: response,
    });
  } catch (error) {
    return res.status(404).json({
      message: `${error}`,
    });
  }
};

export default {
  register,
  login,
  logout,
  sendCreateAccountOtp,
  resetPassword,
};
