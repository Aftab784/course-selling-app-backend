const jwt = require("jsonwebtoken");
const { JWT_USER_SECRET, JWT_ADMIN_SECRET } = require('../config')

function userAuth(req, res, next) {
    const token = req.headers.token;

    const response = jwt.verify(token, JWT_USER_SECRET);

    if (response) {
        req.userId = response.id;
        next();
    } else {
        res.status(403).json({
            message: "Incorrect creds"
        })
    }
}

function adminAuth(req, res, next) {
    const token = req.headers.token;

    const response = jwt.verify(token, JWT_ADMIN_SECRET);

    if (response) {
        req.userId = response.id;
        next();
    } else {
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }
}

module.exports = {
    jwt,
    userAuth,
    adminAuth
}
