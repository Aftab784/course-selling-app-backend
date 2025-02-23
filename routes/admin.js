const { Router } =require('express');
const { adminModel, courseModel }= require('../db')
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const adminRouter = Router();
const { adminAuth, jwt } = require('../middlewares/auth');
const { JWT_ADMIN_SECRET } = require('../config');

adminRouter.post('/signup',async function(req, res) {
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

   await adminModel.create({
    email:email,
    password: hasedPassword,
    firstName: firstName,
    lastName: lastName
   })

   res.json({
    message: "You are signed up"
})

})

adminRouter.post('/signin',async function(req, res) {
    const { email, password } = req.body;

    const response = await adminModel.findOne({
        email: email
    });

    const matchedPassword =await bcrypt.compare(password, response.password)

    if(matchedPassword && response){
        const token = jwt.sign({
            id: response._id.toString()
        }, JWT_ADMIN_SECRET)

        res.json({
            token: token
        })
    } else{
        res.status(403).json({
            message: "Incorrect Credentials"
        })
    }
})

adminRouter.post('/course', adminAuth, async function(req, res) {
    const adminId = req.userId;

    const { title, description, imageUrl, price } = req.body;

    // creating a web3 saas in 6 hours
    const course = await courseModel.create({
        title: title, 
        description: description, 
        imageUrl: imageUrl, 
        price: price, 
        creatorId: adminId
    })

    res.json({
        message: "Course created",
        courseId: course._id
    })

})

adminRouter.put('/course',adminAuth,async function(req, res) {
    const adminId = req.userId;

    const { title, description, price, imageUrl, courseId } = req.body;

    const course = await courseModel.updateOne({
        _id: courseId,
        creatorId: adminId
    },
    {
        title: title,
        description: description,
        price: price,
        imageUrl: imageUrl
    })

    res.json({
        message: "Course updated",
        courseId: course._id
    })
})

adminRouter.get('/course/bulk',adminAuth, async function(req, res) {
    const adminId = req.userId;

    const courses = await courseModel.find({
        creatorId: adminId 
    });
    console.log(courses)

    res.json({
        message: "Course updated",
        courses: courses
    })
})

module.exports= {
    adminRouter: adminRouter
}