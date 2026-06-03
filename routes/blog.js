const express = require('express');
const jwt = require('jsonwebtoken');

const Blog = require('../models/Blog');
const User = require('../models/User');

const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();


// ======================
// HOME
// ======================
router.get('/', (req, res) => {
    res.render('home', { user: req.user });
});


// ======================
// BLOG LIST
// ======================
router.get('/blog', async (req, res) => {
    try {
        const blogs = await Blog.find().lean();

        if (req.user) {

            blogs.forEach(blog => {

                blog.isLiked = blog.likedBy?.some(
                    id => id.toString() === req.user.id
                );

            });

        }

        res.render('bloghome', {
            blogs,
            user: req.user || null
        });

    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});


// ======================
// SINGLE BLOG PAGE
// ======================
router.get('/blogpost/:slug', async (req, res) => {
    try {

        const blog = await Blog.findOne({ slug: req.params.slug }).lean();

        if (!blog) return res.send("Blog not found");

        res.render('blogpage', {
            title: blog.title,
            content: blog.content,
            slug: blog.slug,
            comments: blog.comments || [],
            user: req.user || null
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});


// ======================
// ADD COMMENT (FIXED)
// ======================
router.post('/blogpost/:slug/comment', verifyToken, async (req, res) => {
    try {

        const user = await User.findById(req.user.id);

        if (!user) return res.redirect('/login');

        const blog = await Blog.findOne({ slug: req.params.slug });

        if (!blog) return res.send("Blog not found");

        blog.comments.push({
            userEmail: user.email,
            text: req.body.comment
        });

        await blog.save();

        res.redirect(`/blogpost/${req.params.slug}`);

    } catch (err) {
        console.log(err);
        res.send("Error posting comment");
    }
});


// ======================
// ADMIN PAGE
// ======================
router.get('/admin', verifyToken, isAdmin, (req, res) => {
    res.render('admin', { user: req.user });
});

router.post(
    '/blogpost/:slug/like',
    verifyToken,
    async (req, res) => {

        try {

            const blog = await Blog.findOne({
                slug: req.params.slug
            });

            if (!blog) {
                return res.send('Blog not found');
            }

            if (!blog.likedBy) {
                blog.likedBy = [];
            }

            const userId = req.user.id;

            const likedIndex = blog.likedBy.findIndex(
                id => id.toString() === userId
            );

            if (likedIndex === -1) {

                // LIKE
                blog.likes += 1;
                blog.likedBy.push(userId);

            } else {

                // UNLIKE
                blog.likes = Math.max(0, blog.likes - 1);
                blog.likedBy.splice(likedIndex, 1);

            }

            await blog.save();

            res.redirect('/blog');

        } catch (err) {

            console.log(err);
            res.send('Like failed');

        }

    }
);
router.post(
    '/blogpost/:slug/reply/:commentId',
    verifyToken,
    async (req, res) => {

        try {

            const user = await User.findById(
                req.user.id
            );

            const blog = await Blog.findOne({
                slug: req.params.slug
            });

            const comment = blog.comments.id(
                req.params.commentId
            );

            comment.replies.push({
                userEmail: user.email,
                text: req.body.reply
            });

            await blog.save();

            res.redirect(
                `/blogpost/${req.params.slug}`
            );

        } catch (err) {

            console.log(err);
            res.send('Reply failed');

        }

    }
);

// ======================
// ADD BLOG
// ======================
router.post('/admin/add-blog', verifyToken, isAdmin, async (req, res) => {
    try {

        const { title, slug, content } = req.body;

        await Blog.create({
            title,
            slug,
            content,
            comments: []
        });

        res.redirect('/blog');

    } catch (err) {
        console.log(err);
        res.send("Error creating blog");
    }
});

module.exports = router;