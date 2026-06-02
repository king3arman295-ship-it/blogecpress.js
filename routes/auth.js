const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();


// =========================
// SHOW LOGIN PAGE
// =========================
router.get('/login', (req, res) => {
    res.render('login');
});


// =========================
// SHOW REGISTER PAGE
// =========================
router.get('/register', (req, res) => {
    res.render('register');
});


// =========================
// REGISTER
// =========================
router.post('/register', async (req, res) => {
    try {

        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.send('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            email,
            password: hashedPassword,
            role: 'user'
        });

        res.redirect('/login');

    } catch (err) {

        console.log(err);
        res.send('Registration failed');

    }
});


// =========================
// LOGIN
// =========================
router.post('/login', async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.send('User not found');
        }

        const match = await bcrypt.compare(
            password,
            user.password
        );

        if (!match) {
            return res.send('Wrong password');
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            'secretkey123',
            {
                expiresIn: '1h'
            }
        );

        res.cookie('token', token, {
            httpOnly: true
        });

        if (user.role === 'admin') {
    return res.redirect('/admin-dashboard');
}

res.redirect('/dashboard');

    } catch (err) {

        console.log(err);
        res.send('Login failed');

    }
});


// =========================
// DASHBOARD
// =========================
router.get('/dashboard', async (req, res) => {

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
        ).lean();

        if (!user) {
            return res.redirect('/login');
        }

        res.render('dashboard', {
            email: user.email,
            role: user.role
        });

    } catch (err) {

        console.log(err);
        res.redirect('/login');

    }

});

router.get('/admin-dashboard', async (req, res) => {
    try {

        const token = req.cookies.token;

        if (!token) {
            return res.redirect('/login');
        }

        const decoded = jwt.verify(
            token,
            'secretkey123'
        );

        const user = await User.findById(decoded.id);

        if (!user || user.role !== 'admin') {
            return res.send('Access Denied');
        }

        res.render('admin-dashboard', {
            email: user.email
        });

    } catch (err) {
        res.redirect('/login');
    }
});

// =========================
// LOGOUT
// =========================
router.get('/logout', (req, res) => {

    res.clearCookie('token');
    res.redirect('/');

});

module.exports = router;