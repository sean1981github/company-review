const request = require("supertest");
const app = require("./app");
const { teardownMongoose } = require("./utils/testTearDownMongoose");

describe("App", () => {
  afterAll(async () => {
    await teardownMongoose();
  });

  it("Testing to see if Jest works", () => {
    expect(1).toBe(1);
  });

  it("GET / should return JSON object of all endpoints", async () => {
    const expectedValue = {
      "0": "GET /",
      "1": "GET /companies",
      "2": "GET /companies/:id",
      "3": "POST /companies/:id/reviews",
      "4": "GET /user",
      "5": "POST /user/register",
      "6": "POST /user/login",
      "7": "POST /user/logout",
    };

    const { body: endpointValue } = await request(app).get("/").expect(200);

    expect(endpointValue).toEqual(expectedValue);
  });

  // // it("POST /govtechies/presenters should add a person and return a new presenter object", async () => {
  // //   const newPerson = { name: "Sean" };
  // //   const expectedValue = { id: 2, name: "Sean" };

  // //   const { body: endpointValue } = await request(app)
  // //     .post("/govtechies/presenters")
  // //     .send(newPerson)
  // //     .expect(201);

  // //   //console.log(endpointValue);
  // //   expect(endpointValue).toEqual(expectedValue);
  //  });
});
