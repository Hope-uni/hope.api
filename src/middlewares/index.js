const { verifyToken } = require("./auth.middleware");
const rolePermissions = require("./role-permissions.middleware");


module.exports = {
  verifyToken,
  rolePermissions
}