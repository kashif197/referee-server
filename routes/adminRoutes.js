const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Business = require("../models/Business");

// View All Offers
router.get("/", (req, res) => {
    Offer.find().then((offer) => res.json(offer));
});

const { addOfferValidation } = require('./validation');
const { editOfferValidation } = require('./validation')

// @route DELETE api/customers
// @desc Delete All Offers
// @access public
router.delete("/deleteAll", (req, res) => {
    Offer.remove({})
        .then(() => res.json({ success: true }))
        .catch((err) => res.status(404).json({ err }));
});

router.delete("/deleteAllUsers", (req, res) => {
    Customer.remove({})
        .then(() => res.json({ success: true }))
        .catch((err) => res.status(404).json({ err }));
    Business.remove({})
        .then(() => res.json({ success: true }))
        .catch((err) => res.status(404).json({ err }));
});

module.exports = router

// Add An Offer
router.post("/add", (req, res) => {

    // CHECK: if offer already exists
    const offerExist = Offer.findOne({ campaign_name: req.body.campaign_name }, (err, data) => {
        if (data) {
            res.status(400).json("Offer already exists")
        } else {
            // validation
            const { error } = addOfferValidation(req.body);
            if (error) return res.status(400).send(error.details[0].message);
            // adding offer
            const newOffer = new Offer({
                business_id: req.body.business_id,
                campaign_name: req.body.campaign_name,
                headline: req.body.headline,
                live_date: req.body.live_date,
                expiry_date: req.body.expiry_date,
                commission_based: req.body.commission_based,
                commission_value: req.body.commission_value,
                target_transaction: req.body.target_transaction,
                description: req.body.description,
            })
            newOffer.save().then((offer) => res.json(offer));
        }
    });

})

// View All Customers
router.get("/allC", (req, res) => {
    Customer.find().then((offer) => res.json(offer));
});

// View All Businesses
router.get("/allB", (req, res) => {
    Business.find().then((offer) => res.json(offer));
});

// Check For Username
router.post("/checkUsername", (req, res) => {
    Business.findOne({username: req.body.username}, (err, data) => {
        if (data === null) {
            console.log(req.body.username)
            res.send({ username: false})
        }
        else {
            res.send({ username: true})
        }
    })
})

// Check If Account Exists With Email
router.post("/checkEmail", (req, res) => {
    Business.findOne({email: req.body.email}, (err, data) => {
        if (data === null) {
            console.log(req.body.email)
            res.send({ email: false})
        }
        else {
            res.send({ email: true})
        }
    })
})