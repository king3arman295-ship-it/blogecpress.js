const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// =========================
// REGISTER PAGE
// =========================
router.get('/register', (req, res) => {
    res.render('register');
});

// =========================
// LOGIN PAGE
// =========================
router.get('/login', (req, res) => {
    res.render('login');
});

// =========================
// REGISTER (ONLY USER ROLE)
// =========================
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.send("User already exists");

        const hashed = await bcrypt.hash(password, 10);

        await User.create({
            email,
            password: hashed,
            role: 'user'
        });

        res.redirect('/login');

    } catch (err) {
        console.log(err);
        res.send("Registration failed");
    }
});

// =========================
// LOGIN
// =========================
router.post('/login', async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.send("User not found");

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.send("Wrong password");

        const token = jwt.sign(
            { id: user._id, role: user.role },
            "secretkey123",
            { expiresIn: "1h" }
        );

        res.cookie("token", token, { httpOnly: true });

        // ROLE ROUTING
        if (user.role === "admin") {
            return res.redirect("/admin-dashboard");
        }

        return res.redirect("/dashboard");

    } catch (err) {
        console.log(err);
        res.send("Login failed");
    }
});

// =========================
// USER DASHBOARD
// =========================
router.get('/dashboard', async (req, res) => {
    try {

        const token = req.cookies.token;
        if (!token) return res.redirect('/login');

        const decoded = jwt.verify(token, "secretkey123");

        const user = await User.findById(decoded.id).lean();
        if (!user) return res.redirect('/login');

        res.render('dashboard', { user });

    } catch (err) {
        console.log(err);
        res.redirect('/login');
    }
});

// =========================
// ADMIN DASHBOARD
// =========================
router.get('/admin-dashboard', async (req, res) => {
    try {

        const token = req.cookies.token;
        if (!token) return res.redirect('/login');

        const decoded = jwt.verify(token, "secretkey123");

        const user = await User.findById(decoded.id).lean();

        if (!user || user.role !== "admin") {
            return res.status(403).send("Access Denied");
        }

        res.render('admin-dashboard', { user });

    } catch (err) {
        console.log(err);
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