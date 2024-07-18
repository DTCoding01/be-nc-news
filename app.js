const express = require("express");
const apiRouter = require("./routers/api-router");
const {
  handleInvalidInput,
  handleCustomErrors,
  handleInternalErrors,
} = require("./error-handlers");
const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "endpoint not found" });
});

app.use(handleInvalidInput);
app.use(handleCustomErrors);
app.use(handleInternalErrors);

module.exports = app;
