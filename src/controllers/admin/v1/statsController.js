import userModel from "../../../models/userModel.js"
import {podcastmodel} from '../../../models/podcastModel.js';
import {quoteModel} from '../../../models/quoteModel.js';
import reportModel from '../../../models/reportModel.js';

const stats = async(req,res)=>{
    try {
        const [usersCount,podcastsCount,quotesCount,reportsCount] =
         await Promise.all([
             userModel.countDocuments(),
             podcastmodel.countDocuments(),
             quoteModel.countDocuments(),
             reportModel.countDocuments()
        ]);
        return res.status(200).json({
            usersCount,
            podcastsCount,
            quotesCount,
            reportsCount
        });
    } catch (error) {
        return res.status(404).json({
            message:`${error}`
        })
    }
}

export default stats;