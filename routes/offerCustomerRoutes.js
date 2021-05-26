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
                  const offerAvail = await OfferCustomerMap.findOne({offer_campName: offData.campaign_name});
                  const customerAvail = await OfferCustomerMap.findOne({ customer_id: custData.id });
                  if (offerAvail && customerAvail) {
                    //redeem offer logic
                    offerAvail.count += 1 // can also be customerAvail
                    OfferCustomerMap.updateOne(
                      { _id: offerAvail.id },
                      {
                        $set: {
                          count: offerAvail.count
                        },
                      },
                      (err, data) => {
                        if(offerAvail.count == offerAvail.targetTransaction){
                        res.send({status: true, count:offerAvail.count,
                          message: "Mapper already created.\nOffer can be redeemed now."})
                      } else if(offerAvail.count < offerAvail.targetTransaction){
                        res.send({status: false, count:offerAvail.count,
                          message: "Mapper already created.\nOffer cannot be redeemed now."})
                      }
                      });
                  } else {
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
//             // validation
//             const { error } = addOfferValidation(req.body);
//             if (error) {
//               console.log(error)
//               return res.status(400).send(error.details[0].message)
//             };
//             // adding offer
//             const newOffer = new Offer({
//               business_id: req.body.business_id,
//               campaign_name: req.body.campaign_name,
//               headline: req.body.headline,
//               live_date: req.body.live_date,
//               expiry_date: req.body.expiry_date,
//               commission_based: req.body.commission_based,
//               commission_value: req.body.commission_value,
//               target_transaction: req.body.target_transaction,
//               description: req.body.description,
//             })
//             newOffer.save().then((offer) => res.json({ status: true }));
//           }
//         });

//       }
//     })
//   })

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
