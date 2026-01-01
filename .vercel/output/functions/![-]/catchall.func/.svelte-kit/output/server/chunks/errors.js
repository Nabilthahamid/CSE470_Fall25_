class AppError extends Error {
  constructor(message, statusCode = 500, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = "AppError";
  }
}
function handleError(error) {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode
    };
  }
  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500
    };
  }
  return {
    message: "An unknown error occurred",
    statusCode: 500
  };
}
export {
  AppError as A,
  handleError as h
};
