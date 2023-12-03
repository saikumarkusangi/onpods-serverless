import userModel from '../models/userModel.js';

const authorization = async (req, res, next) => {
    let id;
    if (req.headers && req.headers.authorization) {
        id = req.headers.authorization;
        try {
            
            const user = await userModel.findById(id);
            if (user) {
                req.id = user.id;
                next();
            } else {
                return res.status(404).json({
                    message: 'UnAuthorized'
                });
            }
        } catch (error) {
            return res.status(404).json({
                message: `${error}`
            });
        }
    } else {
        return res.status(404).json({
            message: 'Access Token missing'
        });
    }
};


const isAdmin = async (req, res, next) => {
    let id;
    if (req.headers && req.headers.authorization) {
        id = req.headers.authorization;
        try {
            const user = await userModel.findById(id).select(['userType']);

            if (user.userType === 'Admin') {
                req.id = user.id;
                next();
            } else {
                return res.status(404).json({
                    message: 'UnAuthorized'
                });
            }
        } catch (error) {
            return res.status(404).json({
                message: `${error}`
            });
        }
    } else {
        return res.status(404).json({
            message: 'Access Token missing'
        });
    }
};


export { authorization, isAdmin };
