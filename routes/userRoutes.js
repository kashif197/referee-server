const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
var QRCode = require("qrcode");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { SENDGRID_API, EMAIL } = require("../config/keys");

// Import Model
const Customer = require("../models/Customer");
const Business = require("../models/Business");

// Importing Validations
const { logInValidation } = require("./validation");
const { signUpCustomerValidation } = require("./validation");
const { signUpBusinessValidation } = require("./validation");
const { url } = require("inspector");
const { text } = require("express");
const { type } = require("os");

// Auth With Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile"],
  })
);

//Callback Route For Google
router.get("/google/redirect", (req, res) => {
  console.log("here");
});

// Nodemailer Transporter
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: SENDGRID_API,
    },
  })
);

// Generate QR Code
const generateQR = async (text, filename) => {
  try {
    await QRCode.toString(text, {type:"utf8"})
    await QRCode.toFile("images/" + filename + ".png", text, {width:500})
  } catch (err) {
    console.error(err)
  }
}


// @route POST api/customers
// @desc Login Customer
// @access public
router.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    // Email and Password are present in body
    return res.status(400).send({
      message: "Body Empty.",
      data: null,
    });
  }

  // Check Email Association
  Customer.findOne({ email: req.body.email }, (err, data) => {
    if (data) {
      bcrypt
        .compare(req.body.password, data.password)
        .then((matchedPassword) => {
          // // Finding The Customer Credentials Inside Database
          // Customer.findOne({ email: req.body.email, password: req.body.password }, (err, data) => {
          //     if (err) {
          //         res.status(400).send({ status: 0, message: err });
          //     }
          // })
          // .then((data) => {
          // validation of credentials
          const { error } = logInValidation(req.body);
          if (matchedPassword == true) {
            jwt.sign(
              { data },
              "secretkey",
              { expiresIn: "1h" },
              (err, token) => {
                return res.send({
                  id: data.id,
                  status: 1,
                  first_name: data.first_name,
                  last_name: data.last_name,
                  username: data.username,
                  email: data.email,
                  contact: data.contact,
                  referral: data.referral_code,
                  message: "Logged In",
                  token,
                });
              }
            );
          } else {
            res.status(400).send({ status: 0, message: "Incorrect Password." });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      Business.findOne({ email: req.body.email }, (err, data) => {
        const userInfo = data
        if (data) {
          bcrypt
            .compare(req.body.password, data.password)
            // Business.findOne({ email: req.body.email, password: req.body.password }, (err, data) => {
            //     if (err) {
            //         res.send({ status: 0, message: err });
            //     }
            // })
            .then((data) => {
              if (data == true) {
                jwt.sign(
                  { data },
                  "secretkey",
                  { expiresIn: "1h" },
                  (err, token) => {
                    return res.json({
                      id: userInfo.id,
                      status: 2,
                      title: userInfo.title,
                      message: "Logged In",
                      email: userInfo.email,
                      username: userInfo.username,
                      contact: userInfo.contact,
                      designation: userInfo.designation,
                      token,
                    });
                  }
                );
              } else {
                res
                  .status(400)
                  .send({ status: 0, message: "Incorrect Password." });
              }
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          res.status(400).send({
            status: 0,
            message: "Email is not associated with any account.",
          });
        }
      });
    }
  });
});

// @route POST api/customers
// @desc Sign-Up Customer
// @access public
router.post("/signup", (req, res) => {
  // checking if email and password exist in the input
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({
      status: 0,
      message: "Body Has Missing Fields.",
      data: null,
    });
  }

  if (req.body.customer) {
    Customer.findOne({ email: req.body.email }, async (err, data) => {
      if (data) {
        res.status(400).send({
          status: 0,
          message: "This email is already associated with an account.",
        });
      } else {
        // validation of credentials
        const { error } = signUpCustomerValidation(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        bcrypt
          .hash(req.body.password, 12)
          // if valid then create customer
          .then((passwordHash) => {
            const newCustomer = new Customer({
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              username: req.body.username,
              email: req.body.email,
              password: passwordHash,
              gender: req.body.gender,
              contact: req.body.contact,
              dob: req.body.dob,
            });
          });
        res.json({ status: true, message: "Customer has been created" });
        newCustomer.save();
      }
    }).catch((err) => res.send({ message: "Customer not created" }));
  } else {
    Business.findOne({ email: req.body.email }, async (err, data) => {
      if (data) {
        res.status(400).send({
          data,
          status: 0,
          message: "This email is already associated with an account.",
        });
      } else {
        // validation of credentials
        const { error } = signUpBusinessValidation(req.body);
        if (error) return res.status(400).send(error.details[0].message)
        qrc = generateQR(req.body.username, req.body.username).toString()
        bcrypt
          .hash(req.body.password, 12)
          // if valid then create business
          .then((passwordHash) => {
            const newBusiness = new Business({
              title: req.body.title,
              email: req.body.email,
              password: passwordHash,
              username: req.body.username,
              contact: req.body.contact,
              designation: req.body.designation,
              qr_code: qrc
              
            });
            res.json({ status: true, message: "Business has been created" });
            newBusiness.save();
          })
          .catch((err) => res.send({ message: "Business not created" }));
      }
    });
  }
});

router.post("/reset-password", (req, res) => {
  // crypto.randomBytes(32, (err, buffer) => {
  //   if (err) {
  //     console.log(err);
  //   }
  //   const token = buffer.toString("hex");
  const token = Math.floor(1000 + Math.random() * 9000).toString();
  Customer.findOne({ email: req.body.email }, (err, data) => {
    if (data) {
      Customer.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
          return res
            .status(422)
            .json({ error: "User doesn't exist with that email" });
        }
        user.resetToken = token;
        user.expireToken = Date.now() + 3600000;
        user.save().then((result) => {
          transporter.sendMail({
            to: user.email,
            from: "refereedevtest@gmail.com",
            subject: "password reset",
            html: `
                                <p>You requested for password reset. Use the code given below to proceed.</p>
                                <h5>Your password reset code is: ${token}.</h5>
                                `,
          });
          res.json({ status: true, message: "check your email" });
        });
      });
    } else {
      Business.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
          return res
            .status(422)
            .json({ error: "User doesn't exist with that email" });
        }
        user.resetToken = token;
        user.expireToken = Date.now() + 3600000;
        user.save().then((result) => {
          transporter.sendMail({
            to: user.email,
            from: "refereedevtest@gmail.com",
            subject: "password reset",
            html: `
                                <p>You requested for password reset</p>
                                <h5>Your password reset code is: ${token}.</h5>
                                `,
          });
          res.json({ status: true, message: "check your email" });
        });
      });
    }
  });
});

