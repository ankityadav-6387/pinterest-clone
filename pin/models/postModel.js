const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    image:String,
    title:String,
    description:String,
    user:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
    
})

module.exports = mongoose.model('post',postSchema);