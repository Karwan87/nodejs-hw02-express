const mongoose = require("mongoose");
const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const contactsRouter = require("./routes/api/contacts");
const connectDB = require("./db/db");

const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

// Połącz z bazą danych MongoDB
connectDB();

app.use("/api/contacts", contactsRouter);

module.exports = app;
