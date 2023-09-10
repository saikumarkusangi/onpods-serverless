
import reportModel from "../../models/reportModel.js";


// report an post

const reportPost = async (req, res) => {
    try {
        const { postId, reason } = req.body;

        const existingReport = await reportModel.findOne({ postId });

        if (existingReport) {
            existingReport.reportCount += 1;
            await existingReport.save();
        } else {
            const report = new reportModel({
                postId,
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

        const { limit } = req.query;
        const count = await reportModel.countDocuments();
        const data = await reportModel.find()
            .limit(limit ? limit : 10);

        return res.status(200).json({
            count,
            data
        })

    } catch (error) {
        return res.status(404).json({
            status: 'fail',
            message: 'An error occurred while fetching the reports',
        });
    }
}


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