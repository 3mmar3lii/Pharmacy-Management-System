// const jwt = require("jsonwebtoken");
// const catchAsync = require("../utils/catchAsync");
// const AppError = require("../utils/AppError");
// const AuthMiddleware = catchAsync((req, res, next) => {
//   // get token
//   const token = req.headers.authorization;
//   if (!token) {
//     return next(new AppError(`no token found please signup`, 403));
//   }
//   // verfify token
//   const decoded = jwt.verify(token, process.env.JSON_WEBTOKEN_KEY);
//   if (!decoded) {
//     return next(new AppError(`No User found !`, 401));
//   }
//   req.userId = decoded.id;
//   req.role = decoded.role;
//   next();
// });

// const restirctTo = (...roles) => {
//   return catchAsync((req, res, next) => {
//     const userRole = req.role;
//     if (!roles.includes(userRole)) {
//       return next(new AppError("Not allowed to perform this action", 403));
//     }
//     next();
//   });
// };
// module.exports = { AuthMiddleware, restirctTo };

const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const AuthMiddleware = catchAsync(async (req, res, next) => {
  // get token
  let token = req.headers.authorization;
  if (token && token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }
  if (!token) {
    return next(new AppError(`no token found please signup`, 403));
  }
  // verfify token
  const decoded = jwt.verify(token, process.env.JSON_WEBTOKEN_KEY);
  if (!decoded) {
    return next(new AppError(`No User found !`, 401));
  }
  req.userId = decoded.id;
  req.role = decoded.role;
  next();
});

const restirctTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    const userRole = req.role;
    if (!roles.includes(userRole)) {
      return next(new AppError("Not allowed to perform this action", 403));
    }
    next();
  });
};
module.exports = { AuthMiddleware, restirctTo };
