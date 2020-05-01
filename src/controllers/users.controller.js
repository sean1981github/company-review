const UserModel = require("../models/users.model");
const wrapAsync = require("../utils/wrapAsync");
const { createJWTToken } = require("../utils/jwt");
const { uuid } = require("uuidv4");
const Joi = require("@hapi/joi");
const bcrypt = require("bcryptjs");

const usersSchema = Joi.object({
  id: Joi.string(),
  username: Joi.string().min(3).required(),
  password: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
});

const loginSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().required(),
});

const findOneUser = wrapAsync(async (req, res, next) => {
  const username = req.user.name;
  const foundUser = await UserModel.findOne(
    { username: username },
    "-_id -createdAt -updatedAt -__v"
  );

  if (foundUser) {
    const { password, ...userInfoNoPassword } = foundUser.toObject();
    res.status(200).json(userInfoNoPassword);
  } else {
    const err = new Error("No data found");
    err.statusCode = 404;
    next(err);
  }
});

const createOneUser = wrapAsync(async (req, res, next) => {
  try {
    //joi validation

    const validationResult = await usersSchema.validate(req.body);

    if (validationResult.error) {
      const validationErr = new Error(
        validationResult.error.details[0].message
      );
      validationErr.statusCode = 400;
      throw validationErr;
    }

    const submittedUser = {
      id: uuid(),
      username: req.body.username,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    };

    const user = new UserModel(submittedUser);
    await user.save();

    res.status(201).send(submittedUser);
  } catch (err) {
    next(err);
  }
});

const createCookie = (req, res) => {
  const token = createJWTToken(req.body.username);

  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = oneDay * 7;
  const expiryDate = new Date(Date.now() + oneWeek);

  // Can expiry date on cookie be changed? How about JWT token?

  const cookieName = "token";
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    res.cookie(cookieName, token, {
      //username: username,
      expires: expiryDate,
      httpOnly: true,
      //signed: true,
    });
  } else {
    res.cookie(cookieName, token, {
      //username: username,
      expires: expiryDate,
      httpOnly: true,
      secure: true,
      //signed: true,
    });
  }

  res.status(200).send(`${req.body.username} is now logged in!`);
};

const userValidation = wrapAsync(async (req, res, next) => {
  try {
    const { username, password } = req.body;

    //joi validation

    const validationResult = await loginSchema.validate(req.body);

    if (validationResult.error) {
      const validationErr = new Error(
        validationResult.error.details[0].message
      );
      validationErr.statusCode = 400;
      throw validationErr;
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      throw new Error("Login failed");
    }

    const result = await bcrypt.compare(password, user.password);

    if (!result) {
      throw new Error("Incorrect password");
    }

    next();
  } catch (err) {
    if (err.message === "Login failed") {
      err.statusCode = 400;
    }
    if (err.message === "Incorrect password") {
      err.statusCode = 401;
    }
    next(err);
  }
});

const userLogout = (req, res) => {
  res.clearCookie("token").send("You are now logged out!");
};

module.exports = {
  findOneUser,
  createOneUser,
  createCookie,
  userValidation,
  userLogout,
};
