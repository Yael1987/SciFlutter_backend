import "dotenv/config";

export default class ErrorController {
  environment;
  errorStatusCode = 500;
  errorStatus = "error";
  errorName;
  errorCode;

  constructor(environment) {
    this.environment = environment;
  }

  handleError(err, req, res) {
    this.errorStatusCode = err.statusCode || this.errorStatusCode;
    this.errorStatus = err.status || this.errorStatus;
    this.error = Object.assign(err);

    if (this.environment === "production") {
      console.log("Error");
    } else if (this.environment === "development") {
      this.sendErrorDev(req, res);
    }
  }

  sendErrorDev(req, res) {
    res.status(this.errorStatusCode).json({
      success: false,
      status: this.errorStatus,
      error: this.error,
      message: this.error.message,
      stack: this.error.stack,
    });
  }
}

const errorController = new ErrorController(process.env.NODE_ENV);

export const globalErrorHandler = (err, req, res, next) => {
  errorController.handleError(err, req, res);
}