const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

const app = express();

// Railway provides PORT automatically
const PORT = process.env.PORT || 3000;

// Handlebars setup
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'static')));

// Routes
app.use('/', require('./routes/blog'));

// Start server
app.listen(PORT, () => {
    console.log(`Blog app listening on port ${PORT}`);
});