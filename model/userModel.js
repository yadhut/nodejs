const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto =  require("crypto");

const userSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "user"
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    cart: {
        type: Array,
        default: []
    },
    refreshToken: {
        type: String
    },
    address: { type: mongoose.Types.ObjectId, ref: "Address" },
    wishlist: { type: mongoose.Types.ObjectId, ref: "Product" },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpire: {
        type: Date
    },
},{
    timestamps: true
});

userSchema.pre("save", async function (next) {

    if (!this.isModified("password")){
        next();
    }

    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.isPasswordMatched = async function (inputPassword) {
    return await bcrypt.compare(inputPassword, this.password);
};

userSchema.methods.createPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpire = Date.now() + 30 * 60 * 1000
    return resetToken;
}

module.exports = mongoose.model("User",userSchema);