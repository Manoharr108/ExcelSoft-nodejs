const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./routes/router");
require("dotenv").config();

const port = process.env.PORT || 9000;

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use("/", router);

mongoose
  .connect(process.env.mongoDB)
  .then(() => {
    console.log("Successfully connected to DB!");
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Database connection error: ", err.message);
  });
