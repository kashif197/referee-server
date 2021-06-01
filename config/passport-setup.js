const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const keys = require('./keys')
const Business = require("../models/Business");


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(e => {
            done(new Error("Failed to deserialize an user"));
        });
});

passport.use(new GoogleStrategy({
    // Strategy Options
    callbackURL: '/user/google/redirect',
    clientID: '285468949208-i5ssol0scqap2j48q91rtb6a8allbqrj.apps.googleusercontent.com',
    clientSecret: 'pZ9t99LPWV8e1lMUqi_R4ZtO'
}, async (accessToken, refreshToken, profile, done) => {
    // Passport Callback Function
    // console.log(profile._json.email)
    const user = await Business.findOne({ email: profile._json.email })

    if (!user) {
        console.log(req.body.email)
        // res.send({ email: false })
    }
    else {
        // res.send({ data, token })
        done(null, user)
    }


}))