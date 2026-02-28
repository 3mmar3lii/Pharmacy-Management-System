const jwt = require("jsonwebtoken");
async function AuthMiddleware(req, res, next) {
  try {
    // get token
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ msg: "no token found please signup" });
    }
    // verfify token
    const decoded = jwt.verify(token, process.env.JSON_WEBTOKEN_KEY);
    if (!decoded) {
      return res.status(401).json({ msg: "No User found !" });
    }
    req.userId = decoded.id;
    req.role = decoded.role;
    console.log("----Finish AuthMiddleware data injected into the request----");
    next();
  } catch (err) {
    console.log("Error", err);
    return res.status(403).json({ msg: "Error in auth middleware" });
  }
}


const restirctTo = (...roles) => {
  return (req, res, next) => {
    const userRole = req.role;

    if (!roles.includes(userRole)) {
      return res
        .status(403)
        .json({ msg: "Not allowed to perform this action" });
    }

    next();
  };
};
module.exports = {AuthMiddleware,restirctTo};
