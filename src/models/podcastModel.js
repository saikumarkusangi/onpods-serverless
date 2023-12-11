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
    followers: [{
            _id: false,
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        },

    ],
    totalRating: {
        type: Number,
        default: 0
    },
    numberOfRatings: {
        type: Number,
        default: 0
    },

    title: String,
    description: String,
    episodes: [{
        title: { type: String },
        description: { type: String },
        audioUrl: { type: String },
        posterUrl: { type: String },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        listens: {
            type: Number,
            default: 0
        },
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
    color: String

}, {
    versionKey: false,
    timeseries: false
});

const podcastBgCategoriesSchema = new Schema({
    category: String,
    data: [{
        name: String,
        audioUrl: String
    }]

}, {
    versionKey: false,
    timestamps: false
})


const podcastmodel = model('podcast', podcastSchema);
const podcastCategoriesModel = model('podcat-categories', podcastCategoriesSchema);
const podcastBgCategoriesModel = model('podcast-bg-categories', podcastBgCategoriesSchema);

export { podcastmodel, podcastCategoriesModel, podcastBgCategoriesModel };