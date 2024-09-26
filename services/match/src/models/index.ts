import mongoose from 'mongoose';

export async function connectToDB() {
    const mongoURI = process.env.NODE_ENV === 'production' ? process.env.DB_CLOUD_URI : process.env.DB_LOCAL_URI;

    console.log('MongoDB URI:', mongoURI);

    if (!mongoURI) {
        throw new Error('MongoDB URI not specified');
    } else if (!process.env.DB_USERNAME || !process.env.DB_PASSWORD) {
        throw Error('MongoDB credentials not specified');
    }

    await mongoose.connect(mongoURI, {
        authSource: 'admin',
        user: process.env.DB_USERNAME,
        pass: process.env.DB_PASSWORD,
    });
}
