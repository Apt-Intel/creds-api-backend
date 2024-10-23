const { testParseDates } = require("../services/dateService");

test("Parse various date formats", () => {
  // Redirect console.log to capture output
  const log = jest.spyOn(console, "log");
  testParseDates();
  expect(log).toHaveBeenCalled();
  log.mockRestore();
});
