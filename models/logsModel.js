const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    admin: String,
    action: String,
    targetUser: String
    },
    {timestamps:true}
);

module.exports = mongoose.model('Modlog', logSchema);
