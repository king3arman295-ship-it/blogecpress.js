const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send("Login required");
    }

    try {
        const decoded = jwt.verify(token, "secretkey123");
        req.user = decoded;
        next();
    } catch {
        return res.status(401).send("Invalid token");
    }
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).send("Admins only");
    }
    next();
};

module.exports = { verifyToken, isAdmin };