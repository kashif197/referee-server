const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PaymentSchema = new Schema({
    business_id: {
        type: String
    },
    business_username: {
        type: String
    },
    receipt_email: {
        type: String
    },
    paymentId: {
        type: String
    },
    amount: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
    },
    description: {
        type: String,
    },
    paid: {
        type: Boolean,
    },
    receipt_url: {
        type: String,
    },
    order_id: {
        type: String,
    },
    status: {
        type: String,
    },
    dateCreated: {
        type: String,
        default: new Date().toDateString()},
    timeCreated: {
        type: String,
        default: new Date().toTimeString(),}
})

module.exports = Payment = mongoose.model('payment', PaymentSchema)