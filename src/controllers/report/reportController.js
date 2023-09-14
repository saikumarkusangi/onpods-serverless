
import reportModel from "../../models/reportModel.js";


// report an post

const reportPost = async (req, res) => {
    try {
        const { id, reason } = req.body;

        const existingReport = await reportModel.findOne({ _id:id });

        if (existingReport) {
            existingReport.reportCount += 1;
            await existingReport.save();
        } else {
            const report = new reportModel({
                id,
                reason,
            });
            await report.save();
        }

        return res.status(200).json({
            status: 'success',
            message: 'Reported successfully',
        });
    } catch (error) {
        return res.status(404).json({
            status: 'fail',
            message: 'An error occurred while reporting the post',
        });
    }
};


// List all reports
const allReports = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;

        const count = await reportModel.countDocuments();
        const skip = (pageNumber - 1) * pageSize;

        const data = await reportModel.find()
            .skip(skip)
            .limit(pageSize);

        return res.status(200).json({
            count,
            data,
            page: pageNumber,
            totalPages: Math.ceil(count / pageSize)
        });

    } catch (error) {
        return res.status(500).json({
            status: 'fail',
            message: 'An error occurred while fetching the reports',
        });
    }
};


// delete a reports

const deleteReports = async (req, res) => {
    try {

        const { id } = req.params;
        const response = await reportModel.findByIdAndDelete(id)
        
        return res.status(200).json({
          status:'success',
          message:'Report Deleted Successfully'
        })

    } catch (error) {
        return res.status(404).json({
            status: 'fail',
            message: 'An error occurred while deleting the report',
        });
    }
}





export {reportPost,allReports,deleteReports};