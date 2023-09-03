// const express = require("express");
const app = require("./app");
// const port = process.env.PORT || 3000;
const connectDB = require("./db/db");

// Połącz z bazą danych MongoDB
connectDB().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
