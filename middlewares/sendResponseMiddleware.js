const logger = require("../config/logger");

const sendResponseMiddleware = (req, res) => {
  if (req.searchResults) {
    return res.json(req.searchResults);
  } else {
    return res.status(204).send();
  }
};

module.exports = sendResponseMiddleware;
