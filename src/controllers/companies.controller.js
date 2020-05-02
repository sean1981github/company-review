const CompaniesModel = require("../models/companies.model");
const UserModel = require("../models/users.model");
const wrapAsync = require("../utils/wrapAsync");
const { uuid } = require("uuidv4");
const Joi = require("@hapi/joi");

const reviewSchema = Joi.object({
  rating: Joi.number().integer().required(),
  title: Joi.string().min(3).required(),
  review: Joi.string().min(3).required(),
});

const findAllCompanies = wrapAsync(async (req, res) => {
  const foundCompanies = await CompaniesModel.find(
    {},
    "-_id -createdAt -updatedAt -__v"
  );

  const strippedCompanies = await foundCompanies.map((value) => {
    const { reviews, ...coyInfoNoReviews } = value.toObject();

    return coyInfoNoReviews;
  });

  return res.status(200).json(strippedCompanies);
});

const findOneCompany = wrapAsync(async (req, res, next) => {
  const id = req.params.id;
  const foundCompany = await CompaniesModel.findOne(
    { id: id },
    "-_id -createdAt -updatedAt -__v"
  );

  if (foundCompany) {
    res.status(200).json(foundCompany);
  } else {
    const err = new Error("No data found");
    err.statusCode = 404;
    next(err);
  }
});

const findUserUsingName = async (req, res, next) => {
  const username = req.user.name;

  const foundUser = await UserModel.findOne(
    { username: username },
    "-_id -createdAt -updatedAt -__v"
  );

  return foundUser.id;
};

const createOneReview = wrapAsync(async (req, res, next) => {
  try {
    //joi validation

    const validationResult = await reviewSchema.validate(req.body);

    if (validationResult.error) {
      const validationErr = new Error(
        validationResult.error.details[0].message
      );
      validationErr.statusCode = 400;
      throw validationErr;
    }

    //console.log("variables setting");
    const companiesToReview = req.params.id;
    // const reviewID = uuid();
    const userID = await findUserUsingName(req).then((data) => {
      return data;
    });

    //console.log("setting addition review");
    const additionalReview = {
      id: uuid(),
      userId: userID,
      username: req.user.name,
      rating: req.body.rating,
      title: req.body.title,
      review: req.body.review,
    };

    const foundCompany = await CompaniesModel.findOne(
      { id: companiesToReview },
      "-_id -createdAt -updatedAt -__v"
    );

    if (!foundCompany) {
      throw new Error("No data found");
    }

    //console.log("foundCompany");
    const { reviews, ...coyInfoNoReviews } = foundCompany.toObject();

    //console.log("reviews:", reviews);
    const newReviewObj = [...reviews, additionalReview];
    //console.log("newReviewObj:", newReviewObj);
    const updatedCompanyReview = await CompaniesModel.findOneAndUpdate(
      { id: companiesToReview },
      { reviews: newReviewObj },
      { new: true, projection: "-_id -createdAt -updatedAt -__v" }
    );
    //console.log("updatedCompanyReview:", updatedCompanyReview);

    res.status(201).json(additionalReview);
  } catch (err) {
    if (err.message === "No data found") {
      err.statusCode = 404;
    }

    next(err);
  }
});

module.exports = {
  findAllCompanies,
  findOneCompany,
  createOneReview,
};
