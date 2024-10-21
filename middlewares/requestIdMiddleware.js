const { v4: uuidv4 } = require("uuid");
const cls = require("cls-hooked");

const namespace = cls.createNamespace("request-context");

const requestIdMiddleware = (req, res, next) => {
  namespace.run(() => {
    const requestId = uuidv4();
    namespace.set("requestId", requestId);
    res.setHeader("X-Request-Id", requestId);
    next();
  });
};

module.exports = { requestIdMiddleware, namespace };
