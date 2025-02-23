const { Router } = require('express');
const { userModel, courseModel, purchaseModel } = require('../db')
const { userAuth, jwt } = require('../middlewares/auth');
const { JWT_USER_SECRET } = require('../config');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const userRouter = Router()

userRouter.post('/signup',async function(req, res) {
    const { email, password, firstName, lastName } = req.body;

    const requiredObj = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string().min(3).max(100),
        firstName: z.string(),
        lastName: z.string()
    })

    const parsedDataWithSuccess = requiredObj.safeParse(req.body);

    if(!parsedDataWithSuccess.success){
        res.json({
            message: "Invalid Format",
            error: parsedDataWithSuccess.error
        })
    }

     const hasedPassword = await bcrypt.hash(password, 10);

   await userModel.create({
    email:email,
    password: hasedPassword,
    firstName: firstName,
    lastName: lastName
   })

   res.json({
    message: "You are signed up"
})

})

userRouter.post('/signin',async function(req, res) {
    const { email, password } = req.body;

    const response = await userModel.findOne({
        email: email
    });

    const matchedPassword =await bcrypt.compare(password, response.password)

    if(matchedPassword && response){
        const token = jwt.sign({
            id: response._id.toString()
        }, JWT_USER_SECRET)

        res.json({
            token: token
        })
    } else{
        res.status(403).json({
            message: "Incorrect Credentials"
        })
    }
})

userRouter.get('/purchases',userAuth, async function(req, res) {
    const userId = req.userId;

    const purchases = await purchaseModel.find({
        userId,
    });

    let purchasedCourseIds = [];

    for (let i = 0; i < purchases.length; i++){ 
        purchasedCourseIds.push(purchases[i].courseId)
    }

    const coursesData = await courseModel.find({
        _id: { $in: purchasedCourseIds }
    })

    res.json({
        purchases,
        coursesData
    })
})

module.exports = {
    userRouter: userRouter
}