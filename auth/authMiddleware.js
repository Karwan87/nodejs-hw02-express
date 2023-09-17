const jwt = require("jsonwebtoken");
const { Unauthorized } = require("http-errors");
const config = require("../config");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Received token:", token);
  try {
    if (!token) {
      throw new Unauthorized("Not authorized");
    }
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Unauthorized("Not authorized");
    }
    req.user = user;
    next();
  } catch (error) {
    next(new Unauthorized("Not authorized"));
  }
};

module.exports = authMiddleware;
