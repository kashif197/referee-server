const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const keys = require('./keys')

passport.use(new GoogleStrategy({
    // Strategy Options
    callbackURL: '/user/google/redirect',
    clientID: '285468949208-i5ssol0scqap2j48q91rtb6a8allbqrj.apps.googleusercontent.com',
    clientSecret: 'pZ9t99LPWV8e1lMUqi_R4ZtO'
}, (accessToken, refreshToken, profile, done) => {
    // Passport Callback Function
}))