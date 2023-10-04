import { quoteModel } from "../../../models/quoteModel.js";
import userModel from "../../../models/userModel.js";
import { deleteImageFromS3 } from "../../../services/s3Service.js";




// upload new quote
const uploadQuote = async (req, res) => {
    try {
        const imageUrl = req.file.location;
        const { category } = req.body;
        const userId = req.headers.authorization;
        const data = new quoteModel({
            userId: userId,
            imageUrl: imageUrl,
            category: category,
        });
        await data.save();
        res.status(200).json({
            status: 'success',
            message: 'Uploaded Successfully'
        });

    } catch (error) {
        return res.status(404).json({
            status: 'fail',
            message: `${error}`
        });
    }
};

// get quotes by category

const getQuotesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { limit, page } = req.query;
        const pageSize = limit ? parseInt(limit) : 10;
        const pageNumber = page ? parseInt(page) : 1;
        const skip = (pageNumber - 1) * pageSize;
        const count = await quoteModel.countDocuments({ category });
        const data = await quoteModel
            .find({ category })
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


// search query (user,category)

const searchQuotes = async (req, res) => {
    try {
        const { query, limit, page } = req.query;
        const usernamePattern = new RegExp(query, 'i');
        const users = await userModel.find({ username: usernamePattern });
        const pageSize = limit ? parseInt(limit) : 10;
        const pageNumber = page ? parseInt(page) : 1;
        const skip = (pageNumber - 1) * pageSize;
        const userIds = users.map(user => user._id);
        const filter = {
            $or: [
                { userId: { $in: userIds } },
                { category: { $regex: query, $options: 'i' } },
            ],
        };

        const count = await quoteModel.countDocuments(filter);
        const data = await quoteModel
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(limit ? parseInt(limit) : 10)
            .select('-category');

        return res.status(200).json({
            count,
            data,
            page: pageNumber,
            totalPages: Math.ceil(count / pageSize)
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: `${error}`,
        });
    }
};



// Quote Like or unlike
const quoteLike = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedQuote = await quoteModel.findByIdAndUpdate(
            id,
            { $inc: { likes: 1 } },
        );
        if (!updatedQuote) {
            return res.status(404).json({
                status: 'fail',
                message: 'Quote not found'
            });
        };
        return res.status(200).json({
            status: 'success',
            message: 'Liked successfully',

        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: `${error}`
        });
    }
};

// Delete quote
const deleteQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const quote = await quoteModel.findById(id);
        const parts = quote.imageUrl.split('/');
        const objectKey = parts[parts.length - 1];
        const result = await deleteImageFromS3(objectKey);
        if(result){
            await quoteModel.findByIdAndDelete(id);
            return res.status(200).json({
                status: 'success',
                message: 'Deleted Successfully'
            });
        }
        else{
            return res.status(404).json({
                status: 'fail',
                message: 'Something went'
            });
        }
       
    } catch (error) {
        return res.status(404).json({
            status: 'fail',
            message: `${error}`
        });
    }
}

// get quotes by id

const getQuoteId = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await quoteModel.findById(id);

        if (!data) {
            return res.status(404).json({
                status: 'fail',
                message: 'Quote not found',
            });
        }

        return res.status(200).json({
            data,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: `${error}`,
        });
    }

};


const relatedQuotes = async (req, res) => {
    try {
        const { id } = req.params;
        const findCategory = await quoteModel.findById(id).select('category');
        const relatedQuotes = await quoteModel.aggregate([
            {
                $match: {
                    category: findCategory.category,
                    _id: { $ne: id },
                },
            },
            {
                $sample: { size: 6 },
            },
        ]);

        return res.status(200).json({
            relatedQuotes,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: `${error}`,
        });
    }

}


export {
    uploadQuote,
    getQuotesByCategory,
    searchQuotes,
    quoteLike,
    deleteQuote,
    getQuoteId,
    relatedQuotes
}