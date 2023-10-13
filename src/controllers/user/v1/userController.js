import { quoteModel } from "../../../models/quoteModel.js";
import userModel from "../../../models/userModel.js";
import mongoose from 'mongoose';
import { deleteProfilePicFromS3 } from "../../../services/s3Service.js";




// get quotes uploaded by user

const userQuotes = async (req, res) => {
    try {

        const { id, limit, page } = req.query;
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
        const currentUserId = req.headers.authorization

        const user = await userModel.findById(id)
            .select('email username followers profilePic following isPrivate verified');

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found',
            });
        }

        // Count the number of followers and following
        const followersCount = user.followers.length;
        const followingCount = user.following.length;

        // check current user followed or not

        const followed = user.followers.findIndex((item) => item.userId === currentUserId);

        // Include the counts in the response
        const responseData = {
            email: user.email,
            username: user.username,
            followers: followersCount,
            following: followingCount,
            private: user.private,
            profilePic: user.profilePic,
            verified: user.verified,
            followed:followed !== -1 ? true : false
        };

        return res.status(200).json(responseData);
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
}


const userFollowers = async (req, res) => {
    try {
        const { id, limit, page } = req.query;
        const pageSize = limit ? parseInt(limit) : 10;
        const pageNumber = page ? parseInt(page) : 1;
        const skip = (pageNumber - 1) * pageSize;
        const count = await userModel.findById(id).select('followers').countDocuments();
        const data = await userModel
            .findById(id)
            .select('followers')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit ? parseInt(limit) : 10);

        const responseData = {
            count,
            data:data.followers,
            page: pageNumber,
            totalPages: Math.ceil(count / pageSize)
        };

        return res.status(200).json(responseData);
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
}


const userFollowing = async (req, res) => {
    try {
        const { id, limit, page } = req.query;
        const pageSize = limit ? parseInt(limit) : 10;
        const pageNumber = page ? parseInt(page) : 1;
        const skip = (pageNumber - 1) * pageSize;
        const count = await userModel.findById(id).select('following').countDocuments();
        const data = await userModel
            .findById(id)
            .select('following')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit ? parseInt(limit) : 10);

        const responseData = {
            count,
            data:data.following,
            page: pageNumber,
            totalPages: Math.ceil(count / pageSize)
        };

        return res.status(200).json(responseData);
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
}

// follow request

const followRequest = async (id, user) => {
    const request = await userModel.findByIdAndUpdate(
        id,
        {
            $push: { requests: user },
        },
        { new: true }
    );
    if (!request) return next(new Error('User not Found'));

    return request;
};

// Todo Follow

const follow = async (req, res, next) => {

    const id = req.headers.authorization;
    const { userId } = req.query;

    //  wanted to follow user
    const user = await userModel.findById(userId);

    if (user.private) {
        const request = followRequest(userId, id);

        return res.status(200).json({
            data: request,
        });
    }
    //   current user

    const currentUser = await userModel.findById(id);

    currentUser.following.push({ userName: user.username, userId: userId });
    await currentUser.save();

    user.followers.push({ userName: currentUser.username, userId: id });

    await user.save();

    res.status(200).json({
        status: 'success',
    });
}

//Todo unfollow
const unfollow = async (req, res, next) => {
    const id = req.headers.authorization;
    const { userId } = req.query;

    //  wanted to unfollow user
    const user = await userModel.findById(userId);

    //    current user
    const currentUser = await userModel.findById(id);

    currentUser.following = currentUser.following.filter(item => !(item.userId === userId));
    await currentUser.save();
    user.followers = user.followers.filter(item => !(item.userId === id));
    await user.save();
    return res.status(200).json({
        status: 'success',
    });



    // await Notification.deleteMany({
    //   to: req.body.id,
    //   user: following._id,
    //   type: 'Follow',
    // });

}



// upload user profile
const userUpdate = async(req,res)=>{
    try {
        const userId = req.headers.authorization;
        const {username,interests,isPrivate,deleteProfilePic,verified} = req.body;
        const data = {};
        if (username) data.username = username;
        if (interests) data.interests = interests;
        if (isPrivate !== undefined) data.isPrivate = isPrivate;
        if (verified !== undefined) data.verified = verified;
        if (req.file) {
            const imageUrl = req.file.location;
            data.profilePic = imageUrl;
        }
        if(deleteProfilePic) {
            const result = await  deleteProfilePicFromS3(`${userId}.jpg`);
            data.profilePic = ''
        }
   
        const user = await userModel.findByIdAndUpdate(userId,
         data,
        {
            new:true
        }).select('username profilePic isPrivate interests');
        return res.status(200).send(user);
    } catch (error) {
        return res.status(404).json({
            status:'fail',
            message:`${error}`
        })
    }
}

export {
    userQuotes,
    userInfo,
    userFollowers,
    userFollowing,
    follow,
    unfollow,
    userUpdate
}