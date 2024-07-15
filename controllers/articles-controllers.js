const { fetchArticles, fetchArticleById } = require("../models/articles.models");

exports.getArticles = (req, res, next) => {
  fetchArticles()
    .then(({ rows }) => {
      res.status(200).send({ rows });
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
