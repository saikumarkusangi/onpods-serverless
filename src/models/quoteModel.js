import { model, mongoose, Schema } from 'mongoose';

const quoteSchema = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
     },
     imageUrl:String,
    category: String,
    createdAt: {
        type: Date,
    },
    likes:Number
},{
    versionKey:false,
    timestamps:{
        createdAt: 'createdAt',
        updatedAt:false
    },
    
});


const quotesCategoriesSchema = new Schema({
   name:String,
},{
    versionKey:false,
    timeseries:false
});


const quoteModel = model('quote',quoteSchema);
const quoteCategoryModel = model('quote-categories',quotesCategoriesSchema);

export  {quoteModel,quoteCategoryModel};