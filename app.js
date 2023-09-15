const mongoose = require("mongoose");
const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const contactsRouter = require("./routes/api/contacts");
const connectDB = require("./db/db");
const usersRouter = require("./routes/api/users");
const multer = require("multer");
const usersAvatarRouter = require("./routes/api/users");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

connectDB();

app.use(express.static("public"));
app.use(upload.single("avatar"));
app.use("/api/contacts", contactsRouter);
app.use("/api/users", usersRouter);
app.use("/api/users/avatars", usersAvatarRouter);

module.exports = app;
