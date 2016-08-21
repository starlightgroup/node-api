export default function (req, res, next) {
  res.error = function (message, code = 200, showToUser = true) {
    return res.status(code).json({
      success: false,
      error: message,
      message: message,
      showToUser: showToUser
    });
  };
  next();
}
