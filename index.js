const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const cors = require('cors')
const PassportSetup = require('./config/passport-setup')

// Adding Routes
const user = require('./routes/userRoutes')
const offer = require('./routes/offerRoutes')
const admin = require('./routes/adminRoutes')
const qrcode = require('./routes/qrcRoutes')

const app = express()

// Body Parser
app.use(express.json())

// CORS 
app.use(cors())

// Database Key
const db = require('./config/keys').mongoURI

// Connect Database
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() =>   console.log("Connection Successful"))
    .catch((err) => console.log(err))

// Using Routes
app.use('/user', user)
app.use('/offer', offer)
app.use('/admin', admin)
app.use('/qrcode', qrcode)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log('Server Running'))