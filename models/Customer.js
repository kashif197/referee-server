const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Joi = require('joi')

const CustomerSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true,
        default: "123"
    },
    dob: {
        type: Date,
        required: true,
        default: Date.now
    },
    referral_code: {
        type: String,
        required: false,
        default: ""
    },
    resetToken:String,
    expireToken:Date,
})

module.exports = Customer = mongoose.model('customer', CustomerSchema)