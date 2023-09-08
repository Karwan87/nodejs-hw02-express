const app = require("./app");
const connectDB = require("./db/db");

connectDB().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
