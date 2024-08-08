const express = require("express");
const apiRouter = require("./routers/api-router");
const followRouter = require("./routers/follow-routers.js");
const {
  handleInvalidInput,
  handleCustomErrors,
  handleInternalErrors,
} = require("./error-handlers");

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Endpoint not found" });
});

app.use(handleInvalidInput);
app.use(handleCustomErrors);
app.use(handleInternalErrors);

module.exports = app;
