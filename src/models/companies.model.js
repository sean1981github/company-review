const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var reviewsSchema = Schema({
  id: String,
  userId: String,
  username: { type: String, required: true },
  rating: { type: Number, required: true },
  title: { type: String, required: true },
  review: { type: String, required: true },
  _id: false,
});

const companiesSchema = new Schema(
  {
    id: String,
    companyName: {
      type: String,
      required: true,
      minlength: 3,
      unique: true,
    },
    companySuffix: String,
    numberOfEmployees: Number,
    description: String,
    reviews: [reviewsSchema],
  },
  { timestamps: true }
);

const CompaniesModel = mongoose.model("CompaniesModel", companiesSchema);
module.exports = CompaniesModel;
