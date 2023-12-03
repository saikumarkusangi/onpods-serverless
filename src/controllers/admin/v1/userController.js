import { quoteModel } from '../../../models/quoteModel.js';
import userModel from '../../../models/userModel.js';
import UserSchema from '../../../models/userModel.js'
import { deleteImageFromS3, deleteProfilePicFromS3 } from '../../../services/s3Service.js';
import IdValidate from '../../../utils/validation/idValidation.js';

/**
 * @description : List all users present in the database
 * @access: private
 * @param {object} req: request for all users
 * @param {object} res: response for all users
 * @return {object} : response for all users {status, message, data}
 */
export const getAllUser = async (req, res) => {
    try {

        const { limit, page } = req.query;
        const pageSize = limit ? parseInt(limit) : 10;
        const pageNumber = page ? parseInt(page) : 1;
        const skip = (pageNumber - 1) * pageSize;

        const [count, result] = await Promise.all([
            UserSchema.countDocuments(),
            UserSchema.find()
                .select('username email createdAt id isActive')
                .skip(skip)
                .limit(pageSize)
        ]);

        return res.json({
            count,
            data: result,
            page: pageNumber,
            totalPages: Math.ceil(count / pageSize)
        });

    } catch (error) {
        res.status(500).json(
            {
                status: 'error',
                message: `${error}`
            }
        );
    }
};


/**
 * @description : Get a single user by id
 * @access: private
 * @param {object} req: request for a single user id
 * @param {object} res: response for a single user
 * @return {object} : response for a single user {status, message, data}
 */
export const getUser = async (req, res) => {
    const { userId } = req.params;
    const result = await UserSchema.findById(userId).select(['-interests']);
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
    const { userId } = req.params;

    // Find the user by their ID
    const user = await userModel.findById(userId);

    if (!user) {
        return res.status(404).json({
            status: 'fail',
            message: 'User not found'
        });
    }

    // Find and delete all quotes associated with the user from the database


    // Delete all quotes' images associated with the user from S3
    try {
        const quotes = await quoteModel.find({ userId: userId });
        const imageKeys = quotes.map((quote) => {
            const parts = quote.imageUrl.split('/');
            return parts[parts.length - 1];
        });

        // Use Promise.all for parallel deletion of S3 objects
        await Promise.all(
            imageKeys.map((objectKey) => deleteImageFromS3(objectKey))
        );
    } catch (error) {
      
        return res.status(500).json({
            status: 'error',
            message: 'Error deleting user quotes from S3'
        });
    }

    try {
        await quoteModel.deleteMany({ userId: userId });
    } catch (error) {
       
        return res.status(500).json({
            status: 'error',
            message: 'Error deleting user quotes'
        });
    }

    // Delete the user from your database
    try {
        await deleteProfilePicFromS3(userId);
        await userModel.findByIdAndDelete(userId);
    } catch (error) {
        return res.status(500).json({
            status: 'fail',
            message: `${error}`
        });
    }

    return res.status(200).json({
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

    const { userId } = req.params;
    const data = req.body;

    try {
        const result = await UserSchema.findByIdAndUpdate(
            userId,
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


