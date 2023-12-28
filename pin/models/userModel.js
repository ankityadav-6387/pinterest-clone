const mongoose = require('mongoose')
const plm = require('passport-local-mongoose');

const userModel = mongoose.Schema({
    username: String,
    name:String,
    email: String,
    password: String,
    dp:String,
   
    resetOTP:Number,
    posts:[
        {
           type:mongoose.Schema.Types.ObjectId,
           ref:"post"
        }
    ]
})

userModel.plugin(plm);


module.exports = mongoose.model('user', userModel)