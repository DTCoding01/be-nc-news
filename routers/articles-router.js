const articlesRouter = require('express').Router();
const {
  getArticles,
  getArticleById,
  getArticleCommentsById,
  postCommentToArticleId,
  patchArticleById,
  postArticle
} = require('../controllers/articles-controllers');

articlesRouter.get('/', getArticles);
articlesRouter.get('/:article_id', getArticleById);
articlesRouter.get('/:article_id/comments', getArticleCommentsById);
articlesRouter.post('/', postArticle)
articlesRouter.post('/:article_id/comments', postCommentToArticleId);
articlesRouter.patch('/:article_id', patchArticleById);

module.exports = articlesRouter;
