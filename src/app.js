const express = require("express");
const app = express();
require("./utils/db"); //this is to connect to the DB
const cookieParser = require("cookie-parser");

app.use(express.json()); // need for body parser later
//app.use(cookieParser()); // for parsing of cookies
app.use(cookieParser("someSecretKey")); // for parsing of cookies

const companyRouter = require("./routes/companies.route");
const userRouter = require("./routes/users.route");

app.use("/companies", companyRouter);
app.use("/user", userRouter);

app.get("/", (req, res) => {
  //main page
  res.status(200).json({
    "0": "GET /",
    "1": "GET /companies",
    "2": "GET /companies/:id",
    "3": "POST /companies/:id/reviews",
    "4": "GET /user",
    "5": "POST /user/register",
    "6": "POST /user/login",
    "7": "POST /user/logout",
  });
});

app.use((err, req, res, next) => {
  //res.status(err.statusCode || 500);
  //console.log(err.message);
  res.status(err.statusCode).json({ error: err.message });
});

module.exports = app;
