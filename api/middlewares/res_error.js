export default function (req, res, next) {
  res.error = function (message, code = 200, showToUser = true) {
    if (code === 'EBADCSRFTOKEN') {
      code = 403;
      messaage = "Invalid API Key";
    }
    return res.status(code).json({
      success: false,
      error: message,
      message: message,
      showToUser: showToUser
    });
  };
  next();
}
