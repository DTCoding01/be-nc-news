exports.handleInvalidInput = (err, req, res, next) => {
  if (!err.code) {
    return next(err);
  }

  const errorCodes = {
    "22P02": "invalid input",
    23503: "invalid input",
  };

  const errorMessage = errorCodes[err.code];
  if (errorMessage) {
    res.status(400).send({ msg: errorMessage });
  } else {
    next(err);
  }
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.handleInternalErrors = (err, req, res, next) => {
  res.status(500).send({ msg: "internal server error" });
};
