import { model, Schema } from 'mongoose';

const reportSchema = new Schema({
    postId: {
      type:String
    },
    type:String,
    reasons: {
        type: Map,
        of: Number,
        default: {
            'Copied from other': 0,
            'misleading': 0,
            'Harmful or dangerous acts': 0,
            'Hateful or abusive content': 0,
            'Violent or repulsive content': 0,
            'Sexual content': 0
        }
    }
}, {
    versionKey: false,
    timestamps: true
});

const reportModel = model('reports', reportSchema);

export default reportModel;
