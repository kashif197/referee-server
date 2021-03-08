const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport')

// Import Model
const Customer = require("../models/Customer");
const Business = require("../models/Business");

// Importing Validations
const { logInValidation } = require('./validation');
const { signUpCustomerValidation } = require('./validation');
const { signUpBusinessValidation } = require('./validation');

// Auth With Google
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}))

//Callback Route For Google
router.get('/google/redirect', (req, res) => {
    console.log('here')
})


// @route POST api/customers
// @desc Login Customer
// @access public
router.post("/login", (req, res) => {
    if (!req.body.email || !req.body.password) { // Email and Password are present in body
        return res.status(400).send({
            message: "Body Empty.",
            data: null
        });
    }

    // Check Email Association
    Customer.findOne({ email: req.body.email }, (err, data) => {
        if (data) {
            // Finding The Customer Credentials Inside Database
            Customer.findOne({ email: req.body.email, password: req.body.password }, (err, data) => {
                if (err) {
                    res.status(400).send({ status: 0, message: err });
                }
            })
                .then((data) => {
                    // validation of credentials
                    const { error } = logInValidation(req.body);
                    if (error) return res.status(400).send(error.details[0].message);
                    return res.send({
                        id: data.id,
                        status: 1,
                        first_name: data.first_name,
                        message: "Logged In"
                    });
                })
                .catch((err) => {
                    console.log(err)
                });
        }
        else {
            Business.findOne({ email: req.body.email }, (err, data) => {
                if (data) {

                    Business.findOne({ email: req.body.email, password: req.body.password }, (err, data) => {
                        if (err) {
                            res.send({ status: 0, message: err });
                        }
                    })
                        .then((data) => {
                            if (data !== null) {
                                jwt.sign({ data }, 'secretkey', { expiresIn: '1h' }, (err, token) => {
                                    return res.json({
                                        id: data.id,
                                        status: 2,
                                        name: data.title,
                                        message: "Logged In",
                                        token
                                    });
                                });
                            }
                            else {
                                res.status(400).send({ status: 0, message: 'Incorrect Password.' })
                            }


                        })
                        .catch((err) => {
                            console.log(err)
                        });
                }
                else {

                    res.status(400).send({ status: 0, message: 'Email is not associated with any account.' })
                }
            })
        }
    })
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

        Customer.findOne({ email: req.body.email }, (err, data) => {
            if (data) {
                res.status(400).send({ status: 0, message: "This email is already associated with an account." })
            } else {
                // validation of credentials
                const { error } = signUpCustomerValidation(req.body);
                if (error) return res.status(400).send(error.details[0].message);
                // if valid then create customer
                const newCustomer = new Customer({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    gender: req.body.gender,
                    contact: req.body.contact,
                    dob: req.body.dob,
                });

                newCustomer.save().then((customer) => res.json({ status: true }))
                    .catch((err) => res.status(400).send({ status: false, message: 'This Username Is Already Taken.' }))
            }


        })
    } else {
        Business.findOne({ email: req.body.email }, (err, data) => {
            if (data) {
                res.status(400).send({ status: 0, message: "This email is already associated with an account." })
            } else {
                // validation of credentials
                const { error } = signUpBusinessValidation(req.body);
                if (error) return res.status(400).send(error.details[0].message);
                // if valid then create business
                const newBusiness = new Business({
                    title: req.body.title,
                    email: req.body.email,
                    password: req.body.password,
                    username: req.body.username,
                    contact: req.body.contact,
                    designation: req.body.designation,
                });

                newBusiness.save()
                    .then((business) => res.json({ status: true }))
                    .catch((err) => res.status(400).send({ status: false, message: 'This username is already taken.' }))
            }

        })
    }
});


module.exports = router;