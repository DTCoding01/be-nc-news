const db = require("../db/connection.js");

exports.fetchArticles = () => {
  return db.query(`
          SELECT
              articles.author,
              articles.title,
              articles.article_id,
              articles.topic,
              articles.created_at,
              articles.votes,
              articles.article_img_url,
              COUNT(comments.comment_id) AS comment_count
          FROM articles
          LEFT JOIN comments ON articles.article_id = comments.article_id
          GROUP BY
              articles.author,
              articles.title,
              articles.article_id,
              articles.topic,
              articles.created_at,
              articles.votes,
              articles.article_img_url
          ORDER BY articles.created_at DESC;
      `);
};

exports.fetchArticleById = (article_id) => {
  return db.query(`SELECT * FROM articles WHERE article_id = $1`, [article_id]);
};

exports.fetchArticleCommentsById = (article_id) => {
  return db.query(
    `SELECT 
    comments.comment_id, 
    comments.votes, 
    comments.created_at, 
    comments.author, 
    comments.body,
    comments.article_id
  FROM comments
  WHERE comments.article_id = $1
  ORDER BY comments.created_at DESC`,
    [article_id]
  );
};

exports.addCommentToArticleId = (comment, article_id) => {
  const { username, body } = comment;


  if (Object.keys(comment).length != 2 || !username || !body) {
    return Promise.reject({ status: 400, msg: "invalid comment input" });
  }

  return db.query(
    `INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *`,
    [username, body, article_id]
  );
};
