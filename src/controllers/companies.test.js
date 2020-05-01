const request = require("supertest");
const app = require("../app");
const { teardownMongoose } = require("../utils/testTearDownMongoose");
const companiesData = require("../../data/company.data");
const CompaniesModel = require("../models/companies.model");
const usersData = require("../../data/user.data");
const UsersModel = require("../models/users.model");

jest.mock("jsonwebtoken");
const jwt = require("jsonwebtoken");

describe("Companies Route", () => {
  // let signedInAgent;
  afterAll(async () => {
    await teardownMongoose();
  });

  beforeEach(async () => {
    await UsersModel.create(usersData);
    await CompaniesModel.create(companiesData);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await CompaniesModel.deleteMany();
    await UsersModel.deleteMany();
  });

  it("GET / should return JSON object of all companies without reviews (and no _id, __v)", async () => {
    const expectedValue = companiesData.map((value) => {
      const { reviews, ...coyInfoNoReviews } = value;

      return coyInfoNoReviews;
    }); // This will remove the reviews

    const { body: actualValue } = await request(app)
      .get("/companies/")
      .expect(200);

    expect(actualValue).toEqual(expectedValue);
  });

  it("GET /:id return JSON object of company with corresponding ID including its reviews", async () => {
    const companyID = companiesData[0].id;
    const expectedValue = companiesData[0]; // this will be the first company in the test data

    const { body: actualValue } = await request(app)
      .get(`/companies/${companyID}`)
      .expect(200);

    expect(actualValue).toEqual(expectedValue);
  });

  it("GET /:id return 404 error if no company found", async () => {
    const companyID = "Invalid ID";
    const expectedValue = "No data found";
    const { body: actualValue } = await request(app)
      .get(`/companies/${companyID}`)
      .expect(404);

    expect(actualValue.error).toEqual(expectedValue);
  });

  it("POST /:id/review should add a review to the correct company when user is authorised", async () => {
    const companyID = companiesData[0].id;
    const review = {
      rating: 3,
      title: "another Title",
      review: "another review",
    };

    const expectedValue = {
      userId: "754aece9-64bf-42ab-b91c-bb65e2db3a37",
      username: "humburn",
      rating: 3,
      title: "another Title",
      review: "another review",
    };

    jwt.verify.mockReturnValueOnce({
      name: "humburn",
    }); //to mock DB login

    const { body: actualValue } = await request(app)
      .post(`/companies/${companyID}/reviews`)
      .send(review)
      .set("Cookie", "token=valid-token")
      .expect(201);

    // const { body: actualUser } = await signedInAgent
    //   .get(versionRoute + `/users/${expectedUsername}`)
    //   //.set("Cookie", "token=valid-token")
    //   .expect(200);

    expect(jwt.verify).toBeCalledTimes(1);
    expect(actualValue).toMatchObject(expectedValue);
  });

  it("POST /:id/review should respond with error 400 when required property not given", async () => {
    const companyID = companiesData[0].id;
    const review = {
      rating: 3,
      title: "another Title",
    };
    const expectedValue = `"review" is required`;

    jwt.verify.mockReturnValueOnce({
      name: "humburn",
    }); //to mock DB login

    const { body: actualValue } = await request(app)
      .post(`/companies/${companyID}/reviews`)
      .send(review)
      .set("Cookie", "token=valid-token")
      .expect(400);

    // const { body: actualUser } = await signedInAgent
    //   .get(versionRoute + `/users/${expectedUsername}`)
    //   //.set("Cookie", "token=valid-token")
    //   .expect(200);

    expect(jwt.verify).toBeCalledTimes(1);
    expect(actualValue.error).toEqual(expectedValue);
  });

  it("POST /:id/review should deny access when no token is provided", async () => {
    const companyID = companiesData[0].id;
    const review = {
      rating: 3,
      title: "another Title",
      review: "another review",
    };
    const expectedValue = `You are not authorized`;

    const { body: actualValue } = await request(app)
      .post(`/companies/${companyID}/reviews`)
      .send(review)
      .expect(401);

    // const { body: actualUser } = await signedInAgent
    //   .get(versionRoute + `/users/${expectedUsername}`)
    //   //.set("Cookie", "token=valid-token")
    //   .expect(200);

    expect(actualValue.error).toEqual(expectedValue);
  });

  it("POST /:id/review should deny access when token is invalid", async () => {
    const companyID = companiesData[0].id;
    const review = {
      rating: 3,
      title: "another Title",
      review: "another review",
    };
    const expectedValue = `You are not authorized`;

    jwt.verify.mockReturnValueOnce({
      name: "humburn",
    }); //to mock DB login

    const { body: actualValue } = await request(app)
      .post(`/companies/${companyID}/reviews`)
      .send(review)
      .set("Cookie", "invalidtoken=invalid-token")
      .expect(401);

    // const { body: actualUser } = await signedInAgent
    //   .get(versionRoute + `/users/${expectedUsername}`)
    //   //.set("Cookie", "token=valid-token")
    //   .expect(200);

    expect(jwt.verify).toBeCalledTimes(0);
    expect(actualValue.error).toEqual(expectedValue);
  });
});
