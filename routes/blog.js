const express = require('express');
const path = require('path');
const blogs = require('../data/blogs');

const router = express.Router();

router.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, '../templates/index.html'));
    res.render('home')
});

router.get('/blog', (req, res) => {
      res.render('bloghome', {
        blogs:blogs
      })
    // res.sendFile(path.join(__dirname, '../templates/bloghome.html'));
});

router.get('/blogpost/:slug', (req, res) => {

    const myblog = blogs.filter(e => e.slug == req.params.slug);

    console.log(myblog);
       res.render('blogpage', {
        title:myblog[0].title,
        content:myblog[0].content,
      })
    // res.sendFile(path.join(__dirname, '../templates/blogpage.html'));
});

module.exports = router;