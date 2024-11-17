const documentRedesignDomainMiddleware = require("../middlewares/documentRedesignDomainMiddleware");

describe("Document Redesign Domain Middleware", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      searchResults: {
        results: [
          {
            "Folder Name": "TestFolder",
            "Build ID": "TestBuild",
            Hash: "TestHash",
            Usernames: ["user1", "user2"],
            Domains: ["example.com"],
            Emails: ["user@example.com"],
            Employee: ["employee@example.com"],
            Credentials: [
              {
                URL: "https://example.com",
                Username: "user@example.com",
                Password: "password123",
              },
              {
                URL: "https://othersite.com",
                Username: "user@example.com",
                Password: "password456",
              },
              {
                URL: "https://thirdsite.com",
                Username: "user@thirdsite.com",
                Password: "password789",
              },
            ],
            OtherField: "TestValue",
          },
        ],
      },
      query: { domain: "example.com" },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it("should correctly categorize credentials for single domain search", async () => {
    await documentRedesignDomainMiddleware(mockReq, mockRes, mockNext);

    expect(mockReq.searchResults.results[0]).not.toHaveProperty("Folder Name");
    expect(mockReq.searchResults.results[0]).not.toHaveProperty("Build ID");
    expect(mockReq.searchResults.results[0]).not.toHaveProperty("Hash");
    expect(mockReq.searchResults.results[0]).not.toHaveProperty("Usernames");
    expect(mockReq.searchResults.results[0]).not.toHaveProperty("Domains");
    expect(mockReq.searchResults.results[0]).not.toHaveProperty("Emails");
    expect(mockReq.searchResults.results[0]).not.toHaveProperty("Employee");

    expect(mockReq.searchResults.results[0].InternalCredentials).toHaveLength(
      1
    );
    expect(mockReq.searchResults.results[0].ExternalCredentials).toHaveLength(
      1
    );
    expect(mockReq.searchResults.results[0].OtherCredentials).toHaveLength(1);

    expect(mockReq.searchResults.results[0].OtherField).toBe("TestValue");

    expect(mockNext).toHaveBeenCalled();
  });

  // Additional tests...
});
