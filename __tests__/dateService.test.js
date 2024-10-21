const { parseDate } = require("../services/dateService");

describe("Date Normalization", () => {
  it("should normalize dd.MM.yyyy H:mm:ss format", () => {
    expect(parseDate("17.05.2022 5:28:48")).toBe("2022-05-17 05:28:48");
  });

  it("should normalize d/M/yyyy h:mm:ss a format", () => {
    expect(parseDate("8/5/2020 3:08:24 PM")).toBe("2020-05-08 15:08:24");
  });

  it("should normalize yyyy-MM-dd'T'HH:mm:ss.SSSX format", () => {
    expect(parseDate("2022-05-17T05:28:48.375Z")).toBe("2022-05-17 05:28:48");
  });

  it("should return original string for unrecognized format", () => {
    expect(parseDate("2022-12-14T18:16:25Z")).toBe("2022-12-14T18:16:25Z");
  });
});
