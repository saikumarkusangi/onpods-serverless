import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: { type: String ,required:true},
    password: { type: String, required: true },
    email: { type: String, required: true },
    profilePic:{type:String},
    isOnline: { type: Boolean, default: false },
    isActive: { type: Boolean },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    interests : [],
    // isPublic: {
    //     type: Boolean,
    //     default: true,
    //   },
    userType: {
        type: String,
        enum: ['User', 'Admin', 'Moderator'],
        default: 'User'
    },
    // refreshToken: { type: String },


}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    },
    versionKey:false
});

userSchema.pre('save', async function (next) {
    this.isActive = true;
    this.password = await bcrypt.hash(this.password, 8);
    next();
});

userSchema.methods.isPasswordMatched = async function (password) {
    return await bcrypt.compare(password, this.password);
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
