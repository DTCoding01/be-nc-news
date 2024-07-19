const articlesRouter = require('express').Router();
const {
  getArticles,
  getArticleById,
  getArticleCommentsById,
  postCommentToArticleId,
  patchArticleById,
  postArticle,
  deleteArticleById,
  deleteArticleCommentsById
} = require('../controllers/articles-controllers');

articlesRouter.get('/', getArticles);
articlesRouter.get('/:article_id', getArticleById);
articlesRouter.get('/:article_id/comments', getArticleCommentsById);
articlesRouter.post('/', postArticle)
articlesRouter.post('/:article_id/comments', postCommentToArticleId);
articlesRouter.patch('/:article_id', patchArticleById);
articlesRouter.delete('/:article_id', deleteArticleById)
articlesRouter.delete('/:article_id/comments', deleteArticleCommentsById)
module.exports = articlesRouter;
