import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    oauth: {
        type: String,
        default: ''
    },
    profilePic: { type: String, default: '' },
    isPrivate: {
        type: Boolean,
        default: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    followers: [
        {
            _id: false,
            userName: {
                type: String
            },
            userId: {
                type: String,
            }
        },
    ],
    following: [
        {
            _id: false,
            userName: {
                _id: false,
                type: String
            },
            userId: {
                _id: false,
                type: String,
            }
        },
    ],
    deviceTokens: [
        {
            type: String,
        },
    ],
    requests: [
        {
            _id: false,
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        },
    ],
    fcmToken:{type:String},
    isOnline: { type: Boolean, default: false },
    isActive: { type: Boolean },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    interests: [],
    myList: [],
    userType: {
        type: String,
        enum: ['User', 'Admin', 'Moderator'],
        default: 'User'
    },
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    },
    versionKey: false
});

userSchema.pre('save', async function (next) {
    this.isActive = true;

    // Hash the password only if it is present
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 8);
    }

    next();
});

userSchema.methods.isPasswordMatched = async function (password) {
    return !this.password || (await bcrypt.compare(password, this.password));
};

userSchema.method('toJSON', function () {
    const {
        _id, __v, ...object
    } = this.toObject();
    object.id = _id;
    delete object.password;

    return object;
}, { versionKey: false });

export default model('user', userSchema);
