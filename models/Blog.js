const mongoose = require('mongoose');

// ======================
// REPLY SCHEMA
// ======================
const ReplySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userEmail: String,
    text: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ======================
// COMMENT SCHEMA
// ======================
const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userEmail: String,
    text: String,

    replies: [ReplySchema],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ======================
// BLOG SCHEMA
// ======================
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

    // likes counter
    likes: {
        type: Number,
        default: 0
    },

    // users who liked (prevents double like)
    likedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],

    // comments
    comments: [CommentSchema]
});

module.exports = mongoose.model('Blog', BlogSchema);