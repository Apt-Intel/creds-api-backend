const { parseDate } = require("../services/dateService");
const logger = require("../config/logger");

jest.mock("../config/logger");

describe("Date Service with Pagination", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("parseDate", () => {
    it("should handle dates in paginated results", async () => {
      const paginatedData = {
        pagination: {
          total_items: 100,
          current_page: 1,
          page_size: 10,
        },
        results: [
          { "Log date": "17.05.2022 5:28:48" },
          { "Log date": "18.05.2022 6:30:00" },
        ],
      };

      const expectedResults = [
        { "Log date": "2022-05-17T05:28:48.000Z" },
        { "Log date": "2022-05-18T06:30:00.000Z" },
      ];

      for (let i = 0; i < paginatedData.results.length; i++) {
        const parsedDate = await parseDate(
          paginatedData.results[i]["Log date"]
        );
        expect(parsedDate).toBe(expectedResults[i]["Log date"]);
      }
    });

    it("should handle dates in bulk paginated results", async () => {
      const bulkPaginatedData = {
        pagination: {
          total_items: 150,
          current_page: 1,
          page_size: 10,
        },
        results: [
          {
            item: "test1",
            data: [{ "Log date": "17.05.2022 5:28:48" }],
          },
          {
            item: "test2",
            data: [{ "Log date": "18.05.2022 6:30:00" }],
          },
        ],
      };

      const expectedDates = [
        "2022-05-17T05:28:48.000Z",
        "2022-05-18T06:30:00.000Z",
      ];

      for (let i = 0; i < bulkPaginatedData.results.length; i++) {
        const parsedDate = await parseDate(
          bulkPaginatedData.results[i].data[0]["Log date"]
        );
        expect(parsedDate).toBe(expectedDates[i]);
      }
    });
  });
});
