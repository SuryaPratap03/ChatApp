import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    senderId :{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User',
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User',
    },
    message:{
        type:String,
        required:true,
    },
    attachment: {
        type: String, // URL or path to the uploaded file
        required: false,
    },
    read:{
        type:Boolean,
        default:false,
    }
},{timestamps:true});

export const Message = mongoose.model('Message',MessageSchema);