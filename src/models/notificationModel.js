import { model } from "mongoose";

const NotificationSchema = new mongoose.Schema({
    from: {
      type: String
    },
    to: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['Follow', 'Quote-Like', 'Campaign', 'Podcast-Like'],
    },
    post: {
      type: String,
    },
    seen: {
      type: Boolean,
      default: false,
    },
   
  });

  
const notificationModel = model('notifications',NotificationSchema);

export default notificationModel;