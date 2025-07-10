const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({

        sender:{
            type:mongoose.Schema.Types.ObjectId,
            ref: 'User' //reference for objectid comes from user
        },
        receiver:{
            type:mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message:{   
            type:String,
            required: true
        }
    },
    {timestamps:true} // timestamps.
);

module.exports = mongoose.model('Chat', chatSchema);