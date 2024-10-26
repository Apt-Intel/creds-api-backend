class UsageLimitExceededError extends Error {
  constructor(limitType, retryAfter) {
    super(`Usage limit exceeded: ${limitType}`);
    this.name = "UsageLimitExceededError";
    this.limitType = limitType;
    this.retryAfter = retryAfter;
  }
}

module.exports = UsageLimitExceededError;
