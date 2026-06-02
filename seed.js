require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('./models/Blog');

mongoose.connect(process.env.MONGO_URI)
.then(async () => {

await Blog.create({
    title: 'How to Get Started with JavaScript',
    content: 'JavaScript is used for web development.',
    slug: 'js-learn'
});
    console.log('Blog Added Successfully');

    process.exit();
})
.catch(err => console.log(err));