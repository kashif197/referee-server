const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const OfferCustomerMapSchema = new Schema({
    business_id: {
        type: String,
        required: true
    },
    customer_id: {
        type: String,
        required: true
    },
    offer_id: {
        type: String,
        required: true
    },
    offer_campName:{
        type: String,
    },
    live_date: {
        type: Date,
        default: Date.now
    },
    expiry_date: {
        type: Date,
        default: Date.now
    },
    count: {
        type: Number,
        required: false
    },
    targetTransaction: {
        type: Number,
        required: true,
        default: 0
    }
})

module.exports = Offer = mongoose.model('offerCustomerMap', OfferCustomerMapSchema)