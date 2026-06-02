const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
    userEmail: String,
    text: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const CommentSchema = new mongoose.Schema({
    userEmail: String,
    text: String,

    replies: [ReplySchema],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    likes: {
    type: Number,
    default: 0
},
    comments: [CommentSchema]
    
});


module.exports = mongoose.model('Blog', BlogSchema);