const express = require('express');
const jwt = require('jsonwebtoken');

const Blog = require('../models/blog');
const User = require('../models/User');

const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();


// HOME
router.get('/', (req, res) => {
    res.render('home');
});


// BLOG LIST
router.get('/blog', async (req, res) => {
    try {

        const blogs = await Blog.find().lean();

        res.render('bloghome', {
            blogs
        });

    } catch (err) {

        console.log(err);
        res.status(500).send('Server Error');

    }
});


// SINGLE BLOG
router.get('/blogpost/:slug', async (req, res) => {
    try {

        const blog = await Blog.findOne({
            slug: req.params.slug
        }).lean();

        if (!blog) {
            return res.send('Blog not found');
        }

        res.render('blogpage', {
            title: blog.title,
            content: blog.content,
            slug: blog.slug,
            comments: blog.comments
        });

    } catch (err) {

        console.log(err);
        res.status(500).send('Server Error');

    }
});


// ADD COMMENT
router.post('/blogpost/:slug/comment', async (req, res) => {
    try {

        const token = req.cookies.token;

        if (!token) {
            return res.redirect('/login');
        }

        const decoded = jwt.verify(
            token,
            'secretkey123'
        );

        const user = await User.findById(
            decoded.id
        );

        if (!user) {
            return res.redirect('/login');
        }

        const blog = await Blog.findOne({
            slug: req.params.slug
        });

        if (!blog) {
            return res.send('Blog not found');
        }

        blog.comments.push({
            userEmail: user.email,
            text: req.body.comment
        });

        await blog.save();

        res.redirect(
            `/blogpost/${req.params.slug}`
        );

    } catch (err) {

        console.log(err);
        res.send('Error posting comment');

    }
});


// ADMIN PAGE
router.get(
    '/admin',
    verifyToken,
    isAdmin,
    (req, res) => {

        res.render('admin');

    }
);


// ADD BLOG
router.post(
    '/admin/add-blog',
    verifyToken,
    isAdmin,
    async (req, res) => {

        try {

            const {
                title,
                slug,
                content
            } = req.body;

            await Blog.create({
                title,
                slug,
                content
            });

            res.redirect('/blog');

        } catch (err) {

            console.log(err);
            res.send('Error creating blog');

        }
    }
);

module.exports = router;