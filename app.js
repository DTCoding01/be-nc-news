const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics-controllers");
const { getApi } = require("./controllers/api-controllers");
const {
  getArticles,
  getArticleById,
  getArticleCommentsById,
  postCommentToArticleId, 
  patchArticleById
} = require("./controllers/articles-controllers");
const {deleteCommentById} = require('./controllers/comments-controllers')

app.use(express.json())

app.get("/api/topics", getTopics);

app.get("/api", getApi);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getArticleCommentsById);

app.post("/api/articles/:article_id/comments", postCommentToArticleId)

app.patch("/api/articles/:article_id", patchArticleById)

app.delete('/api/comments/:comment_id', deleteCommentById)

app.use((err, req, res, next) => {
  if (!err.code) {
    return next(err);
  }
  if (err.code === "22P02") {
    res.status(400).send({ msg: "invalid input" });
  }
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(500).send({ msg: "internal server error" });
  }
});

module.exports = app;
