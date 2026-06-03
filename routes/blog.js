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

        // ===== PAGINATION SETTINGS =====
        const page = parseInt(req.query.page) || 1;
        const limit = 5; // blogs per page
        const skip = (page - 1) * limit;

        // ===== FETCH BLOGS =====
        const blogs = await Blog.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // ===== TOTAL COUNT =====
        const totalBlogs = await Blog.countDocuments();
        const totalPages = Math.ceil(totalBlogs / limit);

        // ===== USER LIKE CHECK (SAFE) =====
        if (req.user) {
            blogs.forEach(blog => {
                blog.isLiked = blog.likedBy?.some(
                    id => id.toString() === req.user.id
                );
            });
        }

        // ===== RENDER =====
        res.render('bloghome', {
            blogs,
            user: req.user || null,

            // pagination data
            currentPage: page,
            totalPages
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

        res.json({
            success: true,
            userEmail: user.email,
            text: req.body.comment
        });

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
                return res.json({
                    success: false
                });
            }

            // Safety for old blog documents
            if (!Array.isArray(blog.likedBy)) {
                blog.likedBy = [];
            }

            const userId = req.user.id;

            const alreadyLiked = blog.likedBy.some(
                id => id.toString() === userId
            );

            if (alreadyLiked) {

                blog.likes = Math.max(0, blog.likes - 1);

                blog.likedBy = blog.likedBy.filter(
                    id => id.toString() !== userId
                );

            } else {

                blog.likes += 1;

                blog.likedBy.push(userId);

            }
            await blog.save();

            return res.json({
                success: true,
                likes: blog.likes,
                liked: !alreadyLiked
            });

        } catch (err) {

            console.log('LIKE ERROR:', err);

            return res.redirect('/blog');

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

            if (!blog) {
                return res.json({
                    success: false
                });
            }

            const comment = blog.comments.id(
                req.params.commentId
            );

            if (!comment) {
                return res.json({
                    success: false
                });
            }

            comment.replies.push({
                userEmail: user.email,
                text: req.body.reply
            });

            await blog.save();

            res.json({
                success: true,
                userEmail: user.email,
                text: req.body.reply
            });

        } catch (err) {

            console.log(err);

            res.json({
                success: false
            });

        }

    }
);
router.get('/profile', verifyToken, async (req, res) => {

    try {

        const user = await User.findById(req.user.id).lean();

        res.render('profile', {
            user
        });

    } catch (err) {

        console.log(err);
        res.send('Profile error');

    }

});

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
router.get('/admin/dashboard', verifyToken, isAdmin, async (req, res) => {
    try {

        const blogs = await Blog.find().sort({ createdAt: -1 }).lean();

        res.render('admin-dashboard', {
            user: req.user,
            blogs
        });

    } catch (err) {
        console.log(err);
        res.send("Admin dashboard error");
    }
});
router.get('/admin/edit/:id', verifyToken, isAdmin, async (req, res) => {
    try {

        const blog = await Blog.findById(req.params.id).lean();

        if (!blog) return res.send("Blog not found");

        res.render('admin-edit', {
            user: req.user,
            blog
        });

    } catch (err) {
        console.log(err);
        res.send("Edit page error");
    }
});router.post('/admin/edit/:id', verifyToken, isAdmin, async (req, res) => {
    try {

        const { title, content } = req.body;

        await Blog.findByIdAndUpdate(req.params.id, {
            title,
            content
        });

        res.redirect('/admin/dashboard');

    } catch (err) {
        console.log(err);
        res.send("Update failed");
    }
});
router.post('/admin/delete/:id', verifyToken, isAdmin, async (req, res) => {
    try {

        await Blog.findByIdAndDelete(req.params.id);

        res.redirect('/admin/dashboard');

    } catch (err) {
        console.log(err);
        res.send("Delete failed");
    }
});

module.exports = router;