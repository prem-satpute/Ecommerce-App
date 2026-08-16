import { Schema } from "mongoose";

export const sessionSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
});