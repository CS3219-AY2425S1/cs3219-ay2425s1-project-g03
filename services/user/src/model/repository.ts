import UserModel from './user-model';
import 'dotenv/config';
import { connect } from 'mongoose';

export async function connectToDB() {
    const mongoUri = process.env.NODE_ENV === 'production' ? process.env.DB_CLOUD_URI : process.env.DB_LOCAL_URI;

    if (!mongoUri) {
        throw new Error('MongoDB URI not specified');
    }

    await connect(mongoUri, {
        authSource: 'admin',
        user: process.env.DB_USERNAME,
        pass: process.env.DB_PASSWORD,
    });
}

export async function createUser(username: string, email: string, password: string) {
    return new UserModel({ username, email, password }).save();
}

export async function findUserByEmail(email: string) {
    return UserModel.findOne({ email });
}

export async function findUserById(userId: string) {
    return UserModel.findById(userId);
}

export async function findUserByUsername(username: string) {
    return UserModel.findOne({ username });
}

export async function findUserByUsernameOrEmail(username: string, email: string) {
    return UserModel.findOne({
        $or: [{ username }, { email }],
    });
}

export async function findAllUsers() {
    return UserModel.find();
}

export async function updateUserById(userId: string, username: string, email: string, password: string) {
    return UserModel.findByIdAndUpdate(
        userId,
        {
            $set: {
                username,
                email,
                password,
            },
        },
        { new: true }, // return the updated user
    );
}

export async function updateUserPrivilegeById(userId: string, isAdmin: boolean) {
    return UserModel.findByIdAndUpdate(
        userId,
        {
            $set: {
                isAdmin,
            },
        },
        { new: true }, // return the updated user
    );
}

export async function deleteUserById(userId: string) {
    return UserModel.findByIdAndDelete(userId);
}
