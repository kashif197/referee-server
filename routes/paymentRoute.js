const express = require("express");
const router = express.Router();
const Payment = require("../models/PaymentGateway");
const Business = require("../models/Business");
const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51IvpLtGWAyqjCK11qRriLG8p6iCrfIyhBnPCjFYe89b9Fz52bpxl9jcj4Ub2EovehgbsYcg0wzM0OEFIYOKmQGKZ00Aibcbpa0"
);

router.post("/getTransactionRecords", async (req, res) => {
  const records = await Payment.find({ receipt_email: req.body.receipt_email });
  res.send({ status: true, data: records });
});

router.get("/getAllTransactionRecords", async (req, res) => {
  const records = await Payment.find();
  res.send({ status: true, data: records });
});

router.delete("/deleteTransactionRecord/:id", (req, res) => {
  Payment.findById(req.params.id)
    .then((offer) => offer.remove().then(() => res.json({ success: true })))
    .catch((err) => res.status(404).json({ err }));
});

router.post("/stripeTransaction", async (req, res) => {
  const receipt = await stripe.charges.create({
    amount: req.body.amount * 100,
    currency: "pkr",
    source: "tok_mastercard",
    metadata: { order_id: Math.floor(1000 + Math.random() * 9000).toString() },
    receipt_email: req.body.receipt_email,
    description: req.body.description,
  });
  // console.log(receipt.id , "\n", receipt.metadata.order_id, "\n", receipt.amount/100, "\n",
  // receipt.currency, "\n", receipt.description, "\n", receipt.paid, "\n", receipt.receipt_url, "\n",
  // receipt.status, "\n", receipt.receipt_email, "\n")

  const transactionRecord = await new Payment({
    paymentId: receipt.id,
    order_id: receipt.metadata.order_id,
    amount: receipt.amount / 100,
    currency: receipt.currency,
    receipt_email: receipt.receipt_email,
    business_username: req.body.business_username,
    description: receipt.description,
    paid: receipt.paid,
    receipt_url: receipt.receipt_url,
    status: receipt.status,
  });
  transactionRecord
    .save()
    if(transactionRecord){
      const business = await Business.findOne({username: transactionRecord.business_username});
      business.balance += transactionRecord.amount;  
      Business.updateOne({username: transactionRecord.business_username},
        {
          $set: {
            balance: business.balance,
          },
        }
      ).then(data=>{res.send({   status: true,
      message: "transaction record created",
      data: transactionRecord,})})
    //   console.log(business)
    //   res.send({
    //     status: true,
    //     message: "transaction record created",
    //     data: transactionRecord,
    //   });
      }
    else{
      res.send({ status: false, message: "transaction record not created." });}
    
});

// Retrieves all previous receipts
// router.get('/retrieveStripeTransactions', async (req, res)=>{
//     var arr = [];
//     const prevReceipts = await Payment.findOne();
//     const charge = await stripe.charges.retrieve(
//         prevReceipts.id
//       ); //url, date, amount
//     console.log(charge);
//     res.send({status: true, data: prevReceipts, message:"Received all previous receipts."})
// })

module.exports = router;
