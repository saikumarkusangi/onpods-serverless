import { generateToken } from '../../../config/jwtToken.js';
import UserSchema from '../../../models/userModel.js';
import generateRefreshToken from '../../../config/refreshToken.js';
import jwt from 'jsonwebtoken';

/**
 * @description : User registration 
 * @access: public
 * @param {object} req: request for registration
 * @param {object} res: response for registration
 * @return {object} : response for registration {status, message, data}
 */
export const register = async(req, res) => {
    const data = new UserSchema({
        ...req.body
    });

    let findUser = await UserSchema.findOne({
        email: data.email,
    });

    if (!findUser) {
        const result = await UserSchema.create(data);
        return res.status(200).json({
            status: 'success',
            message: "Account created successfully",
            data: result,
            token: generateToken(result.id)
        });
    } else {
        return res.status(404).json({
            status: 'fail',
            message: "User Already Exists"
        })
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
        res.status(404).json({
            status:'fail',
            message:'email and password are required'
        });
    }

    const result = await UserSchema.findOne({ email });

    if (!result) {
        return res.status(404).json({
            status: 'fail',
            message: 'User not found'
        })
    } else if (result && await result.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(result.id);
        const updateUser = await UserSchema.findByIdAndUpdate(result.id, {
            refreshToken,
            isActive: true
        }, {
            new: true
        });
        const response = {
            data: {
                username: result.username,
                email: result.email,
                userType: result.userType,
                id: result.id
            },
            token: generateToken(result.id)
        };
        res.status(200).json(response);
    } else {
        res.status(404).json({
            status: "fail",
            message: "Incorrect Password"
        })
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
            status: 'fail',
            message: "Something went wrong"
        });
    }

    await UserSchema.findByIdAndUpdate({ _id:id }, {
        refreshToken: '',
        isActive: false,
        isOnline: false
    });

    res.status(200).json({
        status: 'success',
        message: 'Logout successful'
    });
};

/**
 * @description : Handle Refresh Token
 * @access: public
 * @param {object} req: request for handling refresh token
 * @param {object} res: response with a new access token
 * @return {object} : response with a new access token
 */
export const handleRefreshToken =async (req, res) => {
    const cookie = req.cookies;

    if (!cookie?.refreshToken) {
        throw new Error('No Refresh Token in Cookies');
    }

    const refreshToken = cookie.refreshToken;
    const user = await UserSchema.findOne({ refreshToken });

    if (!user) {
        throw new Error('Refresh Token not matched.');
    }

    const decoded = await jwt.verify(refreshToken, process.env.JWT_CLIENT_SECRET);

    if (!decoded || user.id !== decoded.id) {
        throw new Error('Something went wrong');
    }

    const accessToken = generateToken(user.id);

    res.json({
        accessToken
    });
};

export default {
    register,
    login,
    logout,
    handleRefreshToken
};
