const request = require("supertest");
const app = require("../app"); // Adjust the path as needed
const User = require("../models/user");
const {
  internalSearchByLogin,
} = require("../controllers/internal/loginController");
const { getDatabase } = require("../config/database");
const logger = require("../config/logger");
const {
  DEFAULT_PAGE_SIZE,
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
} = require("../config/constants");

jest.mock("../models/user");
jest.mock("../config/database");
jest.mock("../config/logger");

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

describe("internalSearchByLogin", () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let mockCollection;
  let mockDb;

  beforeEach(() => {
    mockCollection = {
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
      countDocuments: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    getDatabase.mockResolvedValue(mockDb);

    mockReq = {
      query: {},
      body: {},
      requestId: "test-request-id",
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Pagination Tests", () => {
    it("should use default pagination values when none provided", async () => {
      // Arrange
      mockReq.query.login = "testuser";
      mockCollection.toArray.mockResolvedValue([]);
      mockCollection.countDocuments.mockResolvedValue(0);

      // Act
      await internalSearchByLogin(mockReq, mockRes, mockNext);

      // Assert
      expect(mockCollection.skip).toHaveBeenCalledWith(0);
      expect(mockCollection.limit).toHaveBeenCalledWith(DEFAULT_PAGE_SIZE);
    });

    it("should use provided page_size within limits", async () => {
      // Arrange
      mockReq.query = {
        login: "testuser",
        page: "1",
        page_size: "25",
      };
      mockCollection.toArray.mockResolvedValue([]);
      mockCollection.countDocuments.mockResolvedValue(0);

      // Act
      await internalSearchByLogin(mockReq, mockRes, mockNext);

      // Assert
      expect(mockCollection.skip).toHaveBeenCalledWith(0);
      expect(mockCollection.limit).toHaveBeenCalledWith(25);
    });

    it("should handle invalid page_size parameter", async () => {
      // Arrange
      mockReq.query = {
        login: "testuser",
        page_size: "invalid",
      };

      // Act
      await internalSearchByLogin(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: [
          "Invalid 'page_size' parameter. Must be an integer between 1 and 50.",
        ],
      });
    });

    it("should handle page_size exceeding maximum limit", async () => {
      // Arrange
      mockReq.query = {
        login: "testuser",
        page_size: (MAX_PAGE_SIZE + 1).toString(),
      };

      // Act
      await internalSearchByLogin(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: [
          "Invalid 'page_size' parameter. Must be an integer between 1 and 50.",
        ],
      });
    });

    it("should handle page_size below minimum limit", async () => {
      // Arrange
      mockReq.query = {
        login: "testuser",
        page_size: "0",
      };

      // Act
      await internalSearchByLogin(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: [
          "Invalid 'page_size' parameter. Must be an integer between 1 and 50.",
        ],
      });
    });

    it("should calculate correct skip value for pagination", async () => {
      // Arrange
      mockReq.query = {
        login: "testuser",
        page: "3",
        page_size: "10",
      };
      mockCollection.toArray.mockResolvedValue([]);
      mockCollection.countDocuments.mockResolvedValue(0);

      // Act
      await internalSearchByLogin(mockReq, mockRes, mockNext);

      // Assert
      expect(mockCollection.skip).toHaveBeenCalledWith(20); // (page-1) * page_size
      expect(mockCollection.limit).toHaveBeenCalledWith(10);
    });

    it("should include pagination metadata in response", async () => {
      // Arrange
      mockReq.query = {
        login: "testuser",
        page: "2",
        page_size: "10",
      };
      const mockResults = [{ id: 1 }, { id: 2 }];
      mockCollection.toArray.mockResolvedValue(mockResults);
      mockCollection.countDocuments.mockResolvedValue(25);

      // Act
      await internalSearchByLogin(mockReq, mockRes, mockNext);

      // Assert
      expect(mockReq.searchResults).toEqual(
        expect.objectContaining({
          pagination: expect.objectContaining({
            total_items: 25,
            total_pages: 3,
            current_page: 2,
            page_size: 10,
            has_next_page: true,
            has_previous_page: true,
            next_page: 3,
            previous_page: 1,
          }),
        })
      );
    });
  });
});
