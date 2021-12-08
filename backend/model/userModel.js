const mongoose = require('mongoose')

//Creating a schema for the users to be stored in the database
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, //username should be unique
        maxlength: 15
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User', userSchema)