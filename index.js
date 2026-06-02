const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

// ✅ ADDED THIS (as you requested)
const { verifyToken } = require('./middleware/auth');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// DB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Handlebars
app.engine('handlebars', engine({
    helpers: {
        eq: (a, b) => a === b
    }
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ✅ ADDED HERE (after cookieParser as you said)
app.use(verifyToken);

// Static
app.use(express.static(path.join(__dirname, 'static')));

// Routes
app.use('/', require('./routes/blog'));
app.use('/', require('./routes/auth'));

// Start
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});