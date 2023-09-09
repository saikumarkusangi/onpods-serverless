import UserSchema from '../../../models/userModel.js'
import IdValidate from '../../../utils/validation/idValidation.js';

/**
 * @description : List all users present in the database
 * @access: private
 * @param {object} req: request for all users
 * @param {object} res: response for all users
 * @return {object} : response for all users {status, message, data}
 */
export const getAllUser = (async (req, res) => {
    try {
        const { limit } = req.query;
        const [count, result] = await Promise.all([
            UserSchema.countDocuments(),
            UserSchema.find().select(['-refreshToken'])
            .limit(limit ? parseInt(limit) : 10)
        ]);
        res.json({
            count,
            data: result
        });
    } catch (error) {
        res.status(404).json(
            {
                status: 'fail',
                message: `${error}`
            }
        )
    }
});

/**
 * @description : Get a single user by id
 * @access: private
 * @param {object} req: request for a single user id
 * @param {object} res: response for a single user
 * @return {object} : response for a single user {status, message, data}
 */
export const getUser = async (req, res) => {
    const { id } = req.params;
    IdValidate(id);
    const result = await UserSchema.findById(id).select(['-refreshToken']);
    if (!result) {
        res.status(404).json({
            message: 'Records not found'
        });
    }
    res.status(200).json({
        data: result
    });
};

/**
 * @description : Delete user from the database
 * @access: private
 * @param {object} req: request for user deletion
 * @param {object} res: response for user deletion
 * @return {object} : response for user deletion {status, message, data}
 */
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    IdValidate(id);
    const result = await UserSchema.findByIdAndDelete(id);
    if (!result) {
        res.status(404).json({
            status: 'fail',
            message: 'Records not found'
        });
    }
    res.status(200).json({
        status: 'success',
        message: 'User deleted successfully'
    });
};

/**
 * @description : Update user
 * @access: public
 * @param {object} req: request for updating user
 * @param {object} res: response for update
 * @return {object} : response for update {status, message, data}
 */
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    IdValidate(id);
    try {
        const result = await UserSchema.findByIdAndUpdate(
            id,
            data,
            { new: true }
        );
        res.status(200).json({
            status: 'success',
            message: 'user updated successfully',
            data: result
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: `${error}`
        });
    }
};
