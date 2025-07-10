const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true //as in this must be entered.
    },
    email: {
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type: String,
        enum: ['noob', 'admin'],
        default: 'noob'
    },
    isBanned:{ 
        type: Boolean,
        default: false
    },
    isMuted:{
        type: Boolean,
        default: false
    },
    isOnline:{
        type:String,
        default: '0'
    }
}); //layout of how the user is. two types of users, admins and normal ones. by default ur normal. the schema is made using mongoose and stored into our database. isOnline is a string because we want to show 'Online'/'Offline'

module.exports = mongoose.model('User', userSchema); //exports the model. first argument is the name of the model as read outside of code and second argument is inside code.