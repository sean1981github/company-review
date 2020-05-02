const request = require("supertest");
const app = require("../app");
const { teardownMongoose } = require("../utils/testTearDownMongoose");
const usersData = require("../../data/user.data");
const UsersModel = require("../models/users.model");

jest.mock("jsonwebtoken");
const jwt = require("jsonwebtoken");

describe("User Route", () => {
  let signedInAgent;
  afterAll(async () => {
    await teardownMongoose();
  });

  beforeEach(async () => {
    await UsersModel.create(usersData);

    const defaultLoginUser = { username: "humburn", password: "123456789" };

    jwt.verify.mockReturnValueOnce({
      name: "humburn",
    }); //to mock DB login

    signedInAgent = request.agent(app);
    const response = await signedInAgent
      .post("/user/login")
      .send(defaultLoginUser);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await UsersModel.deleteMany();
  });

  it("GET / should return information about who you are logged in as", async () => {
    const { password, ...userInfoNoPassword } = usersData[0]; // This will remove the password

    const expectedValue = userInfoNoPassword;

    jwt.verify.mockReturnValueOnce({
      name: "humburn",
    }); //to mock DB login

    const { body: actualValue } = await signedInAgent
      .get("/user")
      //.set("Cookie", "token=valid-token")
      .expect(200);

    expect(jwt.verify).toBeCalledTimes(1);
    expect(actualValue).toEqual(expectedValue);
  });

  it("POST /register should return information with id when successful", async () => {
    const regValue = {
      username: "aberkhoo",
      firstName: "Aber",
      lastName: "Khoo",
      password: "123456789",
      email: "Aber_Hoo@gmail.com",
    };

    const { body: actualValue } = await request(app)
      .post("/user/register")
      .send(regValue)
      .expect(201);

    const { id, ...otherProperties } = actualValue;

    expect(actualValue).toHaveProperty("id");
    expect(otherProperties).toEqual(regValue);
  });

  it("POST /register should return 400 validation error when fail info validation during registering", async () => {
    const regValue = {
      username: "ab",
      firstName: "Aber",
      lastName: "Khoo",
      password: "123456789",
      email: "Aber_Hoo@gmail.com",
    };

    const { body: errorMsg } = await request(app)
      .post("/user/register")
      .send(regValue)
      .expect(400);

    expect(errorMsg.error).toEqual(
      `"username" length must be at least 3 characters long`
    );
  });

  it("POST /login should login user if password is correct", async () => {
    const loginUser = { username: "humburn", password: "123456789" };

    const { text: loginMsg } = await request(app)
      .post("/user/login")
      .send(loginUser)
      .expect(200);

    expect(loginMsg).toEqual(`${loginUser.username} is now logged in!`);
  });

  it("POST /login should return 400 when fail login schema validation", async () => {
    const loginUser = { username: "hu", password: "123456789" };

    const { body: loginMsg } = await request(app)
      .post("/user/login")
      .send(loginUser)
      .expect(400);

    expect(loginMsg.error).toEqual(
      `"username" length must be at least 3 characters long`
    );
  });

  it("POST /login should return 400 when cannot find user to login", async () => {
    const loginUser = { username: "incorrectName", password: "123456789" };

    const { body: loginMsg } = await request(app)
      .post("/user/login")
      .send(loginUser)
      .expect(400);

    expect(loginMsg.error).toEqual(`Login failed`);
  });

  it("POST /login should return 401 when incorrect password", async () => {
    const loginUser = { username: "humburn", password: "wrongPassword" };

    const { body: loginMsg } = await request(app)
      .post("/user/login")
      .send(loginUser)
      .expect(401);

    expect(loginMsg.error).toEqual(`Incorrect password`);
  });

  it("POST /logout should logout users", async () => {
    const response = await request(app).post("/user/logout").expect(200);

    expect(response.text).toEqual("You are now logged out!");
    expect(response.headers["set-cookie"][0]).toMatch(/^token=;/);
  });
});
