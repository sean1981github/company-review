const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bcrypt = require("bcryptjs");

const usersSchema = new Schema(
  {
    id: String,
    username: { type: String, minlength: 3, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: String,
  },
  { timestamps: true }
);

usersSchema.pre("save", async function (next) {
  const rounds = 10;
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

const UsersModel = mongoose.model("UsersModel", usersSchema);
module.exports = UsersModel;
