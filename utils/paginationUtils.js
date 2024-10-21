const DEFAULT_PAGE_SIZE = 50;

function getPaginationParams(page, pageSize = DEFAULT_PAGE_SIZE) {
  const limit = pageSize;
  const skip = (page - 1) * limit;
  return { limit, skip };
}

module.exports = {
  getPaginationParams,
};
