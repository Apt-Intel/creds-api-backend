const { parseDate } = require("../services/dateService");

const normalizeData = async (data) => {
  if (Array.isArray(data)) {
    return Promise.all(data.map(normalizeData));
  }
  if (typeof data === "object" && data !== null) {
    const newData = { ...data };
    if ("Log date" in newData) {
      newData["Log date"] = await parseDate(newData["Log date"]);
    }
    if ("data" in newData && Array.isArray(newData.data)) {
      newData.data = await Promise.all(newData.data.map(normalizeData));
    }
    return newData;
  }
  return data;
};

const sortData = (data, sortBy, sortOrder) => {
  if (Array.isArray(data)) {
    return data
      .map((item) => sortData(item, sortBy, sortOrder))
      .sort((a, b) => {
        const dateA = new Date(a[sortBy]);
        const dateB = new Date(b[sortBy]);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  }
  if (typeof data === "object" && data !== null) {
    const newData = { ...data };
    if ("data" in newData && Array.isArray(newData.data)) {
      newData.data = sortData(newData.data, sortBy, sortOrder);
    }
    return newData;
  }
  return data;
};

module.exports = {
  normalizeData,
  sortData,
};
