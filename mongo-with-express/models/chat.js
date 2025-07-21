const mongoose=require("mongoose");
const { app } = require("..");

const chatSchema=new mongoose.Schema({
    from:{
        type: String,
        required: true,
    },
    to:{
        type: String,
        required: true,
    },
    message:{
        type: String,
        maxLength: 50,
    },
    date:{
        type: Date
    }
})

const Chat=mongoose.model("Chat", chatSchema);

module.exports = Chat;
