



import mongoose from "mongoose";

console.log('MONGO_URI:', process.env.MONGO_URI);

const connectDB = async () => {
    mongoose.connection.on('connected', () => 
        console.log('Database connected successfully!')
    );
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
};

export default connectDB;
