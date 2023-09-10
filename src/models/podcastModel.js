import { model, mongoose, Schema } from 'mongoose';

const podcastSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    posterUrl: String,
    category: String,
    createdAt: {
        type: Date,
    },
    rating: Number,
    title:String,
    description:String,
    episodes:[{
        title:{ type:String },
        description:{ type:String },
        audioUrl:{ type:String },
        bgUrl:{ type:String }
      }]
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: false
    },

});


const podcastCategoriesSchema = new Schema({
    name: String,
    imageUrl: String,

}, {
    versionKey: false,
    timeseries: false
});


const podcastmodel = model('podcast', podcastSchema);
const podcastCategoriesModel = model('podcat-categories', podcastCategoriesSchema);

export { podcastmodel, podcastCategoriesModel };