const { date } = require("joi");
const Joi = require("joi");


// Sign Up Business
const signUpBusinessValidation = (data) => {
  const schema = Joi.object({
      customer: Joi.boolean().required(),
      title: Joi.string().required(),
      email: Joi.string().email({tlds:{allow:false}}).required(),
      password: Joi.required(),
      username: Joi.string().required(),
      contact: Joi.number().min(10).required(),
      designation: Joi.string()
  })
  return schema.validate(data);
}

// Sign Up Customer
const signUpCustomerValidation = (data) => {
    const schema = Joi.object({
      customer: Joi.boolean().required(),
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        username: Joi.string().required(),
        email: Joi.string().email({tlds:{allow:false}}).required(),
        password: Joi.string().min(6).max(24).required(),
        gender: Joi.string().required(),
        contact: Joi.number().min(10).required(),
        dob: Joi.date()
    })
    return schema.validate(data);
}

// Login Customer & Business
const logInValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email({tlds:{allow:false}}).required(),
        password: Joi.string().min(6).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    })
    return schema.validate(data);
}

// @MANAGE OFFERS
// Add offer
const addOfferValidation = (data) => {
  const schema = Joi.object({
    business_id: Joi.string().required(),
    campaign_name: Joi.string().min(6).required(),
    headline: Joi.string().min(6).required(),
    commission_based: Joi.boolean().required(),
    commission_value: Joi.number(),
    target_transaction: Joi.number().min(5).required(),
    description: Joi.string().min(10).max(50),
  });
  return schema.validate(data);
};

// Edit Offer
const editOfferValidation = (data) => {
  const schema = Joi.object({
    campaign_name: Joi.string().min(6).required(),
    headline: Joi.string().min(6).required(),
    commission_value: Joi.number().min(1).max(50),
    description: Joi.string().min(10).max(160),
  });
  return schema.validate(data);
};



module.exports.signUpBusinessValidation = signUpBusinessValidation;
module.exports.signUpCustomerValidation = signUpCustomerValidation;
module.exports.logInValidation = logInValidation;
module.exports.addOfferValidation = addOfferValidation;
module.exports.editOfferValidation = editOfferValidation;
