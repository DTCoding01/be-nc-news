const {
  fetchArticles,
  fetchArticleById,
  fetchArticleCommentsById,
  addCommentToArticleId,
  updateArticleById,
  addArticle,
  removeArticleById,
  removeCommentsByArticleId,
} = require("../models/articles.models");
const { checkRowsLength } = require("../utils");
const { checkArticleExists } = require("../utils");

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic, limit, p } = req.query;

  fetchArticles(sort_by, order, topic, limit, p)
    .then(({ articles, total_count }) => {
      return Promise.all([checkRowsLength(articles), total_count]);
    })
    .then(([articles, total_count]) => {
      res.status(200).send({ articles, total_count });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then(({ rows }) => {
      return checkRowsLength(rows);
    })
    .then((rows) => {
      const article = rows[0];
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticleCommentsById = (req, res, next) => {
  const { article_id } = req.params;
  const { limit, p } = req.query;

  fetchArticleCommentsById(article_id, limit, p)
    .then(({ rows }) => {
      return checkRowsLength(rows);
    })
    .then((comments) => {
      res.status(200).send({ comments });
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

exports.postArticle = (req, res, next) => {
  const article = req.body;
  addArticle(article)
    .then(({ rows }) => {
      const post = rows[0];
      res.status(201).send({ post });
    })
    .catch(next);
};

exports.deleteArticleById = (req, res, next) => {
  const { article_id } = req.params;
  checkArticleExists(article_id)
    .then(() => {
      return removeCommentsByArticleId(article_id);
    })
    .then(() => {
      return removeArticleById(article_id);
    })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};

exports.deleteArticleCommentsById = (req, res, next) => {
  const { article_id } = req.params;
  checkArticleExists(article_id)
    .then(() => {
      return removeCommentsByArticleId(article_id);
    })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};