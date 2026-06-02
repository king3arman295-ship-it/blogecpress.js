const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB Connected');
    console.log('Database:', mongoose.connection.db.databaseName);
})
.catch((err) => {
    console.error('MongoDB Connection Error:', err);
});

// Handlebars Setup
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Static Files
app.use(express.static(path.join(__dirname, 'static')));

// Routes
app.use('/', require('./routes/Blog'));
app.use('/', require('./routes/auth'));

app.listen(PORT, () => {
    console.log(`Blog app listening on port ${PORT}`);
});