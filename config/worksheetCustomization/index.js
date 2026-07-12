const variableRegistry = require("./variables");
const familyRegistry = require("./families");

module.exports = {
  ...variableRegistry,
  ...familyRegistry
};
