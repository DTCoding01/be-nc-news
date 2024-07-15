const {
  fetchArticles,
  fetchArticleById,
  fetchArticleCommentsById,
  addCommentToArticleId,
} = require("../models/articles.models");

exports.getArticles = (req, res, next) => {
  fetchArticles()
    .then(({ rows }) => {
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

  fetchArticleById(article_id)
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }

      return addCommentToArticleId(comment, article_id);
    })
    .then(({ rows }) => {
      const comment = rows[0];
      res.status(201).send({ comment });
    })
    .catch(next);
};
