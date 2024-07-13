const User = require("../model/userModel");
const generateJwt = require("../config/jwt");
const mongoose =  require("mongoose");
const isValidId = require("../utils/validateMongooseId");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const generateRefreshToken = require("../config/refreshToken");
const sendEmail = require("./emailController");

const createUser = asyncHandler(async (req, res) => {
    const { email, firstname, lastname, phone, password} = req.body;
    if (!email || !firstname || !lastname || !password) {
        res.status(400);
        throw new Error("user.register.missing_field")
    }
    let user = await User.findOne({email});
    if (!user) {
        user = await User.create(req.body);
        res.status(201).json(user);
    } else {
        res.status(400);
        throw new Error("user.register.already_exist");
    }
});

const userLogin = asyncHandler( async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("user.login.required_fields.missing");
    }
    const user = await User.findOne({email});
    if (user && await user.isPasswordMatched(password)) {
        const refreshToken = generateRefreshToken(user._id);
        const updatedUser = await User.findByIdAndUpdate(user._id, { refreshToken }, { new: true });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000
        });
        res.json({
            _id: user?._id,
            firstname: user?.firstname,
            lastname: user?.lastname,
            email: user?.email,
            phone_number: user?.phone_number,
            token: generateJwt(user?._id)
        });
    } else {
        res.status(401);
        throw new Error("Email or Password is wrong")
    }
});

const allUsers = asyncHandler(async (req, res) => {
    const users = await User.find();
    if (users) {
        res.status(200);
        res.json(users);
    }
});

const singleUser = asyncHandler( async (req, res) => {
    
    isValidId(req.params.id);

    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(400)
        throw new Error("user.invalid.id");
    } else {
        res.status(200);
        res.json(user);
    }
});

const updateUser = asyncHandler( async (req, res) => {
    const { firstname, lastname, email, phone_number, role} = req.body

    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(400);
        throw new Error("user not found");
    };

    const newUser = await User.findByIdAndUpdate(
        user.id,
        { firstname, lastname, email, phone_number, role},
        { new: true }
    );
    res.status(200).json(newUser);
});

const deleteUser = asyncHandler( async (req, res) => {
    
    isValidId(req.params.id);

    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
        res.status(200);
        res.json(user);
    } else {
        throw new Error("user.invalid.id");
    }
})

const blockUser = asyncHandler( async (req, res) => {
    isValidId(req.params.id);
    const isBlocked = req.body;

    const isAnAdmin = req.user.role === "admin"
    if (!isAnAdmin) {
        res.status(400);
        throw new Error("user.permission.denied");
    }
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(400);
        throw new Error("admin.user.not_found");
    }

    const updatedUser = await User.findByIdAndUpdate(user.id, isBlocked)
    res.status(202);
    res.json(updatedUser);

});

const refreshTokenHander = asyncHandler( async (req, res) => {
    const cookie = req.cookies;
    if (!cookie || cookie?.refreshToken) {
        throw new Error("user.request.cookies.notFound");
    }
    const refreshToken = cookie.refreshToken;
    console.log("cookiesss", cookie);
    const user = User.findOne({ refreshToken })
    console.log(user);
    jwt.verify(refreshToken, process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
        if (err || user._id !== decoded.id) {
            throw new Error("user.refreshToken.invalid");
        }
        const accessToken = generateJwt(user?._id);
        res.json(accessToken);
    });
});

const logout = asyncHandler( async (req, res) => {
    const cookie = req.cookies;
    if (! cookie?.refreshToken) throw new Error("user.cookies.not_found");
    const refreshToken = cookie?.refreshToken;
    const user =  await User.findOne( {refreshToken} );
    if (!user) {
        res.clearCookie('refreshToken', { httpOnly: true, secure: true});
        res.status(204);
    }
    await User.findByIdAndUpdate(user._id, {refreshToken: ""});
    res.clearCookie('refreshToken', { httpOnly: true, secure: true});
    res.status(204);
});

const updatePassword = asyncHandler( async (req, res) => {
    const { _id } = req.user;
    const { newPassword, repeatedPassword, oldPassword } = req.body;
    if (!newPassword || !repeatedPassword || !oldPassword ) {
        throw new Error("user.empty.fields");
    }
    isValidId(_id);
    const user = await User.findById(_id);
    if (! await user.isPasswordMatched(oldPassword)) {
        throw new Error("user.invalid.password")
    }
    if (newPassword) {
        user.password = newPassword;
        await user.save().then(result => {
            res.status(200);
            res.json(user);
        })
    }
});

const forgotPasswordToken = asyncHandler( async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne( {email} );
    if (!user){
        throw new Error("user.invalid.email");
    }
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetUrl = `Hi click here to reset your password, valid for 10 min only <a href='http://localhost:5001/api/user/forgot-password'>Click Here</a>`

    const data = {
        to: user.email,
        subject: "Forgot Password",
        text: "Click the link below to reset your password",
        html: resetUrl
    }
    sendEmail(data);
    res.status(200);
    res.json(`We have send you password reset link on your email ${user.email.slice(0, 3)}***${user.email.slice(-10, -1)} and hash ${token}`);
});

const resetPassword = asyncHandler( async (req, res) => {
    const { password } = req.body;
    const{ token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne( {
        passwordResetToken: hashedToken,
        passwordResetExpire: { $gt: Date.now()}
    })

    if (!user) throw new Error("Token expired or invalid token");

    user.password = password;
    passwordResetToken: undefined;
    passwordResetExpire: undefined;
    await user.save();

    res.json(user);
})

module.exports = { createUser, userLogin, allUsers, singleUser, updateUser, deleteUser, blockUser, refreshTokenHander, logout, updatePassword, forgotPasswordToken, resetPassword}