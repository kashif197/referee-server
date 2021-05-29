const express = require("express");
const router = express.Router();
const Payment = require("../models/PaymentGateway");
const Business = require("../models/Business");
const Offer = require("../models/Offer");
const OfferCustomerMap = require("../models/OfferCustomerMap");

// Get Balance of the Business
router.get('/getBalance/:id', async (req, res)=>{
    const obj = await Business.findOne({_id:req.params.id});
    const balance = obj.balance;
    res.send({status: true, message: "Balance of the business", data:balance})
})

// Get Total Offers 
router.get('/getTotalOffers/:id', async (req, res)=>{
    const total = await Offer.find({business_id:req.params.id});
    const count = Object.keys(total).length;
    res.send({status: true, message: "Total offers of the business", data:count})
})

// Get Total Offers that have been Availed
router.get('/getTotalAvailedOffers/:id', async (req, res)=>{
    const total = await OfferCustomerMap.find({business_id:req.params.id});
    const count = Object.keys(total).length;
    res.send({status: true, message: "Total availed offers of the business", data:count})
})

// Get Total Offers that have been Redeemed
router.get('/getTotalRedeemedOffers/:id', async (req, res)=>{
    const mappers = await OfferCustomerMap.find({business_id:req.params.id});
    const len = Object.keys(mappers).length;
    var times=0;
    for (var i=0; i<len; i++){
        if(mappers[i].redeemed){
            times =times + 1;
        }
    }
    res.send({status: true, message: "Total availed offers of the business", data:times})
})



module.exports = router;