import { quoteModel } from "../../../models/quoteModel.js";
import userModel from "../../../models/userModel.js";


// get quotes uploaded by user

const userQuotes = async (req, res) => {
    try {
        const { id } = req.query;
        const { limit, page } = req.query;
        const pageSize = limit ? parseInt(limit) : 10;
        const pageNumber = page ? parseInt(page) : 1;
        const skip = (pageNumber - 1) * pageSize;
        const count = await quoteModel.countDocuments({ userId: id });
        const data = await quoteModel
            .find({ userId: id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit ? parseInt(limit) : 10);

        return res.status(200).json({
            count,
            data,
            page: pageNumber,
            totalPages: Math.ceil(count / pageSize)
        })
    } catch (error) {
        return res.status(404).json({
            status: 'fail',
            message: `${error}`
        });
    }
};

const userInfo = async (req, res) => {
    try {
        const { id } = req.query;

        const user = await userModel.findById(id)
            .select('email username followers following private profilePic');

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found',
            });
        }

        // Count the number of followers and following
        const followersCount = user.followers.length;
        const followingCount = user.following.length;

        // Include the counts in the response
        const responseData = {
            email: user.email,
            username: user.username,
            followers: followersCount,
            following: followingCount,
            private: user.private,
            profilePic: user.profilePic,
        };

        return res.status(200).json(responseData);
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
}


export {
    userQuotes,
    userInfo
}