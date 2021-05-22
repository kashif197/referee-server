const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BusinessSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    contact: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    resetToken:String,
    expireToken:Date,
})

module.exports = Business = mongoose.model('business', BusinessSchema)