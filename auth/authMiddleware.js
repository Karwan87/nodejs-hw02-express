const jwt = require("jsonwebtoken");
const { Unauthorized } = require("http-errors");
const config = require("../config");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Received token:", token);
  try {
    if (!token) {
      throw new Unauthorized("Not authorized");
    }
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    next(new Unauthorized("Not authorized"));
  }
};

module.exports = authMiddleware;
