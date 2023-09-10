import {model,mongoose,Schema} from 'mongoose';

const reportSchema = new Schema({
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'quote'
    },
    reason:{
        type:String,
    },
    reportCount: {
        type: Number,
        default: 1, 
    }

});

const reportModel = model('reports',reportSchema);

export default reportModel;