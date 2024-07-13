const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler( async (req, res, next) => {
    let token;
    let authHeader = req.headers.authorization || req.headers.Authorization;
    token = authHeader?.split(" ")[1];
    if (authHeader?.slice(" ")?.startsWith("Bearer")) {
        const decode = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
        if (!decode) {
            res.status(401);
            throw new Error("user is not autherized");
        }
        req.user = await User.findById(decode?.id);
        next();
    }
    if (!token) {
        res.status(401);
        throw new Error("user.request.missing_token")
    }
});

const isAdmin = asyncHandler( async (req, res, next) => {
    const { email } = req.user
    const admin = await User.findOne({email})
    if (admin.role !== "admin") {
        throw new Error("user.permission.failed")
    }
    next();
})

module.exports = { validateToken, isAdmin };