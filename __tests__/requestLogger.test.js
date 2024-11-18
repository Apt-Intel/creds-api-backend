const requestLogger = require("../middlewares/requestLogger");
const logger = require("../config/logger");
const { DEFAULT_PAGE_SIZE } = require("../config/constants");

jest.mock("../config/logger");

describe("requestLogger Middleware", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      method: "GET",
      path: "/api/test",
      query: {},
      body: {},
      requestId: "test-request-id",
      apiKeyData: { id: "test-api-key" },
    };

    mockRes = {
      statusCode: 200,
      on: jest.fn((event, callback) => {
        if (event === "finish") {
          callback();
        }
      }),
    };

    mockNext = jest.fn();

    // Clear all mock calls
    jest.clearAllMocks();
  });

  it("should log request with default pagination values", () => {
    requestLogger(mockReq, mockRes, mockNext);

    expect(logger.info).toHaveBeenCalledWith(
      "API Request",
      expect.objectContaining({
        method: "GET",
        path: "/api/test",
        pagination: {
          page: 1,
          page_size: DEFAULT_PAGE_SIZE,
        },
      })
    );
  });

  it("should log request with custom pagination values", () => {
    mockReq.query = {
      page: "2",
      page_size: "20",
    };

    requestLogger(mockReq, mockRes, mockNext);

    expect(logger.info).toHaveBeenCalledWith(
      "API Request",
      expect.objectContaining({
        pagination: {
          page: 2,
          page_size: 20,
        },
      })
    );
  });

  it("should sanitize sensitive data in request body", () => {
    mockReq.body = {
      username: "test",
      password: "secret",
      api_key: "sensitive",
    };

    requestLogger(mockReq, mockRes, mockNext);

    expect(logger.info).toHaveBeenCalledWith(
      "API Request",
      expect.objectContaining({
        body: {
          username: "test",
          password: "[REDACTED]",
          api_key: "[REDACTED]",
        },
      })
    );
  });

  it("should log response with timing information", () => {
    jest.useFakeTimers();
    const startTime = Date.now();

    requestLogger(mockReq, mockRes, mockNext);

    // Simulate some time passing
    jest.advanceTimersByTime(100);

    expect(logger.info).toHaveBeenCalledWith(
      "API Response",
      expect.objectContaining({
        statusCode: 200,
        responseTime: "100ms",
        pagination: {
          page: 1,
          page_size: DEFAULT_PAGE_SIZE,
        },
      })
    );

    jest.useRealTimers();
  });

  it("should handle bulk operation requests", () => {
    mockReq.body = {
      items: [
        { username: "test1", password: "secret1" },
        { username: "test2", password: "secret2" },
      ],
    };

    requestLogger(mockReq, mockRes, mockNext);

    expect(logger.info).toHaveBeenCalledWith(
      "API Request",
      expect.objectContaining({
        body: {
          items: [
            { username: "test1", password: "[REDACTED]" },
            { username: "test2", password: "[REDACTED]" },
          ],
        },
      })
    );
  });

  it("should call next middleware", () => {
    requestLogger(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
