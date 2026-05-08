import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    phone?: string;
    image: string;
    role: string;
    password?: string;
}


const schema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        default: "",
    },

    image: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        select: false,
    },
    role: {
        type: String,
        default: null,
    },
},
    {
        timestamps: true,
    }
);

const User = mongoose.model<IUser>("User", schema);
export default User;