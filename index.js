require('dotenv').config()
const express = require('express');
const { userRouter } = require('./routes/user')
const { courseRouter } = require('./routes/course')
const { adminRouter } = require('./routes/admin');
const { default: mongoose } = require('mongoose');
const app = express();

app.use(express.json())

app.use('/user', userRouter)
app.use('/course', courseRouter) 
app.use('/admin', adminRouter) 

async function main(app) {
    await mongoose.connect(process.env.MONGO_URL);
    app.listen(2000)
    console.log("Port is listening on 2000")
}

main(app)