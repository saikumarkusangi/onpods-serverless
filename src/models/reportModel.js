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

},{
    versionKey:false,
    timestamps:false
});

const reportModel = model('reports',reportSchema);

export default reportModel;