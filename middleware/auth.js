const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ======================
// VERIFY TOKEN + GLOBAL USER (UI SUPPORT)
// ======================
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    // default = not logged in
    req.user = null;
    res.locals.user = null;

    if (!token) {
        return next(); // 👈 IMPORTANT: don't redirect (UI needs to change)
    }

    try {
        const decoded = jwt.verify(token, "secretkey123");

        // store user in request (backend use)
        req.user = decoded;

        // store user in views (frontend UI use)
        res.locals.user = decoded;

        next();

    } catch (err) {
        req.user = null;
        res.locals.user = null;
        next();
    }
};

// ======================
// ADMIN ONLY
// ======================
const isAdmin = (req, res, next) => {

    if (!req.user) {
        return res.redirect('/login');
    }

    if (req.user.role !== 'admin') {
        return res.status(403).send("Admins only");
    }

    next();
};

module.exports = { verifyToken, isAdmin };