import { quoteModel } from "../../../models/quoteModel.js";
import userModel from "../../../models/userModel.js";


// get quotes uploaded by user

const userQuotes = async (req, res) => {
    try {
        const {limit,page,id } = req.query;
        const pageSize = limit ? parseInt(limit) : 10;
        const pageNumber = page ? parseInt(page) : 1;
        const skip = (pageNumber - 1) * pageSize;
        const count = await quoteModel.countDocuments({ userId:id });
        const data = await quoteModel
            .find({ userId:id })
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

const userInfo = async(req,res)=>{
    try {
        const id = req.id;
        const data = await userModel.findById(id)
        .select('email username');
        return res.status(200).json(data);
    } catch (error) {
        return res.status(404).json({
            status:'fail',
            message:`${error}`
        })
    }
}

export {
    userQuotes,
    userInfo
}