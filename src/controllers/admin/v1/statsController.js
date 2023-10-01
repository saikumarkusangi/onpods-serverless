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

const mongodbStats = async(req,res)=>{
    try {

        function formatBytes(bytes) {
            if (bytes < 1024) {
              return bytes + ' Bytes';
            } else if (bytes < 1024 * 1024) {
              return (bytes / 1024).toFixed(2) + ' KB';
            } else if (bytes < 1024 * 1024 * 1024) {
              return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
            } else {
              return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
            }
          }
          
       const [quotesStats,podcastStats,userStats] = await Promise.all([
        quoteModel.collection.stats(),
        podcastmodel.collection.stats(),
        userModel.collection.stats()
       ])
      

       const totalQuotesStorageSize = formatBytes(quotesStats.size);
       const totalPodcastStorageSize = formatBytes(podcastStats.totalSize);
       const totalUserStorageSize = formatBytes(userStats.totalSize);
       
       return res.status(200).json({
        quotesStats:totalQuotesStorageSize,
        podcastStats:totalPodcastStorageSize,
        userStats:totalUserStorageSize,
        
       });
    } catch (error) {
        return res.status(404).json({
            message:`${error}`
        })
    }
}

export default {stats,mongodbStats};