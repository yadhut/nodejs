const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var BlogSchema = new mongoose.Schema({
    titile:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    description:{
        type:String,
        required:true,
        unique:true,
    },
    category:{
        type:String,
        required:true,
        unique:true,
    },
    numViews:{
        type:Number,
        default: 0,
    },
    isLiked: {
        type:Boolean,
        default: false
    },
    isDisliked: {
        type: Boolean,
        default: false
    },
    likes: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    DisLikes: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    image: {
        type: String,
        default: ""
    },
    auther: {
        type: String,
        default: "Admin"
    }
},
{
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
    timestamps: true
}
);

//Export the model
module.exports = mongoose.model('User', userSchema);