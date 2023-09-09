
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import userModel from '../models/userModel.js';

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1];
        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_CLIENT_SECRET);
                const user = await userModel.findById(decoded?.id);
                req.user = user;
                next();
            }
        } catch (error) {
            throw new Error('UnAuthorized');
        }
    } else {
        throw new Error('Access Token missing');
    }
});


const isAdmin = asyncHandler(async (req, res, next) => {
    const { userType } = req.user;
    if (userType !== 'Admin') {
        throw new Error("forbidden");
    }
    next();
});

export { authMiddleware, isAdmin};
