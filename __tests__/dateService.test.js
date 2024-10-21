const { normalizeDate } = require("../services/dateService");

describe("Date Normalization", () => {
  it("should normalize dd/MM/yyyy HH:mm:ss format", () => {
    expect(normalizeDate("14/12/2022 18:16:25")).toBe("2022-12-14 18:16:25");
  });

  it("should normalize dd.MM.yyyy H:mm:ss format", () => {
    expect(normalizeDate("17.05.2022 5:28:48")).toBe("2022-05-17 05:28:48");
  });

  it("should normalize d/M/yyyy h:mm:ss a format", () => {
    expect(normalizeDate("8/5/2020 3:08:24 PM")).toBe("2020-05-08 15:08:24");
  });

  it("should return null for unrecognized format", () => {
    expect(normalizeDate("2022-12-14T18:16:25Z")).toBeNull();
  });
});