router.post("/check-token", (req, res) => {
  const sentToken = req.body.token;
  Customer.findOne({ email: req.body.email }, (err, data) => {
    if (data) {
      Customer.findOne({
        resetToken: sentToken,
        expireToken: { $gt: Date.now() },
      })
        .then(() => {
          res.json({ status: true, message: "Token is verified!" });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      Business.findOne({
        resetToken: sentToken,
        expireToken: { $gt: Date.now() },
      })
        .then(() => {
          res.json({ status: true, message: "Token is verified!" });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
});

router.post("/new-password", async (req, res) => {
  const newPassword = req.body.password;
  Customer.findOne({ email: req.body.email }, (err, user) => {
    if (user) {
      bcrypt.hash(newPassword, 12).then((hashedpassword) => {
        user.password = hashedpassword;
        user.resetToken = undefined;
        user.expireToken = undefined;
        user.save().then((saveduser) => {
          res.json({ status: true, message: "password updated success" });
        });
      });
    } else {
      Business.findOne({ email: req.body.email }, (err, user) => {
        if (user) {
          bcrypt.hash(newPassword, 12).then((hashedpassword) => {
            user.password = hashedpassword;
            user.resetToken = undefined;
            user.expireToken = undefined;
            user.save().then((saveduser) => {
              res.json({ status: true, message: "password updated success" });
            });
          });
        }
      });
    }
  });
});


// Generate QR-Code
router.post("/generate-qrcode", (req, res) => {
  Business.findOne({email:req.body.email}, (err, user) =>{
    console.log(user.qr_code)
  })

  // Business.findOne({email:req.body.email}, (err, user) =>{
  //    user.qr_code = QRCode.toDataURL(user.id)
// const generateQR = async text => {
//   try {
//     // console.log(await (await QRCode.toString(text)))
//     console.log(await QRCode.toDataURL(text))
//   } catch (err) {
//     console.error(err)
//   }
// }



const scanQR = async text => {
  try {
    console.log(await QRCode.toString(text, {type:"utf8"}))
  } catch (err) {
    console.error(err)
  }
}

generateQR("http://www.yahoo.com")
// scanQR("http://www.yahoo.com")
  
})

  ///// FOR GENERATING QR IMAGE
  // QRCode.toDataURL(text)
  // .then((url)=>{
  //   setImageUrl(url);
  // })
  

//   QRCode.toDataURL("I am a pony!")
//   .then((url) => {
//     console.log(url);
//   })
//   .catch((err) => {
//     console.error(err);
//   });
// });


module.exports = router;
