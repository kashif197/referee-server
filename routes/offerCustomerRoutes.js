const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Import Model
const Offer = require("../models/Offer");
const Customer = require("../models/Customer");
const OfferCustomerMap = require("../models/OfferCustomerMap");
const { off } = require("../models/Offer");

// View All OfferCustomer Mappers
router.get("/", (req, res) => {
  OfferCustomerMap.find().then((offerCustomerMap) =>
    res.json(offerCustomerMap)
  );
});

router.delete('/deleteOffCust/:id', (req, res) => {
    OfferCustomerMap.findById(req.params.id)
    .then(offer => offer.remove().then(() => res.json({ success: true })))
    .catch(err => res.status(404).json({ err }))
 })

router.post("/availOffer", verifyToken, async (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.status(400).send({ msg: err });
    } else {
      // CHECK: if offer already exists
      Offer.findOne(
        { campaign_name: req.body.campaign_name },
        async (err, offData) => {
          if (offData) {
            // res.status(400).send({ status: false, message: "Offer may already exist. Add a unique campaign name." })
            Customer.findOne(
              { username: req.body.username },
              async (err, custData) => {
                if (custData) {
                  const matchedMapper = await OfferCustomerMap.findOne(
                    {offer_campName: offData.campaign_name, 
                    customer_id: custData.id});
                  const unmatchedMapper = await OfferCustomerMap.findOne({$or: [
                    {offer_campName: offData.campaign_name}, 
                    {customer_id: {'$ne':custData.id}}
                ]});
                  if (matchedMapper) {

                    // if the mapper is present add the counter till it reaches the target transaction
                    
                    //redeem offer logic
                    matchedMapper.count += 1 
                    OfferCustomerMap.updateOne(
                      { _id: matchedMapper.id },
                      {
                        $set: {
                          count: matchedMapper.count
                        },
                      },
                      (err, data) => {
                        if(matchedMapper.count == matchedMapper.targetTransaction){
                        res.send({redeemStatus: true, status: true, count:matchedMapper.count,
                          message: "Offer can be redeemed now."})
                      } else if(matchedMapper.count < matchedMapper.targetTransaction){
                        res.send({redeemStatus: false, status: true,count:matchedMapper.count,
                          message: "You have already availed this offer."})
                      } else{
                        res.send({redeemStatus: false, status: true,count:-1,
                          message: "Offer already redeemed."})
                      }
                      });
                  } 
                  else if (unmatchedMapper) {

                    // create a new mapper for an offer to be availed by another customer
                    
                    b_id = offData.business_id;
                    c_id = custData.id;
                    o_id = offData.id;
                    o_cn = offData.campaign_name;
                    targetTrans = offData.target_transaction;
                    const newOffCust = new OfferCustomerMap({
                      business_id: b_id,
                      customer_id: c_id,
                      offer_id: o_id,
                      offer_campName: o_cn,
                      targetTransaction: targetTrans,
                      count: 0,
                    });
                    newOffCust
                      .save()
                      .then((newOffCust) => {
                        res.send({ status: true, message: "Mapper Created" });
                      })
                      .catch((err) =>
                        res.send({ status: false, message: "Mapper not created", err })
                      );
                  }                 
                  else {

                    // Create a new mapper 
                    
                    b_id = offData.business_id;
                    c_id = custData.id;
                    o_id = offData.id;
                    o_cn = offData.campaign_name;
                    targetTrans = offData.target_transaction;
                    const newOffCust = new OfferCustomerMap({
                      business_id: b_id,
                      customer_id: c_id,
                      offer_id: o_id,
                      offer_campName: o_cn,
                      targetTransaction: targetTrans,
                      count: 0,
                    });
                    newOffCust
                      .save()
                      .then((newOffCust) => {
                        res.send({ message: "Mapper Created" });
                      })
                      .catch((err) =>
                        res.send({ message: "Mapper not created", err })
                      );
                  }
                } else {
                  res.send({ message: "Customer not found." });
                }
              }
            );
          } else {
            res.send({ message: "Offer Campaign not found." });
          }
        }
      );
    }
  });
});


router.get('/getAvailedOffers/:id', async (req, res) => {
  const customer = await OfferCustomerMap.find({customer_id: req.params.id});
  res.send({status: true, data: customer, message: "All availed offers of the customer."})
  // .then(offer => offer.remove().then(() => res.json({ success: true })))
  // .catch(err => res.status(404).json({ err }))
})


function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

module.exports = router;
