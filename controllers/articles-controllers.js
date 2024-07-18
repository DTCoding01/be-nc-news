const {
  fetchArticles,
  fetchArticleById,
  fetchArticleCommentsById,
  addCommentToArticleId,
  updateArticleById,
  addArticle,
} = require("../models/articles.models");
const { checkRowsLength } = require("../utils");

const { checkArticleExists } = require("../utils");

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;
  fetchArticles(sort_by, order, topic)
    .then(({ rows }) => {
      return checkRowsLength(rows);
    })

    .then((articles) => {
      res.status(200).send({ articles });
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
  fetchArticleCommentsById(article_id)
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
