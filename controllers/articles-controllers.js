const {
  fetchArticles,
  fetchArticleById,
  fetchArticleCommentsById,
  addCommentToArticleId,
  updateArticleById,
} = require("../models/articles.models");

const { checkArticleExists } = require("../utils");

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;
  fetchArticles(sort_by, order, topic)
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      res.status(200).send({ articles: rows });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      const article = rows[0];
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticleCommentsById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleCommentsById(article_id)
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      res.status(200).send({ comments: rows });
    })
    .catch(next);
};

exports.postCommentToArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const comment = req.body;

  checkArticleExists(article_id)
    .then(() => {
      return addCommentToArticleId(comment, article_id);
    })
    .then(({ rows }) => {
      const comment = rows[0];
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const voteObj = req.body;
  checkArticleExists(article_id)
    .then(() => {
      return updateArticleById(article_id, voteObj);
    })
    .then(({ rows }) => {
      const article = rows[0];
      res.status(200).send({ article });
    })
    .catch(next);
};
