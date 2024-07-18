const db = require("../db/connection.js");

exports.fetchArticles = (sort_by = "created_at", order = "desc", topic) => {
  const allowedSortByInputs = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "article_img_url",
  ];

  const allowedOrderInputs = ["ASC", "DESC"];

  const upperCaseOrder = order.toUpperCase();

  if (
    !allowedSortByInputs.includes(sort_by) ||
    !allowedOrderInputs.includes(upperCaseOrder)
  ) {
    return Promise.reject({ status: 400, msg: "invalid input" });
  }

  let queryStr = `
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
    LEFT JOIN comments ON articles.article_id = comments.article_id `;

  const queryValues = [];
  if (topic) {
    queryStr += `WHERE articles.topic = $1 `;
    queryValues.push(topic);
  }

  queryStr += `GROUP BY 
    articles.article_id
  ORDER BY ${sort_by} ${order.toUpperCase()}`;

  return db.query(queryStr, queryValues);
};

exports.fetchArticleById = (article_id) => {
  return db.query(
    `SELECT 
       articles.*,
       COUNT(comments.comment_id) AS comment_count
     FROM articles
     LEFT JOIN comments ON articles.article_id = comments.article_id
     WHERE articles.article_id = $1
     GROUP BY articles.article_id`,
    [article_id]
  );
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

  if (!username || !body) {
    return Promise.reject({ status: 400, msg: "invalid comment input" });
  }

  return db.query(
    `INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *`,
    [username, body, article_id]
  );
};

exports.updateArticleById = (article_id, voteObj) => {
  const { inc_votes } = voteObj;
  if (!inc_votes || typeof inc_votes != "number") {
    return Promise.reject({ status: 400, msg: "invalid input" });
  }
  return db.query(
    `UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *`,
    [inc_votes, article_id]
  );
};

exports.addArticle = (article) => {
  const { author, title, body, topic, article_img_url } = article;

  if (!author || !title || !body || !topic) {
    return Promise.reject({ status: 400, msg: "invalid input" });
  }

  const queryParams = [author, title, body, topic];
  let queryStr = `
  WITH inserted_article AS (
    INSERT INTO articles (author, title, body, topic`;

  if (article_img_url) {
    queryStr += `, article_img_url) VALUES ($1, $2, $3, $4, $5)`;
    queryParams.push(article_img_url);
  } else {
    queryStr += `) VALUES ($1, $2, $3, $4)`;
  }

  queryStr += ` RETURNING article_id, author, title, body, topic, article_img_url, votes, created_at
  )
  SELECT 
    inserted_article.*,
    COUNT(comments.comment_id) AS comment_count
  FROM inserted_article
  LEFT JOIN comments ON inserted_article.article_id = comments.article_id
  GROUP BY 
    inserted_article.article_id,
    inserted_article.author,
    inserted_article.title,
    inserted_article.body,
    inserted_article.topic,
    inserted_article.article_img_url,
    inserted_article.votes,
    inserted_article.created_at`;

  return db.query(queryStr, queryParams);
};
