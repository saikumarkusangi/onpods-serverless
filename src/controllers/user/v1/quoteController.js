import { quoteModel } from "../../../models/quoteModel.js";
import userModel from "../../../models/userModel.js";




// upload new quote
const uploadQuote = async (req, res) => {
    try {

        const data = new quoteModel({
            ...req.body,

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
        const { category, limit,page } = req.query;
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
        const { query, limit } = req.query;
        const usernamePattern = new RegExp(query, 'i');

        const users = await userModel.find({ username: usernamePattern });

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
            .limit(limit ? parseInt(limit) : 10);

        return res.status(200).json({
            count,
            data,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: `${error}`,
        });
    }
};



// increase quote likes
const increaseLikes = async (req, res) => {
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
        // const quote = await quoteModel.findById(id);
            const result = await quoteModel.findByIdAndDelete(id);
            return res.status(200).json({
                status: 'success',
                message: 'Deleted Successfully'
            });
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
            const { category } = req.query;
            const relatedQuotes = await quoteModel.aggregate([
                {
                    $match: {
                        category: category,
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
    increaseLikes,
    deleteQuote,
    getQuoteId,
    relatedQuotes
}