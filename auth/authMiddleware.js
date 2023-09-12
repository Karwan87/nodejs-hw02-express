const jwt = require("jsonwebtoken");
const { Unauthorized } = require("http-errors");
const config = require("../config");

const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new Unauthorized("Not authorized");
    }

    // Verify token using the secret key from config
    const decoded = jwt.verify(token, config.secretKey);

    // Save user's data in req.user
    req.user = decoded;

    // Continue to the next middleware
    next();
  } catch (error) {
    // If authorization failed, return Unauthorized error
    next(new Unauthorized("Not authorized"));
  }
};

module.exports = authMiddleware;
