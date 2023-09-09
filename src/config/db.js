import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected!!!');
    } catch (error) {
        console.error(`Database error: ${error}`);
    }
};

export default dbConnect;
