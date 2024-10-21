const request = require("supertest");
const app = require("../app"); // Adjust the path as needed
const User = require("../models/user");

jest.mock("../models/user");

describe("Search By Login Endpoint", () => {
  it("should return 401 if API key is missing", async () => {
    const response = await request(app)
      .post("/api/json/v1/search-by-login")
      .send({ login: "john@gmail.com" });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("error", "Unauthorized");
  });

  it("should return 400 if login is missing", async () => {
    const response = await request(app)
      .post("/api/json/v1/search-by-login")
      .set("api-key", process.env.API_KEY)
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Login is required");
  });

  it("should return results for a valid login", async () => {
    const mockUser = {
      "Stealer Type": "TestStealer",
      "Log date": "17.05.2022 5:28:48",
      Date: "2023-07-23 09:38:30",
      IP: "127.0.0.1",
      Country: "TestCountry",
      Credentials: [
        {
          URL: "https://test.com",
          Username: "john@gmail.com",
          Password: "testpass",
          Application: "TestApp",
        },
      ],
    };

    User.countDocuments.mockResolvedValue(1);
    User.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([mockUser]),
    });

    const response = await request(app)
      .post("/api/json/v1/search-by-login")
      .set("api-key", process.env.API_KEY)
      .send({ login: "john@gmail.com" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("total", 1);
    expect(response.body).toHaveProperty("page", 1);
    expect(response.body.results).toHaveLength(1);
    expect(response.body.results[0]).toHaveProperty(
      "stealer_type",
      "TestStealer"
    );
    expect(response.body.results[0].credentials[0]).toHaveProperty(
      "username",
      "john@gmail.com"
    );
  });
});
